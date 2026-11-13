import { describe, expect, it } from 'vitest';
import { BUILD_BOUNDS, type BuildingDef } from './balance';
import {
	getFootprint,
	getPlacementProblem,
	toCell,
	type Cell,
	type PlacedBuilding,
} from './placement';

function makeDef(footprint: [number, number]): BuildingDef {
	return {
		id: 'test-block',
		name: 'Test Block',
		category: 'housing',
		footprint,
		cost: {},
		power: {},
	};
}

function makePlaced(footprint: [number, number], anchor: Cell): PlacedBuilding {
	return { id: 1, def: makeDef(footprint), anchor };
}

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
		expect(getPlacementProblem({ column: 0, row: 0 }, [2, 2], [])).toBeNull();
	});

	it('allows footprints that fit the buildable area exactly', () => {
		expect(
			getPlacementProblem(
				{ column: BUILD_BOUNDS.minColumn, row: 0 },
				[1, 1],
				[],
			),
		).toBeNull();
		expect(
			getPlacementProblem(
				{ column: BUILD_BOUNDS.maxColumn - 3, row: 0 },
				[4, 4],
				[],
			),
		).toBeNull();
	});

	it('rejects footprints that leave the buildable area', () => {
		expect(
			getPlacementProblem(
				{ column: BUILD_BOUNDS.maxColumn + 1, row: 0 },
				[1, 1],
				[],
			),
		).toBe('out-of-bounds');
		expect(
			getPlacementProblem(
				{ column: BUILD_BOUNDS.minColumn - 1, row: 0 },
				[1, 1],
				[],
			),
		).toBe('out-of-bounds');
		expect(
			getPlacementProblem(
				{ column: BUILD_BOUNDS.maxColumn, row: 0 },
				[2, 2],
				[],
			),
		).toBe('out-of-bounds');
	});

	it('rejects overlaps with existing layout structures', () => {
		// The crate in the current layout occupies grid cell (4, 3).
		expect(getPlacementProblem({ column: 4, row: 3 }, [1, 1], [])).toBe(
			'occupied',
		);
	});

	it('rejects overlaps with placed buildings but allows neighbours', () => {
		const existing = [makePlaced([2, 2], { column: 0, row: 0 })];

		expect(getPlacementProblem({ column: 1, row: 1 }, [2, 2], existing)).toBe(
			'occupied',
		);
		expect(
			getPlacementProblem({ column: 2, row: 0 }, [2, 2], existing),
		).toBeNull();
	});
});
