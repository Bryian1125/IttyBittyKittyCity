<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Mesh } from 'three';
	import { camera } from '../state/camera.svelte';
	import { CollisionSystem } from '../engine/CollisionSystem';
	import { PlayerController } from '../engine/PlayerController';
	import { readMovement } from '../lib/input';

	let { object = $bindable() }: { object?: Mesh } = $props();

	const collision = new CollisionSystem();
	let controller: PlayerController | undefined;

	useTask((delta) => {
		if (object === undefined) return;
		controller ??= new PlayerController(object, collision);
		controller.update(delta, readMovement(), camera.yaw);
	});
</script>

<T.Mesh bind:ref={object} position={[0, 0.5, 0]}>
	<T.BoxGeometry args={[1, 1, 1]} />
	<T.MeshStandardMaterial color="white" />
</T.Mesh>
