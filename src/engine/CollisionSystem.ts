import { Box3, Vector3 } from 'three';
import { obstacles, type BoxSpec } from '../lib/layout';

const PLAYER_HALF_SIZE = new Vector3(0.5, 0.5, 0.5);

function toBox(spec: BoxSpec): Box3 {
	const half = new Vector3(...spec.size).multiplyScalar(0.5);
	return new Box3(
		new Vector3(...spec.position).sub(half),
		new Vector3(...spec.position).add(half),
	);
}

export class CollisionSystem {
	private readonly playerBox = new Box3();
	private readonly boxes: Box3[];

	constructor(specs: BoxSpec[] = obstacles) {
		this.boxes = specs.map(toBox);
	}

	intersects(position: Vector3): boolean {
		this.playerBox.min.copy(position).sub(PLAYER_HALF_SIZE);
		this.playerBox.max.copy(position).add(PLAYER_HALF_SIZE);
		return this.boxes.some((box) => this.playerBox.intersectsBox(box));
	}
}
