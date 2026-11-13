export type ResourceId = 'food' | 'rawMinerals' | 'materials' | 'h3';

export type ResourceCost = Partial<Record<ResourceId, number>>;

export type ResourceConfig = {
	starting: number;
	cap: number;
};

/**
 * Single source of truth for the colony's resources. Adding a resource means
 * adding a ResourceId member and one entry here.
 * Starting Materials seed the first buildings, Food the first colonist.
 */
export const RESOURCES: Record<ResourceId, ResourceConfig> = {
	food: { starting: 5, cap: 999 },
	rawMinerals: { starting: 0, cap: 999 },
	materials: { starting: 20, cap: 999 },
	h3: { starting: 0, cap: 999 },
};

export type BuildingCategory = 'housing' | 'factory' | 'processor' | 'power';

export type BuildingDef = {
	id: string;
	name: string;
	category: BuildingCategory;
	/** Footprint in grid cells, [width, depth]. */
	footprint: [number, number];
	cost: ResourceCost;
	power: { draw?: number; generate?: number };
	unlock?: { minPopulation?: number };
};

/**
 * Placeholder content until the Models issues land. The registry shape is
 * frozen here: content issues add entries, nothing else changes.
 */
export const BUILDINGS: BuildingDef[] = [
	{
		id: 'block-4x4',
		name: 'Block 4×4',
		category: 'housing',
		footprint: [4, 4],
		cost: { materials: 5 },
		power: {},
	},
	{
		id: 'block-2x4',
		name: 'Block 2×4',
		category: 'housing',
		footprint: [2, 4],
		cost: { materials: 4 },
		power: {},
	},
	{
		id: 'block-3x5',
		name: 'Block 3×5',
		category: 'factory',
		footprint: [3, 5],
		cost: { materials: 8 },
		power: { draw: 5 },
	},
	{
		id: 'power-block',
		name: 'Power Block',
		category: 'power',
		footprint: [2, 2],
		cost: { materials: 6 },
		power: { generate: 8 },
	},
];

/** Every structure is this many world units tall. */
export const BUILDING_HEIGHT = 2;

/** Buildable cells, matching the 60×60 floor; cell i spans [i - 0.5, i + 0.5). */
export const BUILD_BOUNDS = {
	minColumn: -29,
	maxColumn: 29,
	minRow: -29,
	maxRow: 29,
};
