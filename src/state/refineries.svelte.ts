import { REFINING } from '../lib/balance';
import { computePower } from '../lib/power';
import { getBuildingCenter, type PlacedBuilding } from '../lib/placement';
import { advance, type RefineryCore } from '../lib/refining';
import { buildingsState } from './buildings.svelte';
import { getCarried, takeCarried } from './carry.svelte';
import { addResource } from './resources.svelte';

/** working: fed and powered; starved: input below one batch; low-power: satisfaction < 1. */
export type RefineryStatus = 'working' | 'starved' | 'low-power';

export type RefineryView = {
	/** Id of the placed building this refinery belongs to. */
	buildingId: number;
	/** World position at the building centre, for the interaction prompt. */
	x: number;
	z: number;
	/** Raw Minerals currently in the input buffer. */
	input: number;
	/** Input buffer capacity (`REFINING.bufferCapacity`). */
	capacity: number;
	status: RefineryStatus;
};

/**
 * Live buffers, keyed by building id; a plain object rather than a `Map`,
 * because `$state` does not proxy maps and `refineryViews()` readers must
 * re-render on every write.
 */
const cores = $state<Partial<Record<number, RefineryCore>>>({});

/** Processors convert; the refinery is the only one in the registry today. */
function isProcessor(building: PlacedBuilding): boolean {
	return building.def.category === 'processor';
}

/**
 * Creates a buffer for every placed processor and drops the buffers of
 * buildings that are gone or no longer convert. Returns the placed processors.
 */
function syncCores(): PlacedBuilding[] {
	const placed = buildingsState.placed.filter(isProcessor);

	for (const building of placed) {
		cores[building.id] ??= { input: 0, progress: 0 };
	}

	for (const key of Object.keys(cores)) {
		const id = Number(key);
		if (!placed.some((building) => building.id === id)) delete cores[id];
	}

	return placed;
}

/** Starved outranks low-power: an empty buffer converts nothing at any rate. */
function getStatus(input: number, satisfaction: number): RefineryStatus {
	if (input < REFINING.inputPerBatch) return 'starved';
	if (satisfaction < 1) return 'low-power';
	return 'working';
}

/** One view per placed refinery; cheap to call every frame. */
export function refineryViews(): RefineryView[] {
	const satisfaction = computePower(buildingsState.placed).satisfaction;

	return buildingsState.placed.filter(isProcessor).map((building) => {
		const center = getBuildingCenter(building.anchor, building.def.footprint);
		const input = cores[building.id]?.input ?? 0;

		return {
			buildingId: building.id,
			x: center[0],
			z: center[2],
			input,
			capacity: REFINING.bufferCapacity,
			status: getStatus(input, satisfaction),
		};
	});
}

/**
 * Moves up to `amount` Raw Minerals from the carried load into the refinery's
 * input buffer (capacity-capped; the remainder stays carried). Returns how
 * much was moved.
 */
export function depositIntoRefinery(
	buildingId: number,
	amount: number,
): number {
	const building = buildingsState.placed.find(
		(entry) => entry.id === buildingId,
	);
	if (building === undefined || !isProcessor(building)) return 0;

	const buffer = cores[buildingId];
	const input = buffer?.input ?? 0;
	const moved = Math.min(amount, getCarried(), REFINING.bufferCapacity - input);
	if (moved <= 0) return 0;

	takeCarried(moved);
	cores[buildingId] = { input: input + moved, progress: buffer?.progress ?? 0 };
	return moved;
}

/** Advances every placed refinery by `delta` seconds. */
export function tickRefineries(delta: number): void {
	const satisfaction = computePower(buildingsState.placed).satisfaction;

	for (const building of syncCores()) {
		const core = cores[building.id];
		if (core === undefined) continue; // syncCores has just created it

		const { core: next, minted } = advance(core, delta, satisfaction);

		// A starved refinery changes nothing, so leave its buffer untouched.
		if (next.input !== core.input || next.progress !== core.progress) {
			core.input = next.input;
			core.progress = next.progress;
		}

		if (minted > 0) addResource('materials', minted);
	}
}
