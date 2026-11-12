import { Vector3, type Camera } from 'three';

const OFFSET = new Vector3(0, 8, 12);
const FOLLOW_SPEED = 4;

export class FollowCameraSystem {
	private readonly desiredPosition = new Vector3();

	update(delta: number, camera: Camera, target: Vector3): void {
		this.desiredPosition.copy(target).add(OFFSET);

		const smoothing = 1 - Math.exp(-FOLLOW_SPEED * delta);
		camera.position.lerp(this.desiredPosition, smoothing);
		camera.lookAt(target);
	}
}
