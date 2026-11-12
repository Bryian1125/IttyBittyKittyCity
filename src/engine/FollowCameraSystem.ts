import { Euler, Matrix4, PerspectiveCamera, Vector3, type Camera } from 'three';

const OFFSET = new Vector3(0, 20, 16);
const FOLLOW_SPEED = 3.5;
const FOV = 35;

const ZOOM_MAX = 1; // current distance is the farthest the camera may get
const ZOOM_MIN = 1 / 1.5; // 150% zoom in from current = closest allowed distance
const ZOOM_SENSITIVITY = 0.0008;

const FIXED_ROTATION = new Euler().setFromRotationMatrix(
	new Matrix4().lookAt(OFFSET, new Vector3(0, 0, 0), new Vector3(0, 1, 0)),
);

export class FollowCameraSystem {
	private readonly desiredPosition = new Vector3();
	private zoomFactor = ZOOM_MAX;

	initialize(camera: Camera): void {
		if (camera instanceof PerspectiveCamera) {
			camera.fov = FOV;
			camera.updateProjectionMatrix();
		}
		camera.rotation.copy(FIXED_ROTATION);
	}

	zoom(delta: number): void {
		const next = this.zoomFactor + delta * ZOOM_SENSITIVITY;
		this.zoomFactor = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
	}

	update(delta: number, camera: Camera, target: Vector3): void {
		this.desiredPosition.copy(target).addScaledVector(OFFSET, this.zoomFactor);

		// Exponential smoothing: no velocity state, no allocations, and it
		// naturally produces acceleration/deceleration as the camera eases
		// toward the player each frame.
		const smoothing = 1 - Math.exp(-FOLLOW_SPEED * delta);
		camera.position.lerp(this.desiredPosition, smoothing);
	}
}
