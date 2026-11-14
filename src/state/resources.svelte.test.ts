import { beforeEach, describe, expect, it } from 'vitest';
import { RESOURCES, type ResourceId } from '../lib/balance';
import {
	addResource,
	canAfford,
	getResource,
	spendResource,
} from './resources.svelte';

/** Restores a known amount through the public API only. */
function setResource(id: ResourceId, amount: number): void {
	spendResource(id, getResource(id));
	addResource(id, amount);
}

describe('resources', () => {
	beforeEach(() => {
		for (const id of Object.keys(RESOURCES) as ResourceId[]) {
			setResource(id, RESOURCES[id].starting);
		}
	});

	it('exposes every registered resource at its starting amount', () => {
		for (const id of Object.keys(RESOURCES) as ResourceId[]) {
			expect(getResource(id)).toBe(RESOURCES[id].starting);
		}
	});

	it('adds the requested amount', () => {
		addResource('food', 3);

		expect(getResource('food')).toBe(RESOURCES.food.starting + 3);
	});

	it('clamps adds at the cap', () => {
		setResource('h3', RESOURCES.h3.cap - 2);

		addResource('h3', 10);

		expect(getResource('h3')).toBe(RESOURCES.h3.cap);
	});

	it('ignores zero and negative adds', () => {
		addResource('materials', 0);
		addResource('materials', -5);

		expect(getResource('materials')).toBe(RESOURCES.materials.starting);
	});

	it('spends the exact amount when affordable', () => {
		expect(spendResource('materials', RESOURCES.materials.starting)).toBe(true);
		expect(getResource('materials')).toBe(0);
	});

	it('refuses spends beyond the balance and leaves it untouched', () => {
		setResource('materials', 4);

		expect(spendResource('materials', 5)).toBe(false);
		expect(getResource('materials')).toBe(4);
	});

	it('never goes negative', () => {
		setResource('rawMinerals', 3);

		expect(spendResource('rawMinerals', 3)).toBe(true);
		expect(spendResource('rawMinerals', 1)).toBe(false);
		expect(getResource('rawMinerals')).toBe(0);
	});

	it('treats a zero spend as a no-op success and rejects negative spends', () => {
		expect(spendResource('food', 0)).toBe(true);
		expect(spendResource('food', -3)).toBe(false);
		expect(getResource('food')).toBe(RESOURCES.food.starting);
	});

	it('is exact for canAfford across mixed costs', () => {
		expect(
			canAfford({
				materials: RESOURCES.materials.starting,
				food: RESOURCES.food.starting,
			}),
		).toBe(true);
		expect(canAfford({ materials: RESOURCES.materials.starting + 1 })).toBe(
			false,
		);
		expect(canAfford({ food: RESOURCES.food.starting, h3: 1 })).toBe(false);
		expect(canAfford({})).toBe(true);
	});
});
