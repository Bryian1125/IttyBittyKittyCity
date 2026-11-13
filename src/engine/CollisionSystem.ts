import { Box3, Vector3 } from 'three';
import { sites, type BoxSpec } from '../lib/layout';

const PLAYER_HALF_SIZE = new Vector3(0.5, 0.5, 0.5);

/** Everything a collision volume needs; full BoxSpec authors satisfy this too. */
export type CollisionBox = Pick<BoxSpec, 'position' | 'size'>;

function toBox(spec: CollisionBox): Box3 {
	const half = new Vector3(...spec.size).multiplyScalar(0.5);
	return new Box3(
		new Vector3(...spec.position).sub(half),
		new Vector3(...spec.position).add(half),
	);
}

export class CollisionSystem {
	#playerBox = new Box3();
	#boxes: Box3[];

	constructor(specs: CollisionBox[] = sites) {
		this.#boxes = specs.map(toBox);
	}

	/** Adds a volume at runtime, e.g. when a building is placed. */
	addBox(spec: CollisionBox): void {
		this.#boxes.push(toBox(spec));
	}

	intersects(position: Vector3): boolean {
		this.#playerBox.min.copy(position).sub(PLAYER_HALF_SIZE);
		this.#playerBox.max.copy(position).add(PLAYER_HALF_SIZE);
		return this.#boxes.some((box) => this.#playerBox.intersectsBox(box));
	}
}
