import type { MapSiteType } from './layout';

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

export type RefineryRecipe = {
	input: number;
	output: number;
	seconds: number;
};

export type BuildingDef = {
	id: string;
	name: string;
	category: BuildingCategory;
	/** Footprint in grid cells, [width, depth]. */
	footprint: [number, number];
	cost: ResourceCost;
	power: { draw?: number; generate?: number };
	/** Housing slots this structure provides, if any. */
	housing?: number;
	unlock?: { minPopulation?: number };
	/** Public path to a glTF model, e.g. `/models/kaykit/drill_structure.gltf`. */
	model?: string;
	/** Collection point the structure must be built on. */
	site?: MapSiteType;
	/** Extracted into a local buffer that refineries pull in. */
	mines?: { ratePerMinute: number };
	/** Fed straight into the colony pool. */
	produces?: { resource: ResourceId; ratePerMinute: number };
	/** Pulls buffered Raw Minerals within this cell radius and refines them. */
	refines?: { rangeCells: number; recipe: RefineryRecipe };
};

/**
 * Placeholder roster until the Models issues land: tiered collectors, power
 * sources, and refineries with rough numbers. The registry shape is frozen
 * here: content issues add entries, nothing else changes.
 */
export const BUILDINGS: BuildingDef[] = [
	// Habitats are the housing colonists arrive into.
	{
		id: 'habitat-block',
		name: 'Habitat Block',
		category: 'housing',
		footprint: [3, 3],
		cost: { materials: 6 },
		power: { draw: 2 },
		housing: 4,
	},
	// Must sit on a minerals collection point; ore waits in a local buffer.
	{
		id: 'mineral-collector-l1',
		name: 'Mineral Collector L1',
		category: 'mining',
		footprint: [2, 2],
		cost: { materials: 8 },
		power: { draw: 2 },
		site: 'minerals',
		mines: { ratePerMinute: 12 },
		model: '/models/kaykit/drill_structure.gltf',
	},
	{
		id: 'mineral-collector-l2',
		name: 'Mineral Collector L2',
		category: 'mining',
		footprint: [2, 2],
		cost: { materials: 14 },
		power: { draw: 4 },
		site: 'minerals',
		mines: { ratePerMinute: 18 },
		model: '/models/kaykit/drill_structure.gltf',
	},
	{
		id: 'mineral-collector-l3',
		name: 'Mineral Collector L3',
		category: 'mining',
		footprint: [2, 2],
		cost: { materials: 22 },
		power: { draw: 6 },
		site: 'minerals',
		mines: { ratePerMinute: 27 },
		model: '/models/kaykit/drill_structure.gltf',
	},
	// Must sit on an h3 collection point; feeds the H3 pool directly.
	{
		id: 'h3-extractor-l1',
		name: 'H3 Extractor L1',
		category: 'mining',
		footprint: [2, 2],
		cost: { materials: 12 },
		power: { draw: 3 },
		site: 'h3',
		produces: { resource: 'h3', ratePerMinute: 2 },
	},
	{
		id: 'h3-extractor-l2',
		name: 'H3 Extractor L2',
		category: 'mining',
		footprint: [2, 2],
		cost: { materials: 20 },
		power: { draw: 5 },
		site: 'h3',
		produces: { resource: 'h3', ratePerMinute: 3 },
	},
	{
		id: 'h3-extractor-l3',
		name: 'H3 Extractor L3',
		category: 'mining',
		footprint: [2, 2],
		cost: { materials: 30 },
		power: { draw: 7 },
		site: 'h3',
		produces: { resource: 'h3', ratePerMinute: 5 },
	},
	// Pull buffered Raw Minerals from nearby collectors and refine them.
	{
		id: 'refinery-l1',
		name: 'Refinery L1',
		category: 'processor',
		footprint: [3, 3],
		cost: { materials: 10 },
		power: { draw: 4 },
		refines: { rangeCells: 6, recipe: { input: 3, output: 1, seconds: 8 } },
	},
	{
		id: 'refinery-l2',
		name: 'Refinery L2',
		category: 'processor',
		footprint: [3, 3],
		cost: { materials: 18 },
		power: { draw: 7 },
		refines: { rangeCells: 9, recipe: { input: 3, output: 1, seconds: 6 } },
	},
	{
		id: 'refinery-l3',
		name: 'Refinery L3',
		category: 'processor',
		footprint: [3, 3],
		cost: { materials: 28 },
		power: { draw: 10 },
		refines: { rangeCells: 12, recipe: { input: 3, output: 1, seconds: 4 } },
	},
	// Power: solar is cheap and weak; the nuclear plant is the payoff.
	{
		id: 'solar-panel-l1',
		name: 'Solar Panel L1',
		category: 'power',
		footprint: [3, 2],
		cost: { materials: 6 },
		power: { generate: 4 },
	},
	{
		id: 'solar-panel-l2',
		name: 'Solar Panel L2',
		category: 'power',
		footprint: [3, 2],
		cost: { materials: 10 },
		power: { generate: 8 },
	},
	{
		id: 'solar-panel-l3',
		name: 'Solar Panel L3',
		category: 'power',
		footprint: [3, 2],
		cost: { materials: 16 },
		power: { generate: 14 },
	},
	{
		id: 'nuclear-plant-l1',
		name: 'Nuclear Plant L1',
		category: 'power',
		footprint: [4, 4],
		cost: { materials: 35 },
		power: { generate: 60 },
		site: 'nuclear',
		unlock: { minPopulation: 2 },
	},
	{
		id: 'nuclear-plant-l2',
		name: 'Nuclear Plant L2',
		category: 'power',
		footprint: [4, 4],
		cost: { materials: 55 },
		power: { generate: 120 },
		site: 'nuclear',
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

/** Collector → refinery transfer tuning. */
export const TRANSFER = {
	seconds: 0.8,
	refineryInputCapacity: 30,
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

/** Walk-up radius at a refinery's centre for depositing carried ore. */
export const DEPOSIT = {
	interactRadius: 3.5,
};

/** Colonist arrival and upkeep tuning. */
export const POPULATION = {
	arrivalSeconds: 30,
	upkeepSeconds: 60,
	upkeepPerColonist: 1,
	/** Food stock that must stay at or above this for growth to continue. */
	growthFoodFloor: 5,
};
