import type { Object3D } from 'three';
import { CollisionSystem } from './CollisionSystem';

export interface MovementInput {
	forward: boolean;
	backward: boolean;
	left: boolean;
	right: boolean;
}

export class PlayerController {
	constructor(
		private readonly target: Object3D,
		private readonly collision: CollisionSystem,
		private readonly speed = 5,
	) {}

	update(delta: number, input: MovementInput): void {
		const x = (input.right ? 1 : 0) - (input.left ? 1 : 0);
		const z = (input.backward ? 1 : 0) - (input.forward ? 1 : 0);
		if (x === 0 && z === 0) return;

		const length = Math.hypot(x, z);
		this.moveAxis('x', (x / length) * this.speed * delta);
		this.moveAxis('z', (z / length) * this.speed * delta);
	}

	private moveAxis(axis: 'x' | 'z', step: number): void {
		if (step === 0) return;

		this.target.position[axis] += step;
		if (this.collision.intersects(this.target.position)) {
			this.target.position[axis] -= step;
		}
	}
}
