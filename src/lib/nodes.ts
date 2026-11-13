import { COLLECTION, type ResourceId } from './balance';

export type NodeKind = 'mineral' | 'h3' | 'food';

export type NodeSpec = {
	/** Stable node id, e.g. "mineral-1". */
	id: string;
	kind: NodeKind;
	/** Ground position; nodes rest on the floor, so y is always 0. */
	position: { x: number; z: number };
	/** Interact prompt, e.g. "Collect Raw Minerals". */
	label: string;
};

/**
 * The nine hand-gathering nodes: three per kind, placed within |x|, |z| ≤ 20
 * and at least two world units clear of every obstacle box in `layout.ts`.
 */
export const NODE_SPECS: readonly NodeSpec[] = [
	{
		id: 'mineral-1',
		kind: 'mineral',
		position: { x: -8, z: -8 },
		label: 'Collect Raw Minerals',
	},
	{
		id: 'mineral-2',
		kind: 'mineral',
		position: { x: 16, z: -8 },
		label: 'Collect Raw Minerals',
	},
	{
		id: 'mineral-3',
		kind: 'mineral',
		position: { x: -6, z: 16 },
		label: 'Collect Raw Minerals',
	},
	{
		id: 'h3-1',
		kind: 'h3',
		position: { x: -4, z: 12 },
		label: 'Collect H3',
	},
	{
		id: 'h3-2',
		kind: 'h3',
		position: { x: 18, z: 14 },
		label: 'Collect H3',
	},
	{
		id: 'h3-3',
		kind: 'h3',
		position: { x: -18, z: 2 },
		label: 'Collect H3',
	},
	{
		id: 'food-1',
		kind: 'food',
		position: { x: 0, z: 17 },
		label: 'Collect Food',
	},
	{
		id: 'food-2',
		kind: 'food',
		position: { x: 9, z: -17 },
		label: 'Collect Food',
	},
	{
		id: 'food-3',
		kind: 'food',
		position: { x: 8, z: 4 },
		label: 'Collect Food',
	},
];

const BY_ID = new Map(NODE_SPECS.map((spec) => [spec.id, spec]));

/** The node spec with this id, or undefined when no node matches. */
export function findNodeSpec(id: string): NodeSpec | undefined {
	return BY_ID.get(id);
}

/**
 * Cooldown reducer: seconds remaining after `delta`, clamped at zero so a ready
 * node stays ready; a non-positive delta never adds time.
 */
export function advanceCooldown(remaining: number, delta: number): number {
	return Math.max(0, remaining - Math.max(0, delta));
}

/** Where a successful collect lands and what it reports. */
export type CollectPlan =
	| { outcome: 'carried'; amount: number; text: string }
	| { outcome: 'pool'; resource: ResourceId; amount: number; text: string }
	| { outcome: 'rejected'; text: string };

/**
 * Collect decision for one kind: Food and H3 always land in their colony pools;
 * Raw Minerals ride the carried load and are rejected outright — yielding
 * nothing and starting no cooldown — while the load lacks room for the full
 * yield.
 */
export function planCollect(
	kind: NodeKind,
	carried: number,
	capacity: number,
): CollectPlan {
	const amount = COLLECTION.yieldPerCollect;

	if (kind === 'h3') {
		return { outcome: 'pool', resource: 'h3', amount, text: `+${amount} H3` };
	}
	if (kind === 'food') {
		return {
			outcome: 'pool',
			resource: 'food',
			amount,
			text: `+${amount} Food`,
		};
	}
	if (carried + amount > capacity) {
		return {
			outcome: 'rejected',
			text: 'Carried full — deliver to the Refinery',
		};
	}
	return { outcome: 'carried', amount, text: `+${amount} Raw Minerals` };
}
