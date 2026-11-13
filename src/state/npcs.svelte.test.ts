import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	BUILDINGS,
	POPULATION,
	RESOURCES,
	type BuildingDef,
} from '../lib/balance';

type NpcsModule = typeof import('./npcs.svelte');
type BuildingsModule = typeof import('./buildings.svelte');
type ResourcesModule = typeof import('./resources.svelte');

let npcs: NpcsModule;
let buildings: BuildingsModule;
let resources: ResourcesModule;

// The population and placement stores hold module-level state with no public
// reset, so every test gets a fresh module graph instead.
beforeEach(async () => {
	vi.resetModules();
	buildings = await import('./buildings.svelte');
	resources = await import('./resources.svelte');
	npcs = await import('./npcs.svelte');
});

function getDef(id: string): BuildingDef {
	const def = BUILDINGS.find((building) => building.id === id);
	if (def === undefined) throw new Error(`Unknown building def: ${id}`);
	return def;
}

function placeDef(def: BuildingDef, column = 0, row = 0): void {
	buildings.buildingsState.placed.push({
		id: buildings.buildingsState.placed.length + 1,
		def,
		anchor: { column, row },
		rotation: 0,
	});
}

/** World-space span of a placed building's footprint; cell i spans [i - 0.5, i + 0.5). */
function footprintBounds(building: {
	def: BuildingDef;
	anchor: { column: number; row: number };
}): { minX: number; maxX: number; minZ: number; maxZ: number } {
	const [width, depth] = building.def.footprint;
	const minX = building.anchor.column - 0.5;
	const minZ = building.anchor.row - 0.5;

	return { minX, maxX: minX + width, minZ, maxZ: minZ + depth };
}

describe('population state', () => {
	it('starts empty with no housing', () => {
		expect(npcs.getPopulation()).toBe(0);
		expect(npcs.getHousingCapacity()).toBe(0);
	});

	it('sums housing across placed buildings only', () => {
		expect(npcs.getHousingCapacity()).toBe(0);

		placeDef(getDef('habitat-block'));
		placeDef(getDef('habitat-block'), 6);
		expect(npcs.getHousingCapacity()).toBe(8);

		placeDef(getDef('refinery-l1'), 12);
		placeDef(getDef('solar-panel-l1'), 16);
		placeDef(getDef('mineral-collector-l1'), 20);
		expect(npcs.getHousingCapacity()).toBe(8);

		buildings.buildingsState.placed.length = 0;
		expect(npcs.getHousingCapacity()).toBe(0);
	});

	it('keeps the colony empty without housing', () => {
		resources.addResource('food', 500);

		npcs.tickPopulation(POPULATION.arrivalSeconds * 2);

		expect(npcs.getPopulation()).toBe(0);
		expect(resources.getResource('food')).toBe(RESOURCES.food.starting + 500);
	});

	it('unlocks defs once the population meets their gate', () => {
		const gated = getDef('nuclear-plant-l1');
		const ungated = getDef('habitat-block');

		expect(npcs.isUnlocked(gated)).toBe(false);
		expect(npcs.isUnlocked(ungated)).toBe(true);

		placeDef(ungated);
		resources.addResource('food', 100);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(1);
		expect(npcs.isUnlocked(gated)).toBe(false);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(2);
		expect(npcs.isUnlocked(gated)).toBe(true);
	});

	it('grows one colonist per arrival window and drains food', () => {
		placeDef(getDef('habitat-block'));
		resources.addResource('food', 100);
		const startFood = resources.getResource('food');

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(1);
		expect(resources.getResource('food')).toBe(startFood);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(2);
		expect(resources.getResource('food')).toBe(startFood);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(3);
		expect(resources.getResource('food')).toBe(startFood - 1);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(4);
		// Whole-unit spends: the fractional debt from earlier ticks lands here.
		expect(resources.getResource('food')).toBe(startFood - 3);
	});

	it('stops growing at housing capacity', () => {
		placeDef(getDef('habitat-block'));
		resources.addResource('food', 500);

		for (let tick = 0; tick < 20; tick += 1) {
			npcs.tickPopulation(POPULATION.arrivalSeconds);
		}

		expect(npcs.getHousingCapacity()).toBe(4);
		expect(npcs.getPopulation()).toBe(4);
	});

	it('exposes one view per colonist', () => {
		placeDef(getDef('habitat-block'));
		resources.addResource('food', 100);

		expect(npcs.colonistViews()).toEqual([]);

		npcs.tickPopulation(POPULATION.arrivalSeconds);

		expect(npcs.colonistViews()).toEqual([
			{ id: expect.any(Number), x: expect.any(Number), z: expect.any(Number) },
		]);
	});

	it('spawns a colonist in open ground outside the housing footprint', () => {
		placeDef(getDef('habitat-block'));
		resources.addResource('food', 100);

		npcs.tickPopulation(POPULATION.arrivalSeconds);

		const views = npcs.colonistViews();
		expect(views).toHaveLength(1);

		for (const building of buildings.buildingsState.placed) {
			const { minX, maxX, minZ, maxZ } = footprintBounds(building);
			for (const view of views) {
				const inside =
					view.x >= minX && view.x <= maxX && view.z >= minZ && view.z <= maxZ;
				expect(inside, `colonist at ${view.x}, ${view.z}`).toBe(false);
			}
		}
	});
});
