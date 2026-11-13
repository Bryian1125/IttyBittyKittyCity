<!--
	@component
	The kitty player: a simple cat built from primitives so its skin colour can
	be swapped (issue #4). Movement and collision are unchanged — the
	controller moves the group and the collision system keeps its 1×1×1
	footprint around the group's position.
-->
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Group } from 'three';
	import type { CollisionSystem } from '../engine/CollisionSystem';
	import { PlayerController } from '../engine/PlayerController';
	import { readMovement } from '../lib/input';
	import { skinColor } from '../lib/skins';
	import { camera } from '../state/camera.svelte';
	import { getSkin } from '../state/skins.svelte';

	let { object = $bindable(), collision }: { object?: Group; collision: CollisionSystem } =
		$props();

	const skin = $derived(skinColor(getSkin()));
	let controller: PlayerController | undefined;

	useTask((delta) => {
		if (object === undefined) return;
		controller ??= new PlayerController(object, collision);
		controller.update(delta, readMovement(), camera.yaw);
	});
</script>

<T.Group bind:ref={object} position={[0, 0, 0]}>
	<!-- Body -->
	<T.Mesh position={[0, 0.35, -0.05]}>
		<T.BoxGeometry args={[0.8, 0.6, 1.05]} />
		<T.MeshStandardMaterial color={skin} />
	</T.Mesh>

	<!-- Head -->
	<T.Mesh position={[0, 0.78, 0.5]}>
		<T.BoxGeometry args={[0.58, 0.5, 0.55]} />
		<T.MeshStandardMaterial color={skin} />
	</T.Mesh>

	<!-- Ears -->
	<T.Mesh position={[0.16, 1.1, 0.5]}>
		<T.ConeGeometry args={[0.13, 0.24, 4]} />
		<T.MeshStandardMaterial color={skin} />
	</T.Mesh>
	<T.Mesh position={[-0.16, 1.1, 0.5]}>
		<T.ConeGeometry args={[0.13, 0.24, 4]} />
		<T.MeshStandardMaterial color={skin} />
	</T.Mesh>

	<!-- Eyes -->
	<T.Mesh position={[0.13, 0.82, 0.79]}>
		<T.BoxGeometry args={[0.1, 0.1, 0.04]} />
		<T.MeshStandardMaterial color="#20242c" />
	</T.Mesh>
	<T.Mesh position={[-0.13, 0.82, 0.79]}>
		<T.BoxGeometry args={[0.1, 0.1, 0.04]} />
		<T.MeshStandardMaterial color="#20242c" />
	</T.Mesh>

	<!-- Tail -->
	<T.Mesh position={[0, 0.5, -0.62]} rotation={[-1.1, 0, 0]}>
		<T.CapsuleGeometry args={[0.07, 0.5, 4, 8]} />
		<T.MeshStandardMaterial color={skin} />
	</T.Mesh>
</T.Group>
