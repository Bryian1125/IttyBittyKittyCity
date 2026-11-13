import type { BuildingDef } from '../lib/balance';
import { getBuildingCenter } from '../lib/placement';
import { populationStep, type PopulationCore } from '../lib/population';
import { buildingsState } from './buildings.svelte';
import { getResource, spendResource } from './resources.svelte';

export type ColonistView = {
	id: number;
	/** Current world position on the ground plane. */
	x: number;
	z: number;
};

/** Colonist walk-and-wait tuning for wandering around their housing. */
const MOVEMENT = {
	speed: 1.2,
	arrivalRadius: 0.2,
	wanderRadius: 3,
	waitMinSeconds: 1,
	waitMaxSeconds: 3,
};

type ColonistState = {
	id: number;
	/** Housing centre this colonist wanders around. */
	spawnX: number;
	spawnZ: number;
	x: number;
	z: number;
	targetX: number;
	targetZ: number;
	/** Seconds left standing still; 0 while walking. */
	waitRemaining: number;
};

let population = $state<PopulationCore>({
	count: 0,
	arrivalProgress: 0,
	foodDebt: 0,
});

const colonists = $state<ColonistState[]>([]);

let nextColonistId = 1;

/** Current colonist count. */
export function getPopulation(): number {
	return population.count;
}

/** Total housing slots across all placed buildings. */
export function getHousingCapacity(): number {
	let capacity = 0;
	for (const building of buildingsState.placed) {
		capacity += building.def.housing ?? 0;
	}
	return capacity;
}

/** True when the population satisfies the def's `unlock.minPopulation` gate. */
export function isUnlocked(def: BuildingDef): boolean {
	return (def.unlock?.minPopulation ?? 0) <= population.count;
}

/** One view per colonist for rendering; cheap to call every frame. */
export function colonistViews(): ColonistView[] {
	return colonists.map((colonist) => ({
		id: colonist.id,
		x: colonist.x,
		z: colonist.z,
	}));
}

/** Advances arrival, food upkeep, and colonist motion by `delta` seconds. */
export function tickPopulation(delta: number): void {
	const { core, foodSpend, grew } = populationStep(population, delta, {
		capacity: getHousingCapacity(),
		foodStock: getResource('food'),
	});
	population = core;

	if (foodSpend > 0) spendResource('food', foodSpend);
	if (grew) addColonist();
	moveColonists(delta);
}

/** Ground-plane centre of the first placed housing building; [0, 0] when none. */
function getHomeCenter(): [number, number] {
	for (const building of buildingsState.placed) {
		if (building.def.housing) {
			const [x, , z] = getBuildingCenter(
				building.anchor,
				building.def.footprint,
			);
			return [x, z];
		}
	}
	return [0, 0];
}

/** Spawns a colonist at its housing centre with a first wander target. */
function addColonist(): void {
	const [spawnX, spawnZ] = getHomeCenter();
	const colonist: ColonistState = {
		id: nextColonistId,
		spawnX,
		spawnZ,
		x: spawnX,
		z: spawnZ,
		targetX: spawnX,
		targetZ: spawnZ,
		waitRemaining: 0,
	};
	nextColonistId += 1;
	pickWanderTarget(colonist);
	colonists.push(colonist);
}

/** Picks a new point up to `wanderRadius` from the colonist's housing centre. */
function pickWanderTarget(colonist: ColonistState): void {
	const angle = Math.random() * Math.PI * 2;
	const radius = Math.random() * MOVEMENT.wanderRadius;
	colonist.targetX = colonist.spawnX + Math.cos(angle) * radius;
	colonist.targetZ = colonist.spawnZ + Math.sin(angle) * radius;
}

/** Walks every colonist toward its target, pausing between targets. */
function moveColonists(delta: number): void {
	for (const colonist of colonists) {
		if (colonist.waitRemaining > 0) {
			colonist.waitRemaining = Math.max(0, colonist.waitRemaining - delta);
			if (colonist.waitRemaining === 0) pickWanderTarget(colonist);
			continue;
		}

		const dx = colonist.targetX - colonist.x;
		const dz = colonist.targetZ - colonist.z;
		const distance = Math.hypot(dx, dz);
		const step = MOVEMENT.speed * delta;

		if (distance <= MOVEMENT.arrivalRadius || step >= distance) {
			colonist.x = colonist.targetX;
			colonist.z = colonist.targetZ;
			colonist.waitRemaining =
				MOVEMENT.waitMinSeconds +
				Math.random() * (MOVEMENT.waitMaxSeconds - MOVEMENT.waitMinSeconds);
			continue;
		}

		colonist.x += (dx / distance) * step;
		colonist.z += (dz / distance) * step;
	}
}
