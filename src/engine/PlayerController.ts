import { Vector3, type Object3D } from 'three';
import { CollisionSystem } from './CollisionSystem';

export interface MovementInput {
	forward: boolean;
	backward: boolean;
	left: boolean;
	right: boolean;
}

export class PlayerController {
	private readonly forward = new Vector3();
	private readonly right = new Vector3();
	private readonly move = new Vector3();

	constructor(
		private readonly target: Object3D,
		private readonly collision: CollisionSystem,
		private readonly speed = 5,
	) {}

	update(delta: number, input: MovementInput, yaw: number): void {
		// Basis follows the camera yaw: W always moves away from the camera,
		// regardless of how many times it has been rotated.
		this.forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
		this.right.set(Math.cos(yaw), 0, -Math.sin(yaw));

		const x = (input.right ? 1 : 0) - (input.left ? 1 : 0);
		const z = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
		if (x === 0 && z === 0) return;

		this.move.set(0, 0, 0).addScaledVector(this.right, x).addScaledVector(this.forward, z).normalize().multiplyScalar(this.speed * delta);

		this.moveAxis('x', this.move.x);
		this.moveAxis('z', this.move.z);
	}

	private moveAxis(axis: 'x' | 'z', step: number): void {
		if (step === 0) return;

		this.target.position[axis] += step;
		if (this.collision.intersects(this.target.position)) {
			this.target.position[axis] -= step;
		}
	}
}
