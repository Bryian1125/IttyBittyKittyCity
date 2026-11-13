import { TRANSFER } from '../lib/balance';
import { computePower } from '../lib/power';
import { getBuildingCenter } from '../lib/placement';
import { buildingsState } from './buildings.svelte';
import { takeCarried } from './carry.svelte';
import { depositRefineryInput, getRefineryInput } from './economy.svelte';

/** working: fed and powered; starved: below one batch; low-power: satisfaction < 1. */
export type RefineryStatus = 'working' | 'starved' | 'low-power';

export type RefineryView = {
	/** Id of the placed building this refinery belongs to. */
	buildingId: number;
	/** World position at the building centre, for the interaction prompt. */
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

/**
 * Moves up to `amount` Raw Minerals from the carried load into a placed
 * refinery's input buffer; returns how much was moved. The buffer caps at
 * `TRANSFER.refineryInputCapacity`.
 */
export function depositIntoRefinery(
	buildingId: number,
	amount: number,
): number {
	const building = buildingsState.placed.find(
		(entry) => entry.id === buildingId,
	);
	if (building?.def.refines === undefined) return 0;

	const room = TRANSFER.refineryInputCapacity - getRefineryInput(buildingId);
	const moved = takeCarried(Math.min(amount, Math.max(room, 0)));
	if (moved > 0) depositRefineryInput(buildingId, moved);
	return moved;
}
