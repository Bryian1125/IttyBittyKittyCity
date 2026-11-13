import { describe, expect, it } from 'vitest';
import type { BuildingDef } from './balance';
import type { PlacedBuilding } from './placement';
import { computePower } from './power';

function makeBuilding(
	id: number,
	draw: number,
	generate: number,
): PlacedBuilding {
	const def: BuildingDef = {
		id: `test-${id}`,
		name: 'Test',
		category: 'power',
		footprint: [1, 1],
		cost: {},
		power: { draw, generate },
	};
	return { id, def, anchor: { column: 0, row: 0 }, rotation: 0 };
}

describe('computePower', () => {
	it('reports full satisfaction when nothing draws power', () => {
		expect(computePower([])).toEqual({
			generate: 0,
			demand: 0,
			satisfaction: 1,
		});
	});

	it('sums generation and demand across all buildings', () => {
		const totals = computePower([makeBuilding(1, 5, 0), makeBuilding(2, 0, 8)]);

		expect(totals.generate).toBe(8);
		expect(totals.demand).toBe(5);
		expect(totals.satisfaction).toBe(1);
	});

	it('scales satisfaction down when generation is short', () => {
		const totals = computePower([
			makeBuilding(1, 10, 0),
			makeBuilding(2, 0, 5),
		]);

		expect(totals.satisfaction).toBe(0.5);
	});

	it('never reports more than full satisfaction', () => {
		expect(computePower([makeBuilding(1, 2, 100)]).satisfaction).toBe(1);
	});
});
