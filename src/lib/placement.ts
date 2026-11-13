import { BUILD_BOUNDS, BUILDING_HEIGHT, type BuildingDef } from './balance';
import { obstacles, type BoxSpec } from './layout';
import { NODE_SPECS } from './nodes';

export type Cell = { column: number; row: number };

export type CellRect = {
	minColumn: number;
	maxColumn: number;
	minRow: number;
	maxRow: number;
};

export type PlacedBuilding = {
	id: number;
	def: BuildingDef;
	anchor: Cell;
};

export type PlacementProblem =
	'out-of-bounds' | 'occupied' | 'unaffordable' | 'locked';

/** Grid math: cell (i, j) spans world [i - 0.5, i + 0.5) on both axes. */
export function toCell(x: number, z: number): Cell {
	return {
		column: Math.floor(x + 0.5),
		row: Math.floor(z + 0.5),
	};
}

/** Footprint of a structure whose lowest cell (in both axes) is the anchor. */
export function getFootprint(
	anchor: Cell,
	footprint: [number, number],
): CellRect {
	return {
		minColumn: anchor.column,
		maxColumn: anchor.column + footprint[0] - 1,
		minRow: anchor.row,
		maxRow: anchor.row + footprint[1] - 1,
	};
}

/** World-space centre of a structure, ready to feed a mesh position. */
export function getBuildingCenter(
	anchor: Cell,
	footprint: [number, number],
): [number, number, number] {
	return [
		anchor.column + (footprint[0] - 1) / 2,
		BUILDING_HEIGHT / 2,
		anchor.row + (footprint[1] - 1) / 2,
	];
}

/** A cell counts as occupied when the structure's geometry touches any part of it. */
function toFootprint(spec: BoxSpec): CellRect {
	const minX = spec.position[0] - spec.size[0] / 2;
	const maxX = spec.position[0] + spec.size[0] / 2;
	const minZ = spec.position[2] - spec.size[2] / 2;
	const maxZ = spec.position[2] + spec.size[2] / 2;

	return {
		minColumn: Math.floor(minX + 0.5),
		maxColumn: Math.ceil(maxX - 0.5),
		minRow: Math.floor(minZ + 0.5),
		maxRow: Math.ceil(maxZ - 0.5),
	};
}

function rectsOverlap(a: CellRect, b: CellRect): boolean {
	return (
		a.minColumn <= b.maxColumn &&
		a.maxColumn >= b.minColumn &&
		a.minRow <= b.maxRow &&
		a.maxRow >= b.minRow
	);
}

const obstacleFootprints = obstacles.map(toFootprint);

// Resource nodes are landmarks: a building over one would bury it for good
// (there is no demolition), so their cells are as occupied as obstacles.
const nodeFootprints = NODE_SPECS.map((node) =>
	toFootprint({
		id: node.id,
		position: [node.position.x, 0, node.position.z],
		size: [1, 1, 1],
		color: '',
	}),
);

/** null when the structure fits at the anchor; otherwise the blocking problem. */
export function getPlacementProblem(
	anchor: Cell,
	footprint: [number, number],
	placedBuildings: PlacedBuilding[],
): PlacementProblem | null {
	const rect = getFootprint(anchor, footprint);
	if (
		rect.minColumn < BUILD_BOUNDS.minColumn ||
		rect.maxColumn > BUILD_BOUNDS.maxColumn ||
		rect.minRow < BUILD_BOUNDS.minRow ||
		rect.maxRow > BUILD_BOUNDS.maxRow
	) {
		return 'out-of-bounds';
	}

	if (obstacleFootprints.some((obstacle) => rectsOverlap(rect, obstacle)))
		return 'occupied';

	if (nodeFootprints.some((node) => rectsOverlap(rect, node))) return 'occupied';

	if (
		placedBuildings.some((building) =>
			rectsOverlap(rect, getFootprint(building.anchor, building.def.footprint)),
		)
	) {
		return 'occupied';
	}

	return null;
}
