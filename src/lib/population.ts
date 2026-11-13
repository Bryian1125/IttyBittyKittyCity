import { POPULATION } from './balance';

export type PopulationCore = {
	/** Current colonist count. */
	count: number;
	/** Seconds accrued toward the next arrival. */
	arrivalProgress: number;
	/** Food owed beyond what whole units could settle, carried onward. */
	foodDebt: number;
};

/**
 * One population tick. Charges upkeep first: the colony owes
 * `count * upkeepPerColonist` food per `upkeepSeconds`, settled in whole units
 * and never beyond `foodStock`, with the remainder carried as `foodDebt`.
 * Growth then advances only while the colony is fed — `foodStock` minus this
 * step's spend stays at or above `growthFoodFloor` — and housed (`count` below
 * `capacity`); at `arrivalSeconds` a colonist arrives and the progress resets.
 * When either condition fails, `arrivalProgress` holds. One arrival per step at
 * most. Pure: the argument is never mutated, and the returned core is fresh.
 */
export function populationStep(
	core: PopulationCore,
	delta: number,
	ctx: { capacity: number; foodStock: number },
): { core: PopulationCore; foodSpend: number; grew: boolean } {
	const debt =
		core.foodDebt +
		(core.count * POPULATION.upkeepPerColonist * delta) /
			POPULATION.upkeepSeconds;
	const foodSpend = Math.min(Math.floor(debt), ctx.foodStock);
	const foodDebt = debt - foodSpend;
	const starving = ctx.foodStock - foodSpend < POPULATION.growthFoodFloor;

	let { count, arrivalProgress } = core;
	let grew = false;
	if (!starving && count < ctx.capacity) {
		arrivalProgress += delta;
		if (arrivalProgress >= POPULATION.arrivalSeconds) {
			count += 1;
			arrivalProgress = 0;
			grew = true;
		}
	}

	return { core: { count, arrivalProgress, foodDebt }, foodSpend, grew };
}
