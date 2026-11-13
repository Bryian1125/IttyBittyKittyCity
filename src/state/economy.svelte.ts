import { SvelteMap } from 'svelte/reactivity';
import { TRANSFER } from '../lib/balance';
import { advanceCollector, isWithinRange, stepRefinery } from '../lib/economy';
import { computePower } from '../lib/power';
import { getBuildingCenter, type PlacedBuilding } from '../lib/placement';
import { buildingsState } from './buildings.svelte';
import { addResource } from './resources.svelte';

export type TransferPacket = {
	id: number;
	fromId: number;
	toId: number;
	amount: number;
	from: [number, number, number];
	to: [number, number, number];
	progress: number;
};

const buffers = new SvelteMap<number, number>();
const refineryInputs = new SvelteMap<number, number>();
const refineryProgress = new SvelteMap<number, number>();

/** In-flight collector → refinery packets, animated by EconomyLayer. */
export const transferPackets = $state<TransferPacket[]>([]);

let nextPacketId = 1;

/** Per-frame economy: extraction, refinery pulling, and conversion. */
export function tickEconomy(delta: number): void {
	// Machines run at the grid's satisfaction ratio; transports keep their own
	// schedule regardless of power.
	const powered = delta * computePower(buildingsState.placed).satisfaction;

	for (const building of buildingsState.placed) {
		extract(building, powered);
	}
	for (const building of buildingsState.placed) {
		pullAndRefine(building, powered);
	}
	advancePackets(delta);
}

function extract(building: PlacedBuilding, delta: number): void {
	const mines = building.def.mines;
	if (mines !== undefined) {
		const buffered = buffers.get(building.id) ?? 0;
		buffers.set(
			building.id,
			advanceCollector(buffered, mines.ratePerMinute, delta),
		);
	}

	const produces = building.def.produces;
	if (produces !== undefined) {
		addResource(produces.resource, (produces.ratePerMinute * delta) / 60);
	}
}

function pullAndRefine(refinery: PlacedBuilding, delta: number): void {
	const refines = refinery.def.refines;
	if (refines === undefined) return;

	const input = refineryInputs.get(refinery.id) ?? 0;

	for (const collector of buildingsState.placed) {
		if (collector.def.mines === undefined) continue;

		const buffered = buffers.get(collector.id) ?? 0;
		if (buffered <= 0 || input >= TRANSFER.refineryInputCapacity) continue;
		if (hasPacketFrom(collector.id)) continue;
		if (
			!isWithinRange(
				collector.anchor,
				collector.def.footprint,
				refinery.anchor,
				refinery.def.footprint,
				refines.rangeCells,
			)
		) {
			continue;
		}

		buffers.set(collector.id, 0);
		transferPackets.push({
			id: nextPacketId,
			fromId: collector.id,
			toId: refinery.id,
			amount: buffered,
			from: getBuildingCenter(collector.anchor, collector.def.footprint),
			to: getBuildingCenter(refinery.anchor, refinery.def.footprint),
			progress: 0,
		});
		nextPacketId += 1;
	}

	const step = stepRefinery(
		input,
		refineryProgress.get(refinery.id) ?? 0,
		refines.recipe,
		delta,
	);
	refineryInputs.set(refinery.id, step.input);
	refineryProgress.set(refinery.id, step.progress);
	if (step.produced > 0) addResource('materials', step.produced);
}

function advancePackets(delta: number): void {
	for (let index = transferPackets.length - 1; index >= 0; index -= 1) {
		const packet = transferPackets[index];
		packet.progress = Math.min(1, packet.progress + delta / TRANSFER.seconds);
		if (packet.progress < 1) continue;

		const input = refineryInputs.get(packet.toId) ?? 0;
		refineryInputs.set(
			packet.toId,
			Math.min(TRANSFER.refineryInputCapacity, input + packet.amount),
		);
		transferPackets.splice(index, 1);
	}
}

function hasPacketFrom(collectorId: number): boolean {
	return transferPackets.some((packet) => packet.fromId === collectorId);
}

/** Raw Minerals currently buffered for conversion at a refinery. */
export function getRefineryInput(buildingId: number): number {
	return refineryInputs.get(buildingId) ?? 0;
}

/**
 * Player deposit into a refinery's input buffer, capacity-capped; returns how
 * much was accepted (the caller moves the same amount out of the carried load).
 */
export function depositRefineryInput(
	buildingId: number,
	amount: number,
): number {
	const current = refineryInputs.get(buildingId) ?? 0;
	const accepted = Math.min(
		Math.max(amount, 0),
		TRANSFER.refineryInputCapacity - current,
	);
	if (accepted <= 0) return 0;
	refineryInputs.set(buildingId, current + accepted);
	return accepted;
}
