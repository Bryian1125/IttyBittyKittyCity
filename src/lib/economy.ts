import type { RefineryRecipe } from './balance';
import type { Cell } from './placement';

/** Collector buffer growth; rates are per minute and delta is in seconds. */
export function advanceCollector(
	buffer: number,
	ratePerMinute: number,
	delta: number,
): number {
	return buffer + (ratePerMinute * delta) / 60;
}

export type RefineryStep = {
	input: number;
	progress: number;
	produced: number;
};

/**
 * Advances a refinery by delta seconds. Batches complete only while enough
 * input is buffered; a starved refinery keeps no partial progress.
 */
export function stepRefinery(
	input: number,
	progress: number,
	recipe: RefineryRecipe,
	delta: number,
): RefineryStep {
	let remainingInput = input;
	let remainingTime = progress + delta;
	let produced = 0;

	while (remainingTime >= recipe.seconds && remainingInput >= recipe.input) {
		remainingTime -= recipe.seconds;
		remainingInput -= recipe.input;
		produced += recipe.output;
	}

	return {
		input: remainingInput,
		progress: remainingInput >= recipe.input ? remainingTime : 0,
		produced,
	};
}

/** Cell-space distance between two structures' centres. */
export function isWithinRange(
	from: Cell,
	fromFootprint: [number, number],
	to: Cell,
	toFootprint: [number, number],
	rangeCells: number,
): boolean {
	const fromX = from.column + (fromFootprint[0] - 1) / 2;
	const fromZ = from.row + (fromFootprint[1] - 1) / 2;
	const toX = to.column + (toFootprint[0] - 1) / 2;
	const toZ = to.row + (toFootprint[1] - 1) / 2;
	return Math.hypot(fromX - toX, fromZ - toZ) <= rangeCells;
}
