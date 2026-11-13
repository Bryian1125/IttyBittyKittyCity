import { COLLECTION } from '../lib/balance';
import {
	advanceCooldown,
	findNodeSpec,
	NODE_SPECS,
	planCollect,
	type NodeKind,
} from '../lib/nodes';
import { toolForKind } from '../lib/tools';
import { addCarried, getCarried, getCarryCapacity } from './carry.svelte';
import { addResource } from './resources.svelte';
import { getEquippedTool } from './tools.svelte';

export type NodeView = {
	/** Stable node id. */
	id: string;
	/** What the node yields; drives tool compatibility. */
	kind: NodeKind;
	/** World position on the ground plane. */
	x: number;
	z: number;
	/** Prompt label, e.g. "Collect Raw Minerals". */
	label: string;
	/** False while the node is on cooldown. */
	available: boolean;
};

/** Cooldown seconds left per node id; 0 means the node is available. */
const cooldowns = $state<Record<string, number>>(
	Object.fromEntries(NODE_SPECS.map((spec) => [spec.id, 0])),
);

/** One view per node; cheap to call every frame. */
export function nodeViews(): NodeView[] {
	return NODE_SPECS.map((spec) => ({
		id: spec.id,
		kind: spec.kind,
		x: spec.position.x,
		z: spec.position.z,
		label: spec.label,
		available: cooldowns[spec.id] <= 0,
	}));
}

/**
 * Collects from the node when possible: the equipped tool must target the
 * kind (mismatches are refused with feedback and start no cooldown), its
 * yield and cooldown modifiers apply, Raw Minerals go to the carried load
 * (rejected with feedback while full), Food and H3 to their pools. Returns
 * feedback text, or null when nothing happened.
 */
export function tryCollectNode(id: string): { text: string } | null {
	const spec = findNodeSpec(id);
	if (spec === undefined || cooldowns[id] > 0) return null;

	const tool = getEquippedTool();
	if (!tool.targets.includes(spec.kind)) {
		const required = toolForKind(spec.kind);
		return { text: `Requires the ${required?.name ?? 'right tool'}` };
	}

	const amount = COLLECTION.yieldPerCollect * tool.yieldMultiplier;
	const plan = planCollect(spec.kind, getCarried(), getCarryCapacity(), amount);
	if (plan.outcome === 'rejected') return { text: plan.text };

	if (plan.outcome === 'pool') {
		addResource(plan.resource, plan.amount);
	} else {
		addCarried(plan.amount);
	}

	cooldowns[id] = COLLECTION.cooldownSeconds * tool.cooldownMultiplier;
	return { text: plan.text };
}

/** Advances node cooldowns by `delta` seconds. */
export function tickNodes(delta: number): void {
	for (const spec of NODE_SPECS) {
		const remaining = cooldowns[spec.id];
		if (remaining <= 0) continue;

		const next = advanceCooldown(remaining, delta);
		if (next !== remaining) cooldowns[spec.id] = next;
	}
}
