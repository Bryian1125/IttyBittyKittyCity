import { describe, expect, it } from 'vitest';
import { BUILD_BOUNDS, type BuildingDef } from './balance';
import { sites, type MapSiteType } from './layout';
import {
	getFootprint,
	getPlacementProblem,
	toCell,
	type Cell,
	type PlacedBuilding,
} from './placement';

function makeDef(footprint: [number, number], site?: MapSiteType): BuildingDef {
	return {
		id: 'test-block',
		name: 'Test Block',
		category: 'mining',
		footprint,
		cost: {},
		power: {},
		site,
	};
}

function makePlaced(footprint: [number, number], anchor: Cell): PlacedBuilding {
	return { id: 1, def: makeDef(footprint), anchor };
}

const mineralsSite = sites[0];
const mineralsAnchor = toCell(
	mineralsSite.position[0],
	mineralsSite.position[2],
);

describe('toCell', () => {
	it('maps a point to the cell containing it', () => {
		expect(toCell(0.4, 0.4)).toEqual({ column: 0, row: 0 });
		expect(toCell(0.6, -0.6)).toEqual({ column: 1, row: -1 });
	});

	it('handles cell boundaries exactly', () => {
		expect(toCell(0.5, 0.5)).toEqual({ column: 1, row: 1 });
		expect(toCell(-0.5, -0.5)).toEqual({ column: 0, row: 0 });
		expect(toCell(-0.6, -0.6)).toEqual({ column: -1, row: -1 });
	});
});

describe('getFootprint', () => {
	it('spans the structure size from the anchor', () => {
		expect(getFootprint({ column: 2, row: 3 }, [3, 5])).toEqual({
			minColumn: 2,
			maxColumn: 4,
			minRow: 3,
			maxRow: 7,
		});
	});
});

describe('getPlacementProblem', () => {
	it('allows clear spots', () => {
		expect(
			getPlacementProblem(makeDef([2, 2]), { column: 0, row: 0 }, []),
		).toBeNull();
	});

	it('allows footprints that fit the buildable area exactly', () => {
		expect(
			getPlacementProblem(
				makeDef([1, 1]),
				{ column: BUILD_BOUNDS.minColumn, row: 0 },
				[],
			),
		).toBeNull();
		expect(
			getPlacementProblem(
				makeDef([4, 4]),
				{ column: BUILD_BOUNDS.maxColumn - 3, row: 0 },
				[],
			),
		).toBeNull();
	});

	it('rejects footprints that leave the buildable area', () => {
		expect(
			getPlacementProblem(
				makeDef([1, 1]),
				{ column: BUILD_BOUNDS.maxColumn + 1, row: 0 },
				[],
			),
		).toBe('out-of-bounds');
		expect(
			getPlacementProblem(
				makeDef([1, 1]),
				{ column: BUILD_BOUNDS.minColumn - 1, row: 0 },
				[],
			),
		).toBe('out-of-bounds');
		expect(
			getPlacementProblem(
				makeDef([2, 2]),
				{ column: BUILD_BOUNDS.maxColumn, row: 0 },
				[],
			),
		).toBe('out-of-bounds');
	});

	it('allows a site structure to overlap its matching collection point', () => {
		expect(
			getPlacementProblem(makeDef([2, 2], 'minerals'), mineralsAnchor, []),
		).toBeNull();
	});

	it('rejects a site structure away from its collection point', () => {
		expect(
			getPlacementProblem(
				makeDef([2, 2], 'minerals'),
				{ column: 0, row: 0 },
				[],
			),
		).toBe('off-site');
	});

	it('rejects other structures covering a collection point', () => {
		expect(getPlacementProblem(makeDef([2, 2]), mineralsAnchor, [])).toBe(
			'occupied',
		);
	});

	it('rejects a structure covering a point of the wrong type', () => {
		expect(getPlacementProblem(makeDef([2, 2], 'h3'), mineralsAnchor, [])).toBe(
			'occupied',
		);
	});

	it('rejects a footprint covering the player but allows the cells around it', () => {
		expect(
			getPlacementProblem(makeDef([1, 1]), { column: 0, row: 0 }, [], {
				column: 0,
				row: 0,
			}),
		).toBe('occupied');
		expect(
			getPlacementProblem(makeDef([1, 1]), { column: 0, row: 0 }, [], {
				column: 5,
				row: 0,
			}),
		).toBeNull();
	});

	it('rejects overlaps with placed buildings but allows neighbours', () => {
		const existing = [makePlaced([2, 2], { column: 0, row: 0 })];

		expect(
			getPlacementProblem(makeDef([2, 2]), { column: 1, row: 1 }, existing),
		).toBe('occupied');
		expect(
			getPlacementProblem(makeDef([2, 2]), { column: 2, row: 0 }, existing),
		).toBeNull();
	});
});
