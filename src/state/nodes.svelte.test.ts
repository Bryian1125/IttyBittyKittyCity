import { beforeEach, describe, expect, it } from 'vitest';
import { COLLECTION, RESOURCES, type ResourceId } from '../lib/balance';
import { NODE_SPECS, type NodeKind, type NodeSpec } from '../lib/nodes';
import {
	addCarried,
	getCarried,
	getCarryCapacity,
	takeCarried,
} from './carry.svelte';
import {
	nodeViews,
	tickNodes,
	tryCollectNode,
	type NodeView,
} from './nodes.svelte';
import { addResource, getResource, spendResource } from './resources.svelte';

/** Restores a known amount through the public API only. */
function setResource(id: ResourceId, amount: number): void {
	spendResource(id, getResource(id));
	addResource(id, amount);
}

/** The canonical node of a kind; the specs guarantee three of each. */
function specOfKind(kind: NodeKind): NodeSpec {
	const spec = NODE_SPECS.find((candidate) => candidate.kind === kind);
	if (spec === undefined) throw new Error(`no ${kind} node`);
	return spec;
}

/** The live view of a node, failing loudly when the id is unknown. */
function viewOf(id: string): NodeView {
	const view = nodeViews().find((candidate) => candidate.id === id);
	if (view === undefined) throw new Error(`no view for ${id}`);
	return view;
}

describe('resource nodes', () => {
	beforeEach(() => {
		takeCarried(getCarried());
		for (const id of Object.keys(RESOURCES) as ResourceId[]) {
			setResource(id, RESOURCES[id].starting);
		}
		// Clears every cooldown: a successful collect never exceeds it.
		tickNodes(COLLECTION.cooldownSeconds);
	});

	it('exposes one available view per spec', () => {
		expect(nodeViews()).toHaveLength(NODE_SPECS.length);

		for (const spec of NODE_SPECS) {
			expect(viewOf(spec.id)).toEqual({
				id: spec.id,
				x: spec.position.x,
				z: spec.position.z,
				label: spec.label,
				available: true,
			});
		}
	});

	it('collects Raw Minerals into the carried load and starts the cooldown', () => {
		const spec = specOfKind('mineral');

		expect(tryCollectNode(spec.id)).toEqual({ text: '+3 Raw Minerals' });
		expect(getCarried()).toBe(COLLECTION.yieldPerCollect);
		expect(viewOf(spec.id).available).toBe(false);
	});

	it('routes each kind to its own target', () => {
		const foodBefore = getResource('food');
		const h3Before = getResource('h3');

		expect(tryCollectNode(specOfKind('food').id)).toEqual({ text: '+3 Food' });
		expect(getResource('food')).toBe(foodBefore + COLLECTION.yieldPerCollect);

		expect(tryCollectNode(specOfKind('h3').id)).toEqual({ text: '+3 H3' });
		expect(getResource('h3')).toBe(h3Before + COLLECTION.yieldPerCollect);

		expect(getCarried()).toBe(0);
	});

	it('blocks a second collect until the cooldown is ticked down', () => {
		const spec = specOfKind('h3');
		const before = getResource('h3');
		tryCollectNode(spec.id);

		expect(tryCollectNode(spec.id)).toBeNull();
		expect(getResource('h3')).toBe(before + COLLECTION.yieldPerCollect);

		tickNodes(COLLECTION.cooldownSeconds - 1);
		expect(viewOf(spec.id).available).toBe(false);
		expect(tryCollectNode(spec.id)).toBeNull();

		tickNodes(1);
		expect(viewOf(spec.id).available).toBe(true);
		expect(tryCollectNode(spec.id)).toEqual({ text: '+3 H3' });
		expect(getResource('h3')).toBe(before + 2 * COLLECTION.yieldPerCollect);
	});

	it('cools nodes down independently', () => {
		const first = specOfKind('mineral');
		const second = specOfKind('food');

		tryCollectNode(first.id);
		tickNodes(COLLECTION.cooldownSeconds / 2);

		expect(viewOf(first.id).available).toBe(false);
		expect(viewOf(second.id).available).toBe(true);
		expect(tryCollectNode(second.id)).toEqual({ text: '+3 Food' });
	});

	it('rejects a collect while the carried load lacks room', () => {
		const spec = specOfKind('mineral');
		addCarried(getCarryCapacity());

		expect(tryCollectNode(spec.id)).toEqual({
			text: 'Carried full — deliver to the Refinery',
		});
		expect(getCarried()).toBe(getCarryCapacity());
		expect(viewOf(spec.id).available).toBe(true);
		expect(getResource('rawMinerals')).toBe(RESOURCES.rawMinerals.starting);

		// No cooldown was started: room was all the node needed.
		takeCarried(COLLECTION.yieldPerCollect);
		expect(tryCollectNode(spec.id)).toEqual({ text: '+3 Raw Minerals' });
		expect(getCarried()).toBe(getCarryCapacity());
	});

	it('returns null for an unknown id and changes nothing', () => {
		expect(tryCollectNode('missing')).toBeNull();
		expect(getCarried()).toBe(0);
		expect(getResource('food')).toBe(RESOURCES.food.starting);
		expect(getResource('h3')).toBe(RESOURCES.h3.starting);
		expect(nodeViews().every((view) => view.available)).toBe(true);
	});
});
