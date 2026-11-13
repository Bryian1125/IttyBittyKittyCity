import type { PlacedBuilding } from './placement';

export type PowerTotals = {
	generate: number;
	demand: number;
	satisfaction: number;
};

/** Full output at ≥100% satisfaction; consumers scale proportionally below. */
export function computePower(
	buildings: ReadonlyArray<PlacedBuilding>,
): PowerTotals {
	let generate = 0;
	let demand = 0;
	for (const building of buildings) {
		generate += building.def.power.generate ?? 0;
		demand += building.def.power.draw ?? 0;
	}

	return {
		generate,
		demand,
		satisfaction: demand === 0 ? 1 : Math.min(1, generate / demand),
	};
}
