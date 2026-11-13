import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { CollisionSystem } from './CollisionSystem';
import type { BoxSpec } from '../lib/layout';

function box(
	position: [number, number, number],
	size: [number, number, number],
): BoxSpec {
	return { id: 'test-box', position, size, color: '#000000' };
}

describe('CollisionSystem', () => {
	it('reports no collision when the player is clear of every box', () => {
		const system = new CollisionSystem([box([5, 0.5, 0], [1, 1, 1])]);

		expect(system.intersects(new Vector3(0, 0.5, 0))).toBe(false);
	});

	it('reports a collision when the player overlaps a box', () => {
		const system = new CollisionSystem([box([0, 0.5, 0], [2, 2, 2])]);

		expect(system.intersects(new Vector3(0, 0.5, 0))).toBe(true);
	});

	it('treats touching faces as a collision', () => {
		// Box spans x 1.5..2.5 and the player half-size is 0.5, so a player
		// centred at x = 0.99 stays clear and x = 1.0 touches the face.
		const system = new CollisionSystem([box([2, 0.5, 0], [1, 1, 1])]);

		expect(system.intersects(new Vector3(0.99, 0.5, 0))).toBe(false);
		expect(system.intersects(new Vector3(1, 0.5, 0))).toBe(true);
	});

	it('collides with boxes added at runtime', () => {
		const system = new CollisionSystem([]);

		system.addBox({ position: [0, 0.5, 0], size: [2, 2, 2] });

		expect(system.intersects(new Vector3(0, 0.5, 0))).toBe(true);
	});
});
