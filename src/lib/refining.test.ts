import { describe, expect, it } from 'vitest';
import { REFINING } from './balance';
import { advance, type RefineryCore } from './refining';

function core(input: number, progress = 0): RefineryCore {
	return { input, progress };
}

describe('advance', () => {
	it('leaves buffer and progress alone while starved', () => {
		const result = advance(core(REFINING.inputPerBatch - 1, 4), 10, 1);

		expect(result.minted).toBe(0);
		expect(result.core).toEqual({
			input: REFINING.inputPerBatch - 1,
			progress: 4,
		});
	});

	it('mints one batch exactly at batchSeconds with full satisfaction', () => {
		const short = advance(
			core(REFINING.inputPerBatch),
			REFINING.batchSeconds - 0.01,
			1,
		);
		expect(short.minted).toBe(0);

		const result = advance(
			core(REFINING.inputPerBatch),
			REFINING.batchSeconds,
			1,
		);

		expect(result.minted).toBe(REFINING.outputPerBatch);
		expect(result.core.input).toBe(0);
		expect(result.core.progress).toBe(0);
	});

	it('mints every whole batch in one large delta', () => {
		const result = advance(
			core(REFINING.bufferCapacity),
			REFINING.batchSeconds * 3,
			1,
		);

		expect(result.minted).toBe(REFINING.outputPerBatch * 3);
		expect(result.core.input).toBe(
			REFINING.bufferCapacity - REFINING.inputPerBatch * 3,
		);
		expect(result.core.progress).toBe(0);
	});

	it('stops at the empty buffer and keeps the leftover progress', () => {
		const result = advance(
			core(REFINING.inputPerBatch * 2),
			REFINING.batchSeconds * 5,
			1,
		);

		expect(result.minted).toBe(REFINING.outputPerBatch * 2);
		expect(result.core.input).toBe(0);
		expect(result.core.progress).toBe(REFINING.batchSeconds * 3);
	});

	it('freezes progress at zero satisfaction', () => {
		const result = advance(core(6, 4), REFINING.batchSeconds, 0);

		expect(result.minted).toBe(0);
		expect(result.core).toEqual({ input: 6, progress: 4 });
	});

	it('doubles the time to mint at half satisfaction', () => {
		const half = advance(
			core(REFINING.inputPerBatch),
			REFINING.batchSeconds,
			0.5,
		);

		expect(half.minted).toBe(0);
		expect(half.core.progress).toBe(REFINING.batchSeconds / 2);

		const full = advance(half.core, REFINING.batchSeconds, 0.5);

		expect(full.minted).toBe(REFINING.outputPerBatch);
		expect(full.core.input).toBe(0);
		expect(full.core.progress).toBe(0);
	});

	it('clamps satisfaction into [0, 1]', () => {
		const over = advance(
			core(REFINING.inputPerBatch),
			REFINING.batchSeconds,
			4,
		);
		expect(over.minted).toBe(REFINING.outputPerBatch);

		const under = advance(core(REFINING.inputPerBatch, 3), 10, -2);
		expect(under.minted).toBe(0);
		expect(under.core.progress).toBe(3);
	});

	it('consumes exactly one batch from a buffer holding one batch', () => {
		const first = advance(
			core(REFINING.inputPerBatch),
			REFINING.batchSeconds,
			1,
		);
		expect(first.minted).toBe(REFINING.outputPerBatch);
		expect(first.core.input).toBe(0);

		const second = advance(first.core, REFINING.batchSeconds, 1);

		expect(second.minted).toBe(0);
		expect(second.core).toEqual({ input: 0, progress: 0 });
	});

	it('returns a new core without mutating the argument', () => {
		const original = core(6, 4);

		const result = advance(original, REFINING.batchSeconds, 1);

		expect(result.core).not.toBe(original);
		expect(original).toEqual({ input: 6, progress: 4 });
	});
});
