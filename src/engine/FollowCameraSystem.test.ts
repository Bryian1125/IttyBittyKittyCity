import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { FollowCameraSystem, type CameraYawState } from './FollowCameraSystem';

const OFFSET = new Vector3(0, 20, 16);
const OFFSET_LENGTH = OFFSET.length();
const ZOOM_MIN_FACTOR = 1 / 1.5;
const SETTLE_SECONDS = 1e6;

function makeSystem(): { yaw: CameraYawState; system: FollowCameraSystem } {
	const yaw: CameraYawState = { yawTarget: 0, yaw: 0 };
	return { yaw, system: new FollowCameraSystem(yaw) };
}

function viewDirection(camera: PerspectiveCamera): Vector3 {
	return new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
}

function aimError(camera: PerspectiveCamera, focus: Vector3): number {
	return viewDirection(camera).dot(
		focus.clone().sub(camera.position).normalize(),
	);
}

describe('FollowCameraSystem', () => {
	it('sets the field of view on initialize', () => {
		const camera = new PerspectiveCamera();

		makeSystem().system.initialize(camera);

		expect(camera.fov).toBe(35);
	});

	it('seats the camera at the orbit seat and aims it at the focus', () => {
		const camera = new PerspectiveCamera();
		const { system } = makeSystem();
		system.initialize(camera);

		system.update(1 / 60, camera, new Vector3(0, 0, 0));

		expect(camera.position.length()).toBeCloseTo(OFFSET_LENGTH);
		expect(aimError(camera, new Vector3(0, 0, 0))).toBeCloseTo(1);
	});

	it('eases the focus toward the moving player instead of snapping', () => {
		const camera = new PerspectiveCamera();
		const { system } = makeSystem();
		system.initialize(camera);
		system.update(1 / 60, camera, new Vector3(0, 0, 0));

		system.update(1 / 60, camera, new Vector3(10, 0, 0));

		expect(camera.position.x).toBeGreaterThan(0);
		expect(camera.position.x).toBeLessThan(10);
	});

	it('tweens to the neighbouring seat, staying centred, and lands exactly', () => {
		const camera = new PerspectiveCamera();
		const { yaw, system } = makeSystem();
		system.initialize(camera);
		system.update(SETTLE_SECONDS, camera, new Vector3(0, 0, 0));

		yaw.yawTarget += Math.PI / 2;
		system.update(1 / 60, camera, new Vector3(0, 0, 0));

		// Mid-tween: rotated partway to the next seat and still aimed at the focus.
		expect(camera.position.x).toBeGreaterThan(0);
		expect(camera.position.x).toBeLessThan(16);
		expect(aimError(camera, new Vector3(0, 0, 0))).toBeCloseTo(1);

		// Settles exactly on the next seat.
		system.update(SETTLE_SECONDS, camera, new Vector3(0, 0, 0));
		expect(camera.position.x).toBeCloseTo(16);
		expect(camera.position.y).toBeCloseTo(20);
		expect(camera.position.z).toBeCloseTo(0);
		expect(aimError(camera, new Vector3(0, 0, 0))).toBeCloseTo(1);
	});

	it('clamps zoom between 1/1.5 and 1 of the base offset', () => {
		const camera = new PerspectiveCamera();
		const { system } = makeSystem();
		system.initialize(camera);

		system.zoom(-1e9);
		system.update(SETTLE_SECONDS, camera, new Vector3(0, 0, 0));
		expect(camera.position.length()).toBeCloseTo(
			OFFSET_LENGTH * ZOOM_MIN_FACTOR,
		);

		system.zoom(1e9);
		system.update(SETTLE_SECONDS, camera, new Vector3(0, 0, 0));
		expect(camera.position.length()).toBeCloseTo(OFFSET_LENGTH);
	});
});
