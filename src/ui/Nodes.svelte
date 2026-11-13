<!--
	@component
	The nine hand-gathering nodes: a gray rock, a teal crystal, or a green pod
	per spec, resting on the floor. A node on cooldown renders depleted —
	shrunk and dimmed — and comes back the moment its cooldown runs out. The
	per-frame task drives the cooldowns.
-->
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { NODE_SPECS } from '../lib/nodes';
	import { nodeViews, tickNodes } from '../state/nodes.svelte';

	useTask((delta) => {
		tickNodes(delta);
	});

	/** Ids of the nodes currently on cooldown, so their meshes look depleted. */
	const depleted = $derived(
		new Set(
			nodeViews()
				.filter((view) => !view.available)
				.map((view) => view.id),
		),
	);
</script>

{#each NODE_SPECS as spec, index (spec.id)}
	{@const dimmed = depleted.has(spec.id)}
	<T.Group
		position={[spec.position.x, 0, spec.position.z]}
		rotation={[0, index * 1.1, 0]}
		scale={dimmed ? 0.4 : 1}
	>
		{#if spec.kind === 'mineral'}
			<T.Mesh position={[0, 0.4, 0]}>
				<T.IcosahedronGeometry args={[0.55, 0]} />
				<T.MeshStandardMaterial
					color={dimmed ? '#5c6067' : '#8a8f98'}
					flatShading
					roughness={0.9}
				/>
			</T.Mesh>
		{:else if spec.kind === 'h3'}
			<T.Mesh position={[0, 0.55, 0]}>
				<T.CylinderGeometry args={[0.28, 0.4, 1.1, 6]} />
				<T.MeshStandardMaterial
					color={dimmed ? '#2f6a66' : '#57d1c9'}
					emissive="#57d1c9"
					emissiveIntensity={dimmed ? 0.05 : 0.5}
				/>
			</T.Mesh>
		{:else}
			<T.Mesh position={[0, 0.32, 0]} scale={[1, 0.6, 1]}>
				<T.SphereGeometry args={[0.52, 12, 8]} />
				<T.MeshStandardMaterial
					color={dimmed ? '#4a7d36' : '#7ed957'}
					roughness={0.8}
				/>
			</T.Mesh>
		{/if}
	</T.Group>
{/each}
