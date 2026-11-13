<!--
	@component
	Colonists: one capsule-and-sphere figure per colonist, walking around its
	housing. The component also drives the population tick — arrival, food
	upkeep, and motion — from the frame loop.
-->
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { colonistViews, tickPopulation } from '../state/npcs.svelte';

	useTask((delta) => tickPopulation(delta));
</script>

{#each colonistViews() as colonist (colonist.id)}
	<T.Group position={[colonist.x, 0, colonist.z]}>
		<T.Mesh position={[0, 0.35, 0]}>
			<T.CapsuleGeometry args={[0.18, 0.3]} />
			<T.MeshStandardMaterial color="#c9d4e4" />
		</T.Mesh>

		<T.Mesh position={[0, 0.72, 0]}>
			<T.SphereGeometry args={[0.15]} />
			<T.MeshStandardMaterial color="#eef2f8" />
		</T.Mesh>
	</T.Group>
{/each}
