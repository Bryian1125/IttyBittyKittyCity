import { Matrix4, PerspectiveCamera, Quaternion, Vector3, type Camera } from 'three';

const OFFSET = new Vector3(0, 20, 16);
const UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3();
const FOLLOW_SPEED = 3.5;
const FOV = 35;

const ZOOM_MAX = 1; // current distance is the farthest the camera may get
const ZOOM_MIN = 1 / 1.5; // 150% zoom in from current = closest allowed distance
const ZOOM_SENSITIVITY = 0.0008;

export interface CameraYawState {
	yawTarget: number;
	yaw: number;
}

export class FollowCameraSystem {
	private readonly offsetDirection = new Vector3();
	private readonly desiredOffset = new Vector3();
	private readonly desiredPosition = new Vector3();
	private readonly lookMatrix = new Matrix4();
	private readonly orientation = new Quaternion();
	private zoomFactor = ZOOM_MAX;

	constructor(private readonly yaw: CameraYawState) {}

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

	update(delta: number, camera: Camera, target: Vector3): void {
		// One continuously-eased yaw drives both tracks, so the turn is a
		// single smooth glide with no window, freeze, or jump.
		const smoothing = 1 - Math.exp(-FOLLOW_SPEED * delta);
		this.yaw.yaw += (this.yaw.yawTarget - this.yaw.yaw) * smoothing;

		// Orientation is derived from the current yaw every frame: at rest it
		// is constant, so plain movement can never angle the view.
		this.offsetDirection.copy(OFFSET).applyAxisAngle(UP, this.yaw.yaw);
		this.lookMatrix.lookAt(this.offsetDirection, ORIGIN, UP);
		this.orientation.setFromRotationMatrix(this.lookMatrix);
		camera.quaternion.copy(this.orientation);

		this.desiredOffset.copy(this.offsetDirection).multiplyScalar(this.zoomFactor);
		this.desiredPosition.copy(target).add(this.desiredOffset);
		camera.position.lerp(this.desiredPosition, smoothing);
	}
}
