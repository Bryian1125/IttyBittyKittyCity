import { Box3, Vector3, type Object3D } from 'three';

/**
 * Clones `scene` for one placement and fits it to the ground: uniform scale so
 * the clone's widest horizontal extent equals `footprint`, centred on x and z,
 * with its base resting at y = 0. The clone shares the source's geometries and
 * materials, so never dispose them.
 */
export function fitModelToFootprint(
	scene: Object3D,
	footprint: number,
	yaw = 0,
): Object3D {
	const clone = scene.clone(true);

	// Fit the prop's own geometry: drop any transform the source root carries,
	// then measure once the yaw is applied, so the fit covers what is seen.
	clone.position.set(0, 0, 0);
	clone.rotation.set(0, yaw, 0);
	clone.scale.setScalar(1);

	const box = new Box3().setFromObject(clone);
	if (box.isEmpty()) return clone;

	const size = box.getSize(new Vector3());
	const centre = box.getCenter(new Vector3());
	const widest = Math.max(size.x, size.z);
	const scale = widest > 0 ? footprint / widest : 1;

	clone.scale.setScalar(scale);
	clone.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
	return clone;
}
