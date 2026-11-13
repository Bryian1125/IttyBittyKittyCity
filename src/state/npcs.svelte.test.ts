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
	});
}

describe('population state', () => {
	it('starts empty with no housing', () => {
		expect(npcs.getPopulation()).toBe(0);
		expect(npcs.getHousingCapacity()).toBe(0);
	});

	it('sums housing across placed buildings only', () => {
		expect(npcs.getHousingCapacity()).toBe(0);

		placeDef(getDef('block-2x4'));
		placeDef(getDef('block-4x4'), 6);
		expect(npcs.getHousingCapacity()).toBe(6);

		placeDef(getDef('refinery'), 12);
		placeDef(getDef('power-block'), 16);
		placeDef(getDef('mining-drill'), 20);
		expect(npcs.getHousingCapacity()).toBe(6);

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
		const gated = getDef('block-3x5');
		const ungated = getDef('block-2x4');

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
		placeDef(getDef('block-2x4'));
		resources.addResource('food', 100);
		const startFood = resources.getResource('food');

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(1);
		expect(resources.getResource('food')).toBe(startFood);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(2);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(npcs.getPopulation()).toBe(2);
		expect(resources.getResource('food')).toBe(startFood - 1);

		npcs.tickPopulation(POPULATION.arrivalSeconds);
		expect(resources.getResource('food')).toBe(startFood - 2);
	});

	it('stops growing at housing capacity', () => {
		placeDef(getDef('block-2x4'));
		resources.addResource('food', 500);

		for (let tick = 0; tick < 20; tick += 1) {
			npcs.tickPopulation(POPULATION.arrivalSeconds);
		}

		expect(npcs.getHousingCapacity()).toBe(2);
		expect(npcs.getPopulation()).toBe(2);
	});

	it('exposes one view per colonist', () => {
		placeDef(getDef('block-2x4'));
		resources.addResource('food', 100);

		expect(npcs.colonistViews()).toEqual([]);

		npcs.tickPopulation(POPULATION.arrivalSeconds);

		expect(npcs.colonistViews()).toEqual([
			{ id: expect.any(Number), x: expect.any(Number), z: expect.any(Number) },
		]);
	});
});
