import { REFINING } from './balance';

/** One refinery's persistent input buffer and conversion progress. */
export type RefineryCore = { input: number; progress: number };

/**
 * Advances one refinery by `delta` seconds at the given power satisfaction.
 *
 * Progress accrues at `satisfaction` × real time, and every whole
 * `batchSeconds` of progress consumes `inputPerBatch` Raw Minerals and mints
 * `outputPerBatch` Materials. Satisfaction is clamped to [0, 1], so a short
 * grid freezes progress; an input below one batch does the same until the next
 * delivery, leaving any half-finished batch intact. Returns a new core and
 * never mutates `core`.
 */
export function advance(
	core: RefineryCore,
	delta: number,
	satisfaction: number,
): { core: RefineryCore; minted: number } {
	const rate = Math.min(Math.max(satisfaction, 0), 1);
	let input = core.input;
	let progress = core.progress;
	let minted = 0;

	if (input < REFINING.inputPerBatch) {
		return { core: { input, progress }, minted };
	}

	progress += delta * rate;
	while (progress >= REFINING.batchSeconds && input >= REFINING.inputPerBatch) {
		progress -= REFINING.batchSeconds;
		input -= REFINING.inputPerBatch;
		minted += REFINING.outputPerBatch;
	}

	return { core: { input, progress }, minted };
}
