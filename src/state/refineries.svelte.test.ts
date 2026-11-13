import { beforeEach, describe, expect, it } from 'vitest';
import { BUILDINGS, TRANSFER, type BuildingDef } from '../lib/balance';
import { buildingsState } from './buildings.svelte';
import { addCarried, getCarried, takeCarried } from './carry.svelte';
import { getRefineryInput } from './economy.svelte';
import { depositIntoRefinery, refineryViews } from './refineries.svelte';

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
		takeCarried(getCarried());
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

	it('deposits up to the carried amount and empties the load', () => {
		const id = placeDef('refinery-l1');
		addCarried(5);

		expect(depositIntoRefinery(id, 99)).toBe(5);
		expect(getCarried()).toBe(0);
		expect(getRefineryInput(id)).toBe(5);
	});

	it('stops accepting once the buffer is full and leaves the load carried', () => {
		const id = placeDef('refinery-l1');

		// Carry capacity (10) is far below the buffer (30), so fill in trips.
		for (let trip = 0; trip < 3; trip += 1) {
			addCarried(10);
			expect(depositIntoRefinery(id, 10)).toBe(10);
		}
		expect(getRefineryInput(id)).toBe(TRANSFER.refineryInputCapacity);

		addCarried(10);
		expect(depositIntoRefinery(id, 10)).toBe(0);
		expect(getCarried()).toBe(10);
	});

	it('returns 0 for unknown ids and non-refinery buildings', () => {
		const solar = placeDef('solar-panel-l1');
		addCarried(4);

		expect(depositIntoRefinery(solar, 4)).toBe(0);
		expect(depositIntoRefinery(999_999, 4)).toBe(0);
		expect(getCarried()).toBe(4);
	});

	it('reports starved, low-power, and working as input and power change', () => {
		const id = placeDef('refinery-l1');
		expect(refineryViews()[0]?.status).toBe('starved');

		addCarried(3);
		depositIntoRefinery(id, 3);

		// Fed, but the refinery (draw 4) has no generation: low power.
		expect(refineryViews()[0]?.status).toBe('low-power');

		placeDef('solar-panel-l3');
		expect(refineryViews()[0]?.status).toBe('working');
	});

	it('keeps a below-batch refinery starved even at full power', () => {
		const id = placeDef('refinery-l1');
		placeDef('solar-panel-l3');

		addCarried(2);
		depositIntoRefinery(id, 2);

		expect(refineryViews()[0]?.status).toBe('starved');
	});
});
