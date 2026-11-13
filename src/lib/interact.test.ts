import { describe, expect, it } from 'vitest';
import { pickNearest, type Interactable } from './interact';

function item(overrides: Partial<Interactable> & { id: string }): Interactable {
	return {
		x: 0,
		z: 0,
		radius: 2,
		label: 'Test',
		enabled: true,
		act: () => {},
		...overrides,
	};
}

describe('pickNearest', () => {
	it('returns undefined for an empty list', () => {
		expect(pickNearest([], 0, 0)).toBeUndefined();
	});

	it('skips disabled entries', () => {
		expect(
			pickNearest([item({ id: 'a', enabled: false })], 0, 0),
		).toBeUndefined();
	});

	it('rejects entries beyond their own radius', () => {
		expect(
			pickNearest([item({ id: 'a', x: 5, radius: 2 })], 0, 0),
		).toBeUndefined();
		expect(
			pickNearest([item({ id: 'a', x: 1.5, radius: 2 })], 0, 0),
		).toBeDefined();
	});

	it('picks the nearest in-range entry', () => {
		const near = item({ id: 'near', x: 1 });
		const far = item({ id: 'far', x: 4, radius: 5 });
		expect(pickNearest([far, near], 0, 0)).toBe(near);
	});

	it('keeps list order for ties', () => {
		const first = item({ id: 'first', x: 1 });
		const second = item({ id: 'second', x: -1 });
		expect(pickNearest([first, second], 0, 0)).toBe(first);
	});

	it('uses the 2D distance on the ground plane', () => {
		const onRadius = item({ id: 'edge', x: 0, z: 2, radius: 2 });
		const pastRadius = item({ id: 'past', x: 1.5, z: 1.5, radius: 2 });
		expect(pickNearest([onRadius, pastRadius], 0, 0)).toBe(onRadius);
	});
});
