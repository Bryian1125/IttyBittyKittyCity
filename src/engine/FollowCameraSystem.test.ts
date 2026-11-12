import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { FollowCameraSystem } from './FollowCameraSystem';

const OFFSET_LENGTH = new Vector3(0, 20, 16).length();
const ZOOM_MIN_FACTOR = 1 / 1.5;
const SETTLE_SECONDS = 1e6;

describe('FollowCameraSystem', () => {
	it('sets the field of view on initialize', () => {
		const camera = new PerspectiveCamera();

		new FollowCameraSystem().initialize(camera);

		expect(camera.fov).toBe(35);
	});

	it('eases the camera toward the target instead of snapping', () => {
		const camera = new PerspectiveCamera();
		const system = new FollowCameraSystem();
		system.initialize(camera);
		camera.position.set(0, 0, 0);

		system.update(1 / 60, camera, new Vector3(0, 0, 0));

		const distance = camera.position.length();
		expect(distance).toBeGreaterThan(0);
		expect(distance).toBeLessThan(OFFSET_LENGTH);
	});

	it('clamps zoom between 1/1.5 and 1 of the base offset', () => {
		const camera = new PerspectiveCamera();
		const system = new FollowCameraSystem();
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
