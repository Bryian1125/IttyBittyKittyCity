import { Matrix4, PerspectiveCamera, Quaternion, Vector3, type Camera } from 'three';

const OFFSET = new Vector3(0, 20, 16);
const UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3();
const FOLLOW_SPEED = 3.5;
const ROTATION_SPEED = 3.5;
const FOV = 35;

const ZOOM_MAX = 1; // current distance is the farthest the camera may get
const ZOOM_MIN = 1 / 1.5; // 150% zoom in from current = closest allowed distance
const ZOOM_SENSITIVITY = 0.0008;

export class FollowCameraSystem {
	private readonly offsetDirection = new Vector3();
	private readonly desiredOffset = new Vector3();
	private readonly desiredPosition = new Vector3();
	private readonly lookMatrix = new Matrix4();
	private readonly targetRotation = new Quaternion();
	private zoomFactor = ZOOM_MAX;
	private appliedYaw: number | null = null;

	initialize(camera: Camera): void {
		if (camera instanceof PerspectiveCamera) {
			camera.fov = FOV;
			camera.updateProjectionMatrix();
		}
	}

	zoom(delta: number): void {
		const next = this.zoomFactor + delta * ZOOM_SENSITIVITY;
		this.zoomFactor = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
	}

	update(delta: number, camera: Camera, target: Vector3, yaw: number): void {
		// Orientation only ever changes when the yaw steps, never from
		// movement or position lag.
		if (this.appliedYaw !== yaw) {
			this.offsetDirection.copy(OFFSET).applyAxisAngle(UP, yaw);
			this.lookMatrix.lookAt(this.offsetDirection, ORIGIN, UP);
			this.targetRotation.setFromRotationMatrix(this.lookMatrix);
			this.appliedYaw = yaw;
		}

		// Orientation snapping never re-runs unless yaw changed, so during
		// normal movement the quaternion stays exactly put.
		const rotationSmoothing = 1 - Math.exp(-ROTATION_SPEED * delta);
		camera.quaternion.slerp(this.targetRotation, rotationSmoothing);

		this.desiredOffset.copy(this.offsetDirection).multiplyScalar(this.zoomFactor);
		this.desiredPosition.copy(target).add(this.desiredOffset);

		// Exponential smoothing: no velocity state, no allocations, and it
		// naturally produces acceleration/deceleration as the camera eases
		// toward the player each frame.
		const smoothing = 1 - Math.exp(-FOLLOW_SPEED * delta);
		camera.position.lerp(this.desiredPosition, smoothing);
	}
}
