import { describe, expect, it } from 'vitest';
import { Object3D } from 'three';
import { CollisionSystem } from './CollisionSystem';
import { PlayerController } from './PlayerController';
import type { BoxSpec } from '../lib/layout';

const noInput = {
	forward: false,
	backward: false,
	left: false,
	right: false,
} as const;

function box(
	position: [number, number, number],
	size: [number, number, number],
): BoxSpec {
	return { id: 'test-box', position, size, color: '#000000' };
}

describe('PlayerController', () => {
	it('moves forward along -z by speed * delta', () => {
		const target = new Object3D();
		const controller = new PlayerController(target, new CollisionSystem([]), 5);

		controller.update(0.1, { ...noInput, forward: true });

		expect(target.position.z).toBeCloseTo(-0.5);
		expect(target.position.x).toBe(0);
	});

	it('normalizes diagonal movement so it is not faster than straight', () => {
		const target = new Object3D();
		const controller = new PlayerController(target, new CollisionSystem([]), 5);

		controller.update(0.1, { ...noInput, forward: true, right: true });

		expect(Math.hypot(target.position.x, target.position.z)).toBeCloseTo(0.5);
	});

	it('does nothing without input', () => {
		const target = new Object3D();
		const controller = new PlayerController(target, new CollisionSystem([]), 5);

		controller.update(0.1, noInput);

		expect(target.position.x).toBe(0);
		expect(target.position.z).toBe(0);
	});

	it('reverts a step that would enter an obstacle', () => {
		const target = new Object3D();
		target.position.set(0.9, 0, 0);
		// Wall spans x 1.5..2.5; a 0.5 step to the right would overlap it.
		const controller = new PlayerController(
			target,
			new CollisionSystem([box([2, 0.5, 0], [1, 1, 1])]),
			5,
		);

		controller.update(0.1, { ...noInput, right: true });

		expect(target.position.x).toBeCloseTo(0.9);
	});
});
