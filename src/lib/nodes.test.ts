import { describe, expect, it } from 'vitest';
import { CARRY, COLLECTION } from './balance';
import { obstacles, type BoxSpec } from './layout';
import {
	advanceCooldown,
	findNodeSpec,
	NODE_SPECS,
	planCollect,
	type NodeKind,
	type NodeSpec,
} from './nodes';

const KIND_LABELS: Record<NodeKind, string> = {
	mineral: 'Collect Raw Minerals',
	h3: 'Collect H3',
	food: 'Collect Food',
};

/** Shortest ground-plane distance from a node to an obstacle box. */
function obstacleDistance(spec: NodeSpec, box: BoxSpec): number {
	const [boxX, , boxZ] = box.position;
	const [boxWidth, , boxDepth] = box.size;
	const dx = Math.max(
		boxX - boxWidth / 2 - spec.position.x,
		spec.position.x - (boxX + boxWidth / 2),
		0,
	);
	const dz = Math.max(
		boxZ - boxDepth / 2 - spec.position.z,
		spec.position.z - (boxZ + boxDepth / 2),
		0,
	);
	return Math.hypot(dx, dz);
}

describe('node specs', () => {
	it('defines nine nodes, three of each kind', () => {
		expect(NODE_SPECS).toHaveLength(9);
		for (const kind of Object.keys(KIND_LABELS) as NodeKind[]) {
			expect(NODE_SPECS.filter((spec) => spec.kind === kind)).toHaveLength(3);
		}
	});

	it('gives every node a unique, findable id', () => {
		expect(new Set(NODE_SPECS.map((spec) => spec.id)).size).toBe(9);
		for (const spec of NODE_SPECS) {
			expect(findNodeSpec(spec.id)).toBe(spec);
		}
		expect(findNodeSpec('missing')).toBeUndefined();
	});

	it('labels every node with its kind prompt', () => {
		for (const spec of NODE_SPECS) {
			expect(spec.label).toBe(KIND_LABELS[spec.kind]);
		}
	});

	it('places every node within the |x|, |z| ≤ 20 field', () => {
		for (const spec of NODE_SPECS) {
			expect(Math.abs(spec.position.x)).toBeLessThanOrEqual(20);
			expect(Math.abs(spec.position.z)).toBeLessThanOrEqual(20);
		}
	});

	it('keeps every node at least two units clear of every obstacle', () => {
		for (const spec of NODE_SPECS) {
			for (const box of obstacles) {
				const distance = obstacleDistance(spec, box);
				expect(
					distance,
					`${spec.id} is ${distance} from ${box.id}`,
				).toBeGreaterThanOrEqual(2);
			}
		}
	});
});

describe('advanceCooldown', () => {
	it('counts down by the delta', () => {
		expect(advanceCooldown(COLLECTION.cooldownSeconds, 5)).toBe(
			COLLECTION.cooldownSeconds - 5,
		);
	});

	it('clamps at zero instead of going negative', () => {
		expect(advanceCooldown(2, 5)).toBe(0);
		expect(advanceCooldown(COLLECTION.cooldownSeconds, 999)).toBe(0);
	});

	it('keeps a ready node ready', () => {
		expect(advanceCooldown(0, 3)).toBe(0);
	});

	it('never adds time for a non-positive delta', () => {
		expect(advanceCooldown(5, 0)).toBe(5);
		expect(advanceCooldown(5, -2)).toBe(5);
	});
});

describe('planCollect', () => {
	it('routes Food and H3 into their pools', () => {
		expect(planCollect('h3', 0, CARRY.capacity)).toEqual({
			outcome: 'pool',
			resource: 'h3',
			amount: COLLECTION.yieldPerCollect,
			text: '+3 H3',
		});
		expect(planCollect('food', 0, CARRY.capacity)).toEqual({
			outcome: 'pool',
			resource: 'food',
			amount: COLLECTION.yieldPerCollect,
			text: '+3 Food',
		});
	});

	it('sends Raw Minerals to the carried load while there is room', () => {
		expect(planCollect('mineral', 0, CARRY.capacity)).toEqual({
			outcome: 'carried',
			amount: COLLECTION.yieldPerCollect,
			text: '+3 Raw Minerals',
		});
	});

	it('accepts a mineral collect that exactly fills the load', () => {
		const plan = planCollect(
			'mineral',
			CARRY.capacity - COLLECTION.yieldPerCollect,
			CARRY.capacity,
		);

		expect(plan.outcome).toBe('carried');
	});

	it('rejects a mineral collect that would not fit in full', () => {
		expect(planCollect('mineral', CARRY.capacity - 1, CARRY.capacity)).toEqual({
			outcome: 'rejected',
			text: 'Carried full — deliver to the Refinery',
		});
	});

	it('never rejects Food or H3 against the carried load', () => {
		expect(planCollect('h3', CARRY.capacity, CARRY.capacity).outcome).toBe(
			'pool',
		);
		expect(planCollect('food', CARRY.capacity, CARRY.capacity).outcome).toBe(
			'pool',
		);
	});
});
