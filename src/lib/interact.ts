export interface Interactable {
	/** Stable id, e.g. "node:mineral-1" or "refinery:3". */
	id: string;
	/** World position on the ground plane. */
	x: number;
	z: number;
	/** Max player distance at which this stays interactable. */
	radius: number;
	/** Prompt label, e.g. "Collect Raw Minerals". */
	label: string;
	/** Disabled entries are never picked. */
	enabled: boolean;
	act: () => void;
}

/** Nearest enabled interactable within its own radius; ties keep list order. */
export function pickNearest(
	list: ReadonlyArray<Interactable>,
	x: number,
	z: number,
): Interactable | undefined {
	let best: Interactable | undefined;
	let bestDistance = Number.POSITIVE_INFINITY;

	for (const item of list) {
		if (!item.enabled) continue;
		const distance = Math.hypot(item.x - x, item.z - z);
		if (distance > item.radius) continue;
		if (distance < bestDistance) {
			best = item;
			bestDistance = distance;
		}
	}

	return best;
}
