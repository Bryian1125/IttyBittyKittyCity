import { beforeEach, describe, expect, it } from 'vitest';
import { BUILDINGS, TRANSFER, type BuildingDef } from '../lib/balance';
import { buildingsState } from './buildings.svelte';
import { getRefineryInput, tickEconomy } from './economy.svelte';
import { refineryViews } from './refineries.svelte';

function getDef(id: string): BuildingDef {
	const def = BUILDINGS.find((building) => building.id === id);
	if (def === undefined) throw new Error(`Unknown building def: ${id}`);
	return def;
}

// Ids must be unique across tests: the economy store persists buffers by
// building id between tests within this module graph.
let nextId = 100;
function placeDef(defId: string, column = 0, row = 0): number {
	const id = nextId;
	nextId += 1;
	buildingsState.placed.push({
		id,
		def: getDef(defId),
		anchor: { column, row },
		rotation: 0,
	});
	return id;
}

describe('refinery facade', () => {
	beforeEach(() => {
		buildingsState.placed.length = 0;
	});

	it('exposes one view per placed refinery with its centre and capacity', () => {
		const id = placeDef('refinery-l1');

		expect(refineryViews()).toEqual([
			{
				buildingId: id,
				x: 1,
				z: 1,
				input: 0,
				capacity: TRANSFER.refineryInputCapacity,
				status: 'starved',
			},
		]);
	});

	it('ignores placed buildings that do not refine', () => {
		placeDef('solar-panel-l1');
		placeDef('habitat-block');

		expect(refineryViews()).toEqual([]);
	});

	it('stays starved while the grid has no power', () => {
		const id = placeDef('refinery-l1');
		placeDef('mineral-collector-l1', 3, 0);

		tickEconomy(60);

		expect(getRefineryInput(id)).toBe(0);
		expect(refineryViews()[0]?.status).toBe('starved');
	});

	it('reaches the working status once powered and fed by the suction loop', () => {
		const id = placeDef('refinery-l1');
		placeDef('mineral-collector-l1', 3, 0);
		placeDef('solar-panel-l3', 6, 6);

		// 20 simulated seconds: the collector buffers and the refinery pulls.
		for (let step = 0; step < 200; step += 1) tickEconomy(0.1);

		expect(getRefineryInput(id)).toBeGreaterThanOrEqual(3);
		expect(refineryViews()[0]?.status).toBe('working');
	});
});
