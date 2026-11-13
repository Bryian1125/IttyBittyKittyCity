import { describe, expect, it } from 'vitest';
import { DEFAULT_TOOL, findTool, TOOLS, toolForKind } from './tools';

describe('tool registry', () => {
	it('ships the pickaxe as the default starter tool', () => {
		expect(DEFAULT_TOOL).toBe('pickaxe');
		expect(findTool('pickaxe').cost).toBe(0);
	});

	it('sells the drill through the economy', () => {
		expect(findTool('drill').cost).toBeGreaterThan(0);
	});

	it('keeps the drill strictly stronger for gathering', () => {
		const pickaxe = findTool('pickaxe');
		const drill = findTool('drill');

		expect(drill.yieldMultiplier).toBeGreaterThan(pickaxe.yieldMultiplier);
		expect(drill.cooldownMultiplier).toBeLessThan(pickaxe.cooldownMultiplier);
	});

	it('requires the drill for H3 and admits either tool on minerals and food', () => {
		expect(toolForKind('h3')?.id).toBe('drill');
		expect(findTool('pickaxe').targets).toContain('mineral');
		expect(findTool('pickaxe').targets).toContain('food');
		expect(findTool('drill').targets).toEqual(
			expect.arrayContaining(['mineral', 'food', 'h3']),
		);
	});

	it('keeps ids unique and every tool findable', () => {
		expect(new Set(TOOLS.map((tool) => tool.id)).size).toBe(TOOLS.length);
		for (const tool of TOOLS) {
			expect(findTool(tool.id)).toBe(tool);
		}
	});
});
