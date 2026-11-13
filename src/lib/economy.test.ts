import { describe, expect, it } from 'vitest';
import { advanceCollector, isWithinRange, stepRefinery } from './economy';

const RECIPE = { input: 3, output: 1, seconds: 8 };

describe('advanceCollector', () => {
	it('adds the per-minute rate scaled by delta', () => {
		expect(advanceCollector(0, 12, 60)).toBeCloseTo(12);
		expect(advanceCollector(5, 12, 30)).toBeCloseTo(11);
	});

	it('keeps the buffer unchanged for a zero delta', () => {
		expect(advanceCollector(7, 27, 0)).toBe(7);
	});
});

describe('stepRefinery', () => {
	it('completes a batch when the input is exactly enough', () => {
		expect(stepRefinery(3, 0, RECIPE, 8)).toEqual({
			input: 0,
			progress: 0,
			produced: 1,
		});
	});

	it('runs as many batches as the buffered input allows', () => {
		expect(stepRefinery(6, 0, RECIPE, 16)).toEqual({
			input: 0,
			progress: 0,
			produced: 2,
		});
	});

	it('holds progress mid-batch and converts when the time is up', () => {
		const midway = stepRefinery(3, 0, RECIPE, 4);

		expect(midway).toEqual({ input: 3, progress: 4, produced: 0 });
		expect(stepRefinery(midway.input, midway.progress, RECIPE, 4)).toEqual({
			input: 0,
			progress: 0,
			produced: 1,
		});
	});

	it('pauses without progress while starved', () => {
		expect(stepRefinery(2, 0, RECIPE, 100)).toEqual({
			input: 2,
			progress: 0,
			produced: 0,
		});
	});

	it('never spends input without producing', () => {
		const step = stepRefinery(5, 0, RECIPE, 8);

		expect(step.input).toBe(2);
		expect(step.produced).toBe(1);
	});
});

describe('isWithinRange', () => {
	it('measures centre-to-centre distance in cells', () => {
		expect(
			isWithinRange(
				{ column: 0, row: 0 },
				[2, 2],
				{ column: 10, row: 0 },
				[2, 2],
				12,
			),
		).toBe(true);
		expect(
			isWithinRange(
				{ column: 0, row: 0 },
				[2, 2],
				{ column: 10, row: 0 },
				[2, 2],
				9,
			),
		).toBe(false);
		expect(
			isWithinRange(
				{ column: 0, row: 0 },
				[2, 2],
				{ column: 0, row: 0 },
				[3, 3],
				1,
			),
		).toBe(true);
	});
});
