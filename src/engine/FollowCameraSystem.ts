import { Euler, Matrix4, PerspectiveCamera, Vector3, type Camera } from 'three';

const OFFSET = new Vector3(0, 20, 16);
const FOLLOW_SPEED = 3.5;
const FOV = 35;

const FIXED_ROTATION = new Euler().setFromRotationMatrix(
	new Matrix4().lookAt(OFFSET, new Vector3(0, 0, 0), new Vector3(0, 1, 0)),
);

export class FollowCameraSystem {
	private readonly desiredPosition = new Vector3();

	initialize(camera: Camera): void {
		if (camera instanceof PerspectiveCamera) {
			camera.fov = FOV;
			camera.updateProjectionMatrix();
		}
		camera.rotation.copy(FIXED_ROTATION);
	}

	update(delta: number, camera: Camera, target: Vector3): void {
		this.desiredPosition.copy(target).add(OFFSET);

		// Exponential smoothing: no velocity state, no allocations, and it
		// naturally produces acceleration/deceleration as the camera eases
		// toward the player each frame.
		const smoothing = 1 - Math.exp(-FOLLOW_SPEED * delta);
		camera.position.lerp(this.desiredPosition, smoothing);
	}
}
