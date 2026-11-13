import { DEFAULT_TOOL, findTool, type Tool, type ToolId } from '../lib/tools';
import { canAfford, spendResource } from './resources.svelte';

const tools = $state<{ equipped: ToolId; owned: ToolId[] }>({
	equipped: DEFAULT_TOOL,
	owned: [DEFAULT_TOOL],
});

/** The equipped tool; drives manual-collection modifiers and the prompt. */
export function getEquippedTool(): Tool {
	return findTool(tools.equipped);
}

/** Every owned tool id, in acquisition order. */
export function getOwnedTools(): ToolId[] {
	return [...tools.owned];
}

export function isToolOwned(id: ToolId): boolean {
	return tools.owned.includes(id);
}

/** Equips an owned tool; false (and nothing changes) for unowned tools. */
export function equipTool(id: ToolId): boolean {
	if (!tools.owned.includes(id)) return false;
	tools.equipped = id;
	return true;
}

/**
 * Buys and equips a tool with Materials — a no-op equip when already owned.
 * Returns false when unaffordable, without spending anything.
 */
export function buyTool(id: ToolId): boolean {
	if (tools.owned.includes(id)) return equipTool(id);

	const tool = findTool(id);
	if (!canAfford({ materials: tool.cost })) return false;
	if (!spendResource('materials', tool.cost)) return false;

	tools.owned.push(id);
	tools.equipped = id;
	return true;
}
