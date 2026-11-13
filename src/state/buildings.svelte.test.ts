import { describe, expect, it } from 'vitest';
import type { BuildingDef } from '../lib/balance';
import { buildingsState, rotatePlacement, startPlacing, stopPlacing } from './buildings.svelte';

const drill: BuildingDef = {
	id: 'mining-drill',
	name: 'Mining Drill',
	category: 'mining',
	footprint: [2, 2],
	cost: {},
	power: {},
};

describe('placement rotation', () => {
	it('starts at the authored orientation when a structure is selected', () => {
		startPlacing(drill);
		expect(buildingsState.rotation).toBe(0);
	});

	it('advances one quarter turn per rotate and wraps after four', () => {
		startPlacing(drill);

		const turns = Array.from({ length: 5 }, () => {
			rotatePlacement();
			return buildingsState.rotation;
		});

		expect(turns).toEqual([1, 2, 3, 0, 1]);
	});

	it('drops the in-flight rotation when placement ends', () => {
		startPlacing(drill);
		rotatePlacement();
		stopPlacing();

		expect(buildingsState.rotation).toBe(0);
	});
});
