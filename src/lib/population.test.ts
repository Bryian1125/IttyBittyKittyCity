import { describe, expect, it } from 'vitest';
import { POPULATION } from './balance';
import { populationStep, type PopulationCore } from './population';

function makeCore(overrides: Partial<PopulationCore> = {}): PopulationCore {
	return { count: 0, arrivalProgress: 0, foodDebt: 0, ...overrides };
}

const fedAndHoused = { capacity: 4, foodStock: 100 };

describe('populationStep', () => {
	it('delivers the first colonist after exactly the arrival time', () => {
		const short = populationStep(makeCore(), POPULATION.arrivalSeconds - 1, {
			capacity: 1,
			foodStock: POPULATION.growthFoodFloor,
		});
		expect(short.grew).toBe(false);
		expect(short.core.count).toBe(0);

		const arrived = populationStep(makeCore(), POPULATION.arrivalSeconds, {
			capacity: 1,
			foodStock: POPULATION.growthFoodFloor,
		});
		expect(arrived.grew).toBe(true);
		expect(arrived.core.count).toBe(1);
		expect(arrived.core.arrivalProgress).toBe(0);
	});

	it('grows on the step that crosses the arrival threshold', () => {
		const core = makeCore({ arrivalProgress: POPULATION.arrivalSeconds - 1 });

		const before = populationStep(core, 0.5, fedAndHoused);
		expect(before.grew).toBe(false);
		expect(before.core.count).toBe(0);

		const after = populationStep(before.core, 0.5, fedAndHoused);
		expect(after.grew).toBe(true);
		expect(after.core.count).toBe(1);
	});

	it('never grows without capacity and holds arrival progress', () => {
		const result = populationStep(makeCore(), 1000, {
			capacity: 0,
			foodStock: 999,
		});

		expect(result.grew).toBe(false);
		expect(result.core.count).toBe(0);
		expect(result.core.arrivalProgress).toBe(0);
	});

	it('never exceeds capacity and holds progress once full', () => {
		const result = populationStep(
			makeCore({ count: 2, arrivalProgress: 20 }),
			100,
			{ capacity: 2, foodStock: 999 },
		);

		expect(result.grew).toBe(false);
		expect(result.core.count).toBe(2);
		expect(result.core.arrivalProgress).toBe(20);
	});

	it('adds at most one colonist per step', () => {
		const result = populationStep(makeCore(), 1000, {
			capacity: 10,
			foodStock: 999,
		});

		expect(result.grew).toBe(true);
		expect(result.core.count).toBe(1);
		expect(result.core.arrivalProgress).toBe(0);
	});

	it('pauses growth while the remaining food is below the floor', () => {
		// One colonist eats one unit over upkeepSeconds, leaving 4 of the 5.
		const result = populationStep(
			makeCore({ count: 1, arrivalProgress: 10 }),
			POPULATION.upkeepSeconds,
			{ capacity: 4, foodStock: POPULATION.growthFoodFloor },
		);

		expect(result.foodSpend).toBe(1);
		expect(result.grew).toBe(false);
		expect(result.core.arrivalProgress).toBe(10);
	});

	it('treats food exactly at the floor as fed', () => {
		const result = populationStep(makeCore(), POPULATION.arrivalSeconds, {
			capacity: 1,
			foodStock: POPULATION.growthFoodFloor,
		});

		expect(result.grew).toBe(true);
	});

	it('spends in whole units only', () => {
		const result = populationStep(
			makeCore({ count: 1 }),
			POPULATION.upkeepSeconds / 2,
			fedAndHoused,
		);

		expect(result.foodSpend).toBe(0);
		expect(result.core.foodDebt).toBe(0.5);
	});

	it('caps the spend at the stock and keeps the rest owed', () => {
		const result = populationStep(
			makeCore({ count: 2, foodDebt: 1 }),
			POPULATION.upkeepSeconds,
			{ capacity: 4, foodStock: 2 },
		);

		expect(result.foodSpend).toBe(2);
		expect(result.core.foodDebt).toBe(1);
	});

	it('spends nothing and accrues debt when the stock is empty', () => {
		const result = populationStep(
			makeCore({ count: 1 }),
			POPULATION.upkeepSeconds,
			{
				capacity: 4,
				foodStock: 0,
			},
		);

		expect(result.foodSpend).toBe(0);
		expect(result.core.foodDebt).toBe(1);
	});

	it('carries fractional debt across steps', () => {
		// At capacity, so the only thing crossing the step boundary is the debt.
		const full = { capacity: 1, foodStock: 100 };

		const first = populationStep(
			makeCore({ count: 1 }),
			POPULATION.upkeepSeconds / 2,
			full,
		);
		expect(first.foodSpend).toBe(0);

		const second = populationStep(
			first.core,
			POPULATION.upkeepSeconds / 2,
			full,
		);
		expect(second.foodSpend).toBe(1);
		expect(second.core.foodDebt).toBe(0);
	});

	it('returns a new core without mutating the argument', () => {
		const core = makeCore({ count: 1, arrivalProgress: 5, foodDebt: 0.5 });

		const result = populationStep(
			core,
			POPULATION.upkeepSeconds / 2,
			fedAndHoused,
		);

		expect(result.core).not.toBe(core);
		expect(core).toEqual({ count: 1, arrivalProgress: 5, foodDebt: 0.5 });
	});
});
