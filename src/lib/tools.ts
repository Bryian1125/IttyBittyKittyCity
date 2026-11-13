import type { NodeKind } from './nodes';

export type ToolId = 'pickaxe' | 'drill';

export type Tool = {
	/** Stable tool id, e.g. "pickaxe". */
	id: ToolId;
	name: string;
	/** Node kinds this tool can collect. */
	targets: readonly NodeKind[];
	/** Multiplier on the base yield per collect. */
	yieldMultiplier: number;
	/** Multiplier on the base cooldown; below 1 is faster. */
	cooldownMultiplier: number;
	/** Materials price; 0 means owned from the start. */
	cost: number;
};

/** Hand-gathering tools, in hotbar order (Digit1, Digit2, ...). */
export const TOOLS: readonly Tool[] = [
	{
		id: 'pickaxe',
		name: 'Pickaxe',
		targets: ['mineral', 'food'],
		yieldMultiplier: 1,
		cooldownMultiplier: 1,
		cost: 0,
	},
	{
		id: 'drill',
		name: 'Handheld Drill',
		targets: ['mineral', 'food', 'h3'],
		yieldMultiplier: 2,
		cooldownMultiplier: 0.7,
		cost: 10,
	},
];

export const DEFAULT_TOOL: ToolId = 'pickaxe';

const BY_ID = Object.fromEntries(
	TOOLS.map((tool) => [tool.id, tool]),
) as Record<ToolId, Tool>;

export function findTool(id: ToolId): Tool {
	return BY_ID[id];
}

/**
 * The tool that can collect a kind at all: the first in hotbar order whose
 * targets include it. H3 needs the Handheld Drill; minerals and food work
 * with either tool.
 */
export function toolForKind(kind: NodeKind): Tool | undefined {
	return TOOLS.find((tool) => tool.targets.includes(kind));
}
