import { CARRY } from '../lib/balance';

const carried = $state({ amount: 0 });

/** Raw Minerals currently hauled by the player. */
export function getCarried(): number {
	return carried.amount;
}

/** Hauling capacity. */
export function getCarryCapacity(): number {
	return CARRY.capacity;
}

/** Stores up to the remaining capacity; returns how much was actually stored. */
export function addCarried(amount: number): number {
	if (amount <= 0) return 0;
	const stored = Math.min(amount, CARRY.capacity - carried.amount);
	carried.amount += stored;
	return stored;
}

/** Removes up to `max`; returns how much was removed. */
export function takeCarried(max: number): number {
	const removed = Math.min(Math.max(max, 0), carried.amount);
	carried.amount -= removed;
	return removed;
}
