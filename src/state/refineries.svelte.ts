import { TRANSFER } from '../lib/balance';
import { computePower } from '../lib/power';
import { getBuildingCenter } from '../lib/placement';
import { buildingsState } from './buildings.svelte';
import { getRefineryInput } from './economy.svelte';

/** working: fed and powered; starved: below one batch; low-power: satisfaction < 1. */
export type RefineryStatus = 'working' | 'starved' | 'low-power';

export type RefineryView = {
	/** Id of the placed building this refinery belongs to. */
	buildingId: number;
	/** World position at the building centre, for the floating status bar. */
	x: number;
	z: number;
	/** Raw Minerals currently in the input buffer. */
	input: number;
	/** Input buffer capacity (`TRANSFER.refineryInputCapacity`). */
	capacity: number;
	status: RefineryStatus;
};

/** One view per placed refinery; cheap to call every frame. */
export function refineryViews(): RefineryView[] {
	const satisfaction = computePower(buildingsState.placed).satisfaction;
	const views: RefineryView[] = [];

	for (const building of buildingsState.placed) {
		const recipe = building.def.refines?.recipe;
		if (recipe === undefined) continue;

		const [x, , z] = getBuildingCenter(building.anchor, building.def.footprint);
		const input = getRefineryInput(building.id);
		views.push({
			buildingId: building.id,
			x,
			z,
			input,
			capacity: TRANSFER.refineryInputCapacity,
			status:
				input < recipe.input
					? 'starved'
					: satisfaction < 1
						? 'low-power'
						: 'working',
		});
	}

	return views;
}
