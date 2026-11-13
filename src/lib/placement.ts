import { BUILD_BOUNDS, BUILDING_HEIGHT, type BuildingDef } from './balance';
import { sites } from './layout';
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
	/** Quarter turns clockwise from the def's authored footprint. */
	rotation: Rotation;
};

export type PlacementProblem =
	'out-of-bounds' | 'occupied' | 'off-site' | 'unaffordable' | 'locked';

/** Quarter turns clockwise; 0 is the def's authored orientation. */
export type Rotation = 0 | 1 | 2 | 3;

/** Footprint [width, depth] after `rotation` quarter turns; odd turns swap the axes. */
export function rotateFootprint(
	footprint: [number, number],
	rotation: Rotation,
): [number, number] {
	return rotation % 2 === 0 ? footprint : [footprint[1], footprint[0]];
}

/** The next quarter turn clockwise, wrapping back to 0. */
export function nextRotation(rotation: Rotation): Rotation {
	return ((rotation + 1) % 4) as Rotation;
}

type FootprintSource = {
	position: [number, number, number];
	size: [number, number, number];
};

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
function toFootprint(source: FootprintSource): CellRect {
	const minX = source.position[0] - source.size[0] / 2;
	const maxX = source.position[0] + source.size[0] / 2;
	const minZ = source.position[2] - source.size[2] / 2;
	const maxZ = source.position[2] + source.size[2] / 2;

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

function rectContainsCell(rect: CellRect, cell: Cell): boolean {
	return (
		cell.column >= rect.minColumn &&
		cell.column <= rect.maxColumn &&
		cell.row >= rect.minRow &&
		cell.row <= rect.maxRow
	);
}

// Resource nodes are landmarks: a building over one would bury it for good
// (there is no demolition), so their cells are as occupied as the sites.
const nodeFootprints = NODE_SPECS.map((node) =>
	toFootprint({
		position: [node.position.x, 0, node.position.z],
		size: [1, 1, 1],
	}),
);

const siteFootprints = sites.map((site) => ({
	type: site.type,
	rect: toFootprint(site),
}));

/**
 * null when the structure fits at the anchor; otherwise the blocking problem.
 * A site-typed structure must cover a matching collection point; other
 * structures may not cover any, and the player's own cell always blocks.
 * `rotation` is the in-flight quarter turn applied to the candidate; already
 * placed structures are tested against their own stored rotation.
 */
export function getPlacementProblem(
	def: BuildingDef,
	anchor: Cell,
	placedBuildings: PlacedBuilding[],
	playerCell?: Cell,
	rotation: Rotation = 0,
): PlacementProblem | null {
	const rect = getFootprint(anchor, rotateFootprint(def.footprint, rotation));
	if (
		rect.minColumn < BUILD_BOUNDS.minColumn ||
		rect.maxColumn > BUILD_BOUNDS.maxColumn ||
		rect.minRow < BUILD_BOUNDS.minRow ||
		rect.maxRow > BUILD_BOUNDS.maxRow
	) {
		return 'out-of-bounds';
	}

	if (playerCell !== undefined && rectContainsCell(rect, playerCell))
		return 'occupied';

	if (nodeFootprints.some((node) => rectsOverlap(rect, node)))
		return 'occupied';

	if (
		placedBuildings.some((building) =>
			rectsOverlap(
				rect,
				getFootprint(
					building.anchor,
					rotateFootprint(building.def.footprint, building.rotation),
				),
			),
		)
	) {
		return 'occupied';
	}

	let onSite = false;
	for (const site of siteFootprints) {
		if (!rectsOverlap(rect, site.rect)) continue;
		if (def.site === site.type) onSite = true;
		else return 'occupied';
	}
	if (def.site !== undefined && !onSite) return 'off-site';

	return null;
}
