import { beforeEach, describe, expect, it } from 'vitest';
import { BUILDINGS, type BuildingDef } from '../lib/balance';
import { buildingsState } from './buildings.svelte';
import { tickEconomy } from './economy.svelte';
import { getResource } from './resources.svelte';

function getDef(id: string): BuildingDef {
	const def = BUILDINGS.find((building) => building.id === id);
	if (def === undefined) throw new Error(`Unknown building def: ${id}`);
	return def;
}

let nextId = 200;
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

describe('producing buildings', () => {
	beforeEach(() => {
		buildingsState.placed.length = 0;
	});

	it('grows food at the configured rate while powered', () => {
		const before = getResource('food');
		placeDef('farm-l1');
		placeDef('solar-panel-l1');

		tickEconomy(60);

		expect(getResource('food')).toBeCloseTo(before + 4);
	});

	it('produces nothing while the grid has no power', () => {
		const before = getResource('food');
		placeDef('farm-l1');

		tickEconomy(60);

		expect(getResource('food')).toBe(before);
	});
});
