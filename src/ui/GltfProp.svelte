<!--
	@component
	A static glTF prop placed on the map (a deposit, a marker, scenery). The
	loader caches one scene per URL, so every instance clones it; the clone is
	scaled to `footprint` across its widest horizontal axis, centred on x/z and
	rests its base on `position`'s y. `url`, `footprint` and `yaw` are read once
	at mount — pass values that do not change.
-->
<script lang="ts">
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { untrack } from 'svelte';
	import type { Object3D } from 'three';
	import { fitModelToFootprint } from '../engine/modelFit';

	let {
		url,
		position,
		footprint,
		yaw = 0,
	}: {
		url: string;
		/** Ground point for the prop's base and horizontal centre. */
		position: [number, number, number];
		/** World units the prop's longer horizontal side should span. */
		footprint: number;
		/** Turn about Y, in radians, to vary otherwise identical props. */
		yaw?: number;
	} = $props();

	const loader = untrack(() => useGltf(url));
	let object = $state.raw<Object3D>();

	$effect(() => {
		let cancelled = false;
		void loader.promise
			.then((gltf) => {
				if (!cancelled) object = fitModelToFootprint(gltf.scene, footprint, yaw);
			})
			.catch(() => {
				// The loader already reports the failure; leave the prop hidden.
			});

		return () => {
			cancelled = true;
		};
	});
</script>

{#if object !== undefined}
	<T.Group {position}>
		<!-- Cloned meshes share the cached geometries/materials, so never dispose them. -->
		<T is={object} dispose={false} />
	</T.Group>
{/if}
