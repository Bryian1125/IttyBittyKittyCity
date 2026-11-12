import { Euler, PerspectiveCamera, Vector3, type Camera } from 'three';

const OFFSET = new Vector3(0, 20, 16);
const HALF_PI = Math.PI / 2;
const UP = new Vector3(0, 1, 0);
const FOLLOW_SPEED = 3.5;
const FOV = 35;

const ZOOM_MAX = 1; // current distance is the farthest the camera may get
const ZOOM_MIN = 1 / 1.5; // 150% zoom in from current = closest allowed distance
const ZOOM_SENSITIVITY = 0.0008;

export class FollowCameraSystem {
	private readonly desiredPosition = new Vector3();
	private readonly rotatedOffset = new Vector3();
	private yaw = 0;
	private zoomFactor = ZOOM_MAX;

	initialize(camera: Camera): void {
		if (camera instanceof PerspectiveCamera) {
			camera.fov = FOV;
			camera.updateProjectionMatrix();
		}
	}

	// Snaps the orbit direction in 90 degree steps; positive orbits right.
	rotate(steps: number): void {
		this.yaw += steps * HALF_PI;
	}

	zoom(delta: number): void {
		const next = this.zoomFactor + delta * ZOOM_SENSITIVITY;
		this.zoomFactor = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
	}

	update(delta: number, camera: Camera, target: Vector3): void {
		this.rotatedOffset.copy(OFFSET).applyAxisAngle(UP, this.yaw).multiplyScalar(this.zoomFactor);
		this.desiredPosition.copy(target).add(this.rotatedOffset);

		// Exponential smoothing: no velocity state, no allocations, and it
		// naturally produces acceleration/deceleration as the camera eases
		// toward the player each frame.
		const smoothing = 1 - Math.exp(-FOLLOW_SPEED * delta);
		camera.position.lerp(this.desiredPosition, smoothing);
		camera.lookAt(target);
	}
}
