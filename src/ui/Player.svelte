<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Object3D } from 'three';
	import { PlayerController } from '../engine/PlayerController';
	import { readMovement } from '../lib/input';

	let { object = $bindable(undefined) } = $props<{ object?: Object3D }>();

	let controller: PlayerController | undefined;

	useTask((delta) => {
		if (object === undefined) return;
		controller ??= new PlayerController(object);
		controller.update(delta, readMovement());
	});
</script>

<T.Mesh bind:ref={object} position={[0, 0.5, 0]}>
	<T.BoxGeometry args={[1, 1, 1]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh>
