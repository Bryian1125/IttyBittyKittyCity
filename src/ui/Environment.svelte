<script lang="ts">
	import { T } from '@threlte/core';
	import { floor, sites, type MapSiteType } from '../lib/layout';
	import GltfProp from './GltfProp.svelte';

	const SITE_COLORS: Record<MapSiteType, string> = {
		minerals: '#8a6d3f',
		h3: '#4f9cae',
		nuclear: '#5f9c58',
	};
</script>

<T.Mesh position={floor.position}>
	<T.BoxGeometry args={floor.size} />
	<T.MeshStandardMaterial color={floor.color} />
</T.Mesh>

{#each sites as site (site.id)}
	<!-- The coloured plate marks the collection point; the deposit sits on top. -->
	<T.Mesh position={site.position}>
		<T.BoxGeometry args={site.size} />
		<T.MeshStandardMaterial color={SITE_COLORS[site.type]} />
	</T.Mesh>

	{#if site.deposit !== undefined}
		<GltfProp
			url={site.deposit}
			position={[
				site.position[0],
				site.position[1] + site.size[1] / 2,
				site.position[2],
			]}
			footprint={Math.max(site.size[0], site.size[2]) * 0.95}
			yaw={site.depositYaw ?? 0}
		/>
	{/if}
{/each}

<T.AmbientLight intensity={1.5} />
<T.DirectionalLight position={[12, 24, 8]} intensity={2} />
