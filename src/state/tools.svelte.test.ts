import { beforeEach, describe, expect, it, vi } from 'vitest';

type ToolsModule = typeof import('./tools.svelte');
type ResourcesModule = typeof import('./resources.svelte');

let tools: ToolsModule;
let resources: ResourcesModule;

// The tools and resources stores hold module-level state with no public
// reset, so every test gets a fresh module graph instead.
beforeEach(async () => {
	vi.resetModules();
	resources = await import('./resources.svelte');
	tools = await import('./tools.svelte');
});

describe('tools state', () => {
	it('starts owning and equipping the pickaxe only', () => {
		expect(tools.getEquippedTool().id).toBe('pickaxe');
		expect(tools.getOwnedTools()).toEqual(['pickaxe']);
		expect(tools.isToolOwned('drill')).toBe(false);
	});

	it('refuses to equip an unowned tool', () => {
		expect(tools.equipTool('drill')).toBe(false);
		expect(tools.getEquippedTool().id).toBe('pickaxe');
	});

	it('buys the drill with Materials, owning and equipping it', () => {
		const start = resources.getResource('materials');

		expect(tools.buyTool('drill')).toBe(true);
		expect(resources.getResource('materials')).toBe(start - 10);
		expect(tools.isToolOwned('drill')).toBe(true);
		expect(tools.getEquippedTool().id).toBe('drill');
	});

	it('refuses the purchase without Materials and spends nothing', () => {
		resources.spendResource('materials', resources.getResource('materials'));

		expect(tools.buyTool('drill')).toBe(false);
		expect(resources.getResource('materials')).toBe(0);
		expect(tools.isToolOwned('drill')).toBe(false);
		expect(tools.getEquippedTool().id).toBe('pickaxe');
	});

	it('treats a repeat purchase as a free equip', () => {
		tools.buyTool('drill');
		const afterFirst = resources.getResource('materials');

		expect(tools.buyTool('drill')).toBe(true);
		expect(resources.getResource('materials')).toBe(afterFirst);
		expect(tools.getEquippedTool().id).toBe('drill');
	});
});
