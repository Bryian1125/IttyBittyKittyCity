export type ResourceId = 'food' | 'rawMinerals' | 'materials' | 'h3';

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
