import type { BuildingDef, ResourceId } from '../lib/balance';
import {
	getPlacementProblem,
	type Cell,
	type PlacedBuilding,
	type PlacementProblem,
} from '../lib/placement';
import { canAfford, spendResource } from './resources.svelte';

type BuildingsState = {
	selected?: BuildingDef;
	cursor?: Cell;
	placed: PlacedBuilding[];
};

export const buildingsState = $state<BuildingsState>({ placed: [] });

let nextId = 1;

export function startPlacing(def: BuildingDef): void {
	buildingsState.selected = def;
	buildingsState.cursor = undefined;
}

export function stopPlacing(): void {
	buildingsState.selected = undefined;
	buildingsState.cursor = undefined;
}

export function setPlacementCursor(cursor: Cell | undefined): void {
	buildingsState.cursor = cursor;
}

/**
 * null when the selected structure can go at the anchor; otherwise why not.
 * Also null while no structure is selected.
 */
export function getPlacementProblemAt(anchor: Cell): PlacementProblem | null {
	const def = buildingsState.selected;
	if (def === undefined) return null;

	const problem = getPlacementProblem(
		anchor,
		def.footprint,
		buildingsState.placed,
	);
	if (problem !== null) return problem;

	return canAfford(def.cost) ? null : 'unaffordable';
}

/** Charges the cost and commits the selected structure; null when blocked. */
export function confirmPlacement(anchor: Cell): PlacedBuilding | null {
	const def = buildingsState.selected;
	if (def === undefined || getPlacementProblemAt(anchor) !== null) return null;

	for (const id of Object.keys(def.cost) as ResourceId[]) {
		const amount = def.cost[id];
		if (amount !== undefined) spendResource(id, amount);
	}

	const building: PlacedBuilding = { id: nextId, def, anchor };
	nextId += 1;
	buildingsState.placed.push(building);
	return building;
}
