import { describe, expect, it } from 'vitest';
import { Box3, BoxGeometry, Mesh, Vector3 } from 'three';
import { fitModelToFootprint } from './modelFit';

/** A 2 x 4 x 1 box, deliberately not centred on the origin's y. */
function slab(): Mesh {
	const mesh = new Mesh(new BoxGeometry(2, 4, 1));
	mesh.position.set(0, 2, 0);
	return mesh;
}

function bounds(object: Mesh | ReturnType<typeof fitModelToFootprint>) {
	return new Box3().setFromObject(object);
}

describe('fitModelToFootprint', () => {
	it('scales the widest horizontal side to the footprint', () => {
		const fitted = fitModelToFootprint(slab(), 6);
		const size = bounds(fitted).getSize(new Vector3());

		expect(size.x).toBeCloseTo(6);
		expect(size.z).toBeCloseTo(3);
		expect(size.y).toBeCloseTo(12);
	});

	it('rests the base at y = 0 and centres the prop on x and z', () => {
		const fitted = fitModelToFootprint(slab(), 6);
		const box = bounds(fitted);
		const centre = box.getCenter(new Vector3());

		expect(box.min.y).toBeCloseTo(0);
		expect(centre.x).toBeCloseTo(0);
		expect(centre.z).toBeCloseTo(0);
	});

	it('holds the fit after a quarter turn swaps the horizontal axes', () => {
		const fitted = fitModelToFootprint(slab(), 6, Math.PI / 2);
		const box = bounds(fitted);
		const size = box.getSize(new Vector3());
		const centre = box.getCenter(new Vector3());

		expect(Math.max(size.x, size.z)).toBeCloseTo(6);
		expect(size.x).toBeCloseTo(3);
		expect(size.z).toBeCloseTo(6);
		expect(box.min.y).toBeCloseTo(0);
		expect(centre.x).toBeCloseTo(0);
		expect(centre.z).toBeCloseTo(0);
	});

	it('leaves a zero-size scene alone instead of dividing by zero', () => {
		const fitted = fitModelToFootprint(new Mesh(), 4);
		expect(fitted.scale.x).toBe(1);
	});
});
