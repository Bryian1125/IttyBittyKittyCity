import { beforeEach, describe, expect, it } from 'vitest';
import { CARRY } from '../lib/balance';
import {
	addCarried,
	getCarried,
	getCarryCapacity,
	takeCarried,
} from './carry.svelte';

describe('carry', () => {
	beforeEach(() => {
		takeCarried(getCarried());
	});

	it('starts empty with the configured capacity', () => {
		expect(getCarried()).toBe(0);
		expect(getCarryCapacity()).toBe(CARRY.capacity);
	});

	it('stores added amounts', () => {
		expect(addCarried(4)).toBe(4);
		expect(getCarried()).toBe(4);
	});

	it('clamps storage at capacity and reports what fit', () => {
		expect(addCarried(CARRY.capacity - 2)).toBe(CARRY.capacity - 2);
		expect(addCarried(10)).toBe(2);
		expect(getCarried()).toBe(CARRY.capacity);
	});

	it('ignores zero and negative adds', () => {
		expect(addCarried(0)).toBe(0);
		expect(addCarried(-3)).toBe(0);
		expect(getCarried()).toBe(0);
	});

	it('removes up to the requested amount', () => {
		addCarried(7);
		expect(takeCarried(3)).toBe(3);
		expect(getCarried()).toBe(4);
		expect(takeCarried(99)).toBe(4);
		expect(getCarried()).toBe(0);
	});

	it('reports zero for non-positive removals', () => {
		addCarried(2);
		expect(takeCarried(0)).toBe(0);
		expect(takeCarried(-2)).toBe(0);
		expect(getCarried()).toBe(2);
	});
});
