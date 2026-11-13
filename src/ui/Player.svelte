<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Mesh } from 'three';
	import type { CollisionSystem } from '../engine/CollisionSystem';
	import { PlayerController } from '../engine/PlayerController';
	import { readMovement } from '../lib/input';

	let { object = $bindable(), collision }: { object?: Mesh; collision: CollisionSystem } =
		$props();

	let controller: PlayerController | undefined;

	useTask((delta) => {
		if (object === undefined) return;
		controller ??= new PlayerController(object, collision);
		controller.update(delta, readMovement());
	});
</script>

<T.Mesh bind:ref={object} position={[0, 0.5, 0]}>
	<T.BoxGeometry args={[1, 1, 1]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh>
