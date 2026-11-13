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

/** Colonist spawn and walk-and-wait tuning around their housing. */
const MOVEMENT = {
	speed: 1.2,
	arrivalRadius: 0.2,
	/** Open ground kept between the housing footprint and the spawn point. */
	spawnClearance: 0.6,
	/** Open ground kept between the footprint edge and the nearest wander point. */
	wanderClearance: 0.7,
	/** Extra distance a wander target may reach beyond that clearance. */
	wanderSpread: 3.2,
	waitMinSeconds: 1,
	waitMaxSeconds: 3,
};

type ColonistState = {
	id: number;
	/** Housing centre this colonist wanders around. */
	homeX: number;
	homeZ: number;
	/** Footprint of that housing, [width, depth]; wander targets stay outside it. */
	homeFootprint: [number, number];
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

/** Centre and footprint of the next colonist's home, round-robin over placed housing. */
function pickHome(): { x: number; z: number; footprint: [number, number] } {
	const homes = buildingsState.placed.filter(
		(building) => building.def.housing,
	);
	const home = homes[nextColonistId % homes.length];
	if (home === undefined) return { x: 0, z: 0, footprint: [0, 0] };

	const [x, , z] = getBuildingCenter(home.anchor, home.def.footprint);
	return { x, z, footprint: home.def.footprint };
}

/** Spawns a colonist beside its housing block, then picks a wander target. */
function addColonist(): void {
	const home = pickHome();
	// Outward along +x, clear of the footprint: never inside a block.
	const spawnX = home.x + home.footprint[0] / 2 + MOVEMENT.spawnClearance;

	const colonist: ColonistState = {
		id: nextColonistId,
		homeX: home.x,
		homeZ: home.z,
		homeFootprint: home.footprint,
		x: spawnX,
		z: home.z,
		targetX: spawnX,
		targetZ: home.z,
		waitRemaining: 0,
	};
	nextColonistId += 1;
	pickWanderTarget(colonist);
	colonists.push(colonist);
}

/** Distance from the home centre to its footprint edge along the chosen angle. */
function footprintEdgeDistance(
	footprint: [number, number],
	angle: number,
): number {
	return Math.min(
		footprint[0] / 2 / Math.abs(Math.cos(angle)),
		footprint[1] / 2 / Math.abs(Math.sin(angle)),
	);
}

/** Picks a new point in the open ground around the colonist's housing block. */
function pickWanderTarget(colonist: ColonistState): void {
	const angle = Math.random() * Math.PI * 2;
	const halfExtent = Math.max(
		colonist.homeFootprint[0] / 2,
		colonist.homeFootprint[1] / 2,
	);
	// `halfExtent` alone dips inside the corners of a square footprint, so the
	// inner bound is raised to the footprint edge along the angle there.
	const inner =
		Math.max(halfExtent, footprintEdgeDistance(colonist.homeFootprint, angle)) +
		MOVEMENT.wanderClearance;
	const radius = inner + Math.random() * MOVEMENT.wanderSpread;

	colonist.targetX = colonist.homeX + Math.cos(angle) * radius;
	colonist.targetZ = colonist.homeZ + Math.sin(angle) * radius;
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
