import { beforeEach, describe, expect, it } from 'vitest';
import {
	BUILDINGS,
	REFINING,
	RESOURCES,
	type BuildingDef,
	type ResourceId,
} from '../lib/balance';
import type { PlacedBuilding } from '../lib/placement';
import { buildingsState } from './buildings.svelte';
import { addCarried, getCarried, takeCarried } from './carry.svelte';
import {
	depositIntoRefinery,
	refineryViews,
	tickRefineries,
	type RefineryView,
} from './refineries.svelte';
import { addResource, getResource, spendResource } from './resources.svelte';

/** Reads the real registry, so these tests track balance changes. */
function getDef(id: string): BuildingDef {
	const def = BUILDINGS.find((entry) => entry.id === id);
	if (def === undefined) throw new Error(`unknown building def: ${id}`);
	return def;
}

function place(
	id: number,
	def: BuildingDef,
	column = 0,
	row = 0,
): PlacedBuilding {
	const building: PlacedBuilding = { id, def, anchor: { column, row } };
	buildingsState.placed.push(building);
	return building;
}

function findRefinery(id: number): RefineryView {
	const view = refineryViews().find((entry) => entry.buildingId === id);
	if (view === undefined) throw new Error(`unknown refinery view: ${id}`);
	return view;
}

/** Restores a known load through the public API only. */
function setCarried(amount: number): void {
	takeCarried(getCarried());
	addCarried(amount);
}

/** Restores a known amount through the public API only. */
function setResource(id: ResourceId, amount: number): void {
	spendResource(id, getResource(id));
	addResource(id, amount);
}

/** A refinery whose 6 draw is covered by an 8-generation power block. */
function placePoweredRefinery(id: number): void {
	place(id, getDef('refinery'));
	place(id + 100, getDef('power-block'));
}

describe('refineries', () => {
	beforeEach(() => {
		buildingsState.placed.length = 0;
		// Drops the buffers the previous test's buildings left behind.
		tickRefineries(0);
		setCarried(0);
		for (const id of Object.keys(RESOURCES) as ResourceId[]) {
			setResource(id, RESOURCES[id].starting);
		}
	});

	it('shows one view per placed refinery at its footprint centre', () => {
		place(1, getDef('refinery'), 2, 5);

		expect(refineryViews()).toEqual([
			{
				buildingId: 1,
				x: 3,
				z: 6,
				input: 0,
				capacity: REFINING.bufferCapacity,
				status: 'starved',
			},
		]);
	});

	it('ignores placed buildings that do not convert', () => {
		place(1, getDef('block-4x4'));
		place(2, getDef('mining-drill'));

		expect(refineryViews()).toEqual([]);
	});

	it('drops the view once the refinery is removed', () => {
		place(1, getDef('refinery'));
		expect(refineryViews()).toHaveLength(1);

		buildingsState.placed.length = 0;

		expect(refineryViews()).toEqual([]);
	});

	it('moves the carried load into the input buffer', () => {
		place(1, getDef('refinery'));
		setCarried(7);

		expect(depositIntoRefinery(1, REFINING.bufferCapacity)).toBe(7);
		expect(getCarried()).toBe(0);
		expect(findRefinery(1).input).toBe(7);
	});

	it('caps the deposit at the buffer and leaves the rest carried', () => {
		place(1, getDef('refinery'));

		setCarried(10);
		expect(depositIntoRefinery(1, 8)).toBe(8);
		setCarried(10);
		expect(depositIntoRefinery(1, 10)).toBe(10);
		setCarried(10);

		const room = REFINING.bufferCapacity - 18;
		expect(depositIntoRefinery(1, 10)).toBe(room);
		expect(getCarried()).toBe(10 - room);
		expect(findRefinery(1).input).toBe(REFINING.bufferCapacity);
	});

	it('returns zero for buildings that are not refineries', () => {
		place(1, getDef('block-4x4'));
		setCarried(5);

		expect(depositIntoRefinery(1, 5)).toBe(0);
		expect(depositIntoRefinery(99, 5)).toBe(0);
		expect(getCarried()).toBe(5);
	});

	it('mints Materials from a completed batch on a powered grid', () => {
		placePoweredRefinery(1);
		setCarried(REFINING.inputPerBatch);
		depositIntoRefinery(1, REFINING.inputPerBatch);
		const before = getResource('materials');

		tickRefineries(REFINING.batchSeconds);

		expect(getResource('materials')).toBe(before + REFINING.outputPerBatch);
		expect(findRefinery(1).input).toBe(0);
	});

	it('holds the buffer while the grid cannot cover the draw', () => {
		place(1, getDef('refinery'));
		setCarried(REFINING.inputPerBatch);
		depositIntoRefinery(1, REFINING.inputPerBatch);
		const before = getResource('materials');

		tickRefineries(REFINING.batchSeconds * 2);

		expect(getResource('materials')).toBe(before);
		expect(findRefinery(1).input).toBe(REFINING.inputPerBatch);
	});

	it('accumulates progress across ticks before the batch lands', () => {
		placePoweredRefinery(1);
		setCarried(REFINING.inputPerBatch);
		depositIntoRefinery(1, REFINING.inputPerBatch);
		const before = getResource('materials');

		tickRefineries(REFINING.batchSeconds / 2);
		expect(getResource('materials')).toBe(before);

		tickRefineries(REFINING.batchSeconds / 2);

		expect(getResource('materials')).toBe(before + REFINING.outputPerBatch);
		expect(findRefinery(1).input).toBe(0);
	});

	it('stretches the conversion at partial power', () => {
		place(1, getDef('refinery'));
		place(2, getDef('refinery'));
		place(3, getDef('power-block'));
		setCarried(REFINING.inputPerBatch);
		depositIntoRefinery(1, REFINING.inputPerBatch);
		const before = getResource('materials');

		expect(findRefinery(1).status).toBe('low-power');

		tickRefineries(REFINING.batchSeconds);
		expect(getResource('materials')).toBe(before);

		tickRefineries(REFINING.batchSeconds);
		expect(getResource('materials')).toBe(before + REFINING.outputPerBatch);
	});

	it('flips status as the buffer and the grid change', () => {
		place(1, getDef('refinery'));
		expect(findRefinery(1).status).toBe('starved');

		setCarried(REFINING.inputPerBatch);
		depositIntoRefinery(1, REFINING.inputPerBatch);
		expect(findRefinery(1).status).toBe('low-power');

		place(2, getDef('power-block'));
		expect(findRefinery(1).status).toBe('working');

		tickRefineries(REFINING.batchSeconds);

		expect(findRefinery(1).status).toBe('starved');
	});
});
