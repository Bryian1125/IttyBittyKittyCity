import { PerspectiveCamera, Vector3, type Camera } from 'three';

export type CameraYawState = {
	yawTarget: number;
	yaw: number;
};

const OFFSET_HEIGHT = 20;
const OFFSET_HORIZONTAL = 16;
const FOLLOW_SPEED = 3.5;
const FOV = 35;
const QUARTER_TURN = Math.PI / 2;
const TURN_SECONDS = 0.35;

const ZOOM_MAX = 1; // current distance is the farthest the camera may get
const ZOOM_MIN = 1 / 1.5; // 150% zoom in from current = closest allowed distance
const ZOOM_SENSITIVITY = 0.0008;

export class FollowCameraSystem {
	/** Invisible part the rig follows: always eases toward the player. */
	private readonly focus = new Vector3();
	private readonly desiredPosition = new Vector3();
	private zoomFactor = ZOOM_MAX;
	private seeded = false;

	private turnStart = 0;
	private turnTarget: number;
	private turnElapsed = 0;
	private turnDuration = 0;

	constructor(private readonly yaw: CameraYawState) {
		this.turnTarget = yaw.yawTarget;
	}

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
		// The focus is the only thing that eases, so following stays smooth
		// while the camera stays rigidly attached to it.
		if (!this.seeded) {
			this.focus.copy(target);
			this.seeded = true;
		} else {
			this.focus.lerp(target, 1 - Math.exp(-FOLLOW_SPEED * delta));
		}

		this.updateTurn(delta);

		// The seat comes straight from the tweened yaw's sin/cos, and the aim
		// is refreshed from the actual position every frame, so the player
		// stays centred through the whole turn.
		const radius = OFFSET_HORIZONTAL * this.zoomFactor;
		this.desiredPosition.set(
			this.focus.x + Math.sin(this.yaw.yaw) * radius,
			this.focus.y + OFFSET_HEIGHT * this.zoomFactor,
			this.focus.z + Math.cos(this.yaw.yaw) * radius,
		);

		camera.position.copy(this.desiredPosition);
		camera.lookAt(this.focus);
	}

	private updateTurn(delta: number): void {
		if (this.yaw.yawTarget !== this.turnTarget) {
			this.turnStart = this.yaw.yaw;
			this.turnTarget = this.yaw.yawTarget;
			this.turnElapsed = 0;
			this.turnDuration =
				(TURN_SECONDS * Math.abs(this.turnTarget - this.turnStart)) /
				QUARTER_TURN;
		}

		if (this.turnElapsed < this.turnDuration) {
			this.turnElapsed = Math.min(this.turnDuration, this.turnElapsed + delta);
			const progress = this.turnElapsed / this.turnDuration;
			const eased = progress * progress * (3 - 2 * progress); // smoothstep
			this.yaw.yaw =
				this.turnStart + (this.turnTarget - this.turnStart) * eased;
		} else if (this.yaw.yaw !== this.turnTarget) {
			this.yaw.yaw = this.turnTarget;
		}
	}
}
