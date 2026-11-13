export type ResourceId = 'food' | 'rawMinerals' | 'materials' | 'h3';

export type ResourceCost = Partial<Record<ResourceId, number>>;

export type ResourceConfig = {
	label: string;
	starting: number;
	cap: number;
	/** Whether the bottom-left HUD shows a counter box for it. */
	hud: boolean;
};

/**
 * Single source of truth for the colony's resources. Adding a resource means
 * adding a ResourceId member and one entry here.
 * Starting Materials seed the first buildings, Food the first colonist.
 */
export const RESOURCES: Record<ResourceId, ResourceConfig> = {
	food: { label: 'Food', starting: 5, cap: 999, hud: true },
	rawMinerals: { label: 'Raw Minerals', starting: 0, cap: 999, hud: false },
	materials: { label: 'Materials', starting: 20, cap: 999, hud: true },
	h3: { label: 'H3', starting: 0, cap: 999, hud: false },
};

export type BuildingCategory =
	'housing' | 'factory' | 'processor' | 'power' | 'mining';

export type BuildingDef = {
	id: string;
	name: string;
	category: BuildingCategory;
	/** Footprint in grid cells, [width, depth]. */
	footprint: [number, number];
	cost: ResourceCost;
	power: { draw?: number; generate?: number };
	unlock?: { minPopulation?: number };
	/** Public path to a glTF model, e.g. `/models/kaykit/drill_structure.gltf`. */
	model?: string;
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
		housing: 4,
	},
	{
		id: 'block-2x4',
		name: 'Block 2×4',
		category: 'housing',
		footprint: [2, 4],
		cost: { materials: 4 },
		power: {},
		housing: 2,
	},
	{
		id: 'block-3x5',
		name: 'Block 3×5',
		category: 'factory',
		footprint: [3, 5],
		cost: { materials: 8 },
		power: { draw: 5 },
		unlock: { minPopulation: 2 },
	},
	{
		id: 'refinery',
		name: 'Refinery',
		category: 'processor',
		footprint: [3, 3],
		cost: { materials: 12 },
		power: { draw: 6 },
	},
	{
		id: 'power-block',
		name: 'Power Block',
		category: 'power',
		footprint: [2, 2],
		cost: { materials: 6 },
		power: { generate: 8 },
	},
	{
		id: 'mining-drill',
		name: 'Mining Drill',
		category: 'mining',
		footprint: [2, 2],
		cost: {},
		power: {},
		model: '/models/kaykit/drill_structure.gltf',
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

/** Walk-up interaction tuning for resource nodes. */
export const COLLECTION = {
	interactRadius: 1.5,
	yieldPerCollect: 3,
	cooldownSeconds: 15,
};

/** How much Raw Minerals the player can haul at once. */
export const CARRY = {
	capacity: 10,
};

/** Refinery conversion tuning; the recipe lives here once (issue #6). */
export const REFINING = {
	batchSeconds: 8,
	inputPerBatch: 3,
	outputPerBatch: 1,
	bufferCapacity: 20,
	/** Walk-up radius at the building centre for depositing. */
	interactRadius: 3.5,
};

/** Colonist arrival and upkeep tuning (issue #7). */
export const POPULATION = {
	arrivalSeconds: 30,
	upkeepSeconds: 60,
	upkeepPerColonist: 1,
	/** Food stock that must stay at or above this for growth to continue. */
	growthFoodFloor: 5,
};
