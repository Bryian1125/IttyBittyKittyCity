import { RESOURCES, type ResourceId } from '../lib/balance';

function readStartingAmounts(): Record<ResourceId, number> {
	const starting = {} as Record<ResourceId, number>;
	for (const id of Object.keys(RESOURCES) as ResourceId[]) {
		starting[id] = RESOURCES[id].starting;
	}
	return starting;
}

const amounts = $state<Record<ResourceId, number>>(readStartingAmounts());

/** Reactive read; components re-render when the amount changes. */
export function getResource(id: ResourceId): number {
	return amounts[id];
}

/** Adds while clamping at the resource's cap; non-positive amounts are ignored. */
export function addResource(id: ResourceId, amount: number): void {
	if (amount <= 0) return;
	amounts[id] = Math.min(RESOURCES[id].cap, amounts[id] + amount);
}

/** Deducts only when the full amount is available; never goes negative. */
export function spendResource(id: ResourceId, amount: number): boolean {
	if (amount < 0 || amounts[id] < amount) return false;
	amounts[id] -= amount;
	return true;
}

/** Exact check against every listed cost; an empty cost set is affordable. */
export function canAfford(costs: Partial<Record<ResourceId, number>>): boolean {
	for (const id of Object.keys(costs) as ResourceId[]) {
		const amount = costs[id];
		if (amount !== undefined && amounts[id] < amount) return false;
	}
	return true;
}
