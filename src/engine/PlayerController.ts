import type { Object3D } from 'three';

export interface MovementInput {
	forward: boolean;
	backward: boolean;
	left: boolean;
	right: boolean;
}

export class PlayerController {
	constructor(
		private readonly target: Object3D,
		private readonly speed = 5,
	) {}

	update(delta: number, input: MovementInput): void {
		const x = (input.right ? 1 : 0) - (input.left ? 1 : 0);
		const z = (input.backward ? 1 : 0) - (input.forward ? 1 : 0);
		if (x === 0 && z === 0) return;

		const length = Math.hypot(x, z);
		this.target.position.x += (x / length) * this.speed * delta;
		this.target.position.z += (z / length) * this.speed * delta;
	}
}
