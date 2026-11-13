import type { BuildingDef, ResourceId } from '../lib/balance';
import {
	getPlacementProblem,
	nextRotation,
	type Cell,
	type PlacedBuilding,
	type PlacementProblem,
	type Rotation,
} from '../lib/placement';
import { isUnlocked } from './npcs.svelte';
import { canAfford, spendResource } from './resources.svelte';

type BuildingsState = {
	selected?: BuildingDef;
	cursor?: Cell;
	/** Quarter turns applied to the structure being placed. */
	rotation: Rotation;
	placed: PlacedBuilding[];
};

export const buildingsState = $state<BuildingsState>({ rotation: 0, placed: [] });

let nextId = 1;

export function startPlacing(def: BuildingDef): void {
	buildingsState.selected = def;
	buildingsState.cursor = undefined;
	buildingsState.rotation = 0;
}

export function stopPlacing(): void {
	buildingsState.selected = undefined;
	buildingsState.cursor = undefined;
	buildingsState.rotation = 0;
}

/** Turns the structure being placed one quarter turn clockwise. */
export function rotatePlacement(): void {
	buildingsState.rotation = nextRotation(buildingsState.rotation);
}

export function setPlacementCursor(cursor: Cell | undefined): void {
	buildingsState.cursor = cursor;
}

/**
 * null when the selected structure can go at the anchor; otherwise why not.
 * Also null while no structure is selected.
 */
export function getPlacementProblemAt(
	anchor: Cell,
	playerCell?: Cell,
): PlacementProblem | null {
	const def = buildingsState.selected;
	if (def === undefined) return null;

	const problem = getPlacementProblem(
		def,
		anchor,
		buildingsState.placed,
		playerCell,
		buildingsState.rotation,
	);
	if (problem !== null) return problem;
	if (!isUnlocked(def)) return 'locked';

	return canAfford(def.cost) ? null : 'unaffordable';
}

/** Charges the cost and commits the selected structure; null when blocked. */
export function confirmPlacement(
	anchor: Cell,
	playerCell?: Cell,
): PlacedBuilding | null {
	const def = buildingsState.selected;
	if (def === undefined || getPlacementProblemAt(anchor, playerCell) !== null)
		return null;

	for (const id of Object.keys(def.cost) as ResourceId[]) {
		const amount = def.cost[id];
		if (amount !== undefined) spendResource(id, amount);
	}

	const building: PlacedBuilding = {
		id: nextId,
		def,
		anchor,
		rotation: buildingsState.rotation,
	};
	nextId += 1;
	buildingsState.placed.push(building);
	return building;
}
