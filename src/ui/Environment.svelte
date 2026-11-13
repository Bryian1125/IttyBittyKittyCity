<script lang="ts">
	import { T } from '@threlte/core';
	import { floor, sites, type MapSiteType } from '../lib/layout';

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
	<!-- TODO: placeholder mound — replace with proper deposit models (issue #13) -->
	<T.Mesh position={site.position}>
		<T.BoxGeometry args={site.size} />
		<T.MeshStandardMaterial color={SITE_COLORS[site.type]} />
	</T.Mesh>
{/each}

<T.AmbientLight intensity={1.5} />
<T.DirectionalLight position={[12, 24, 8]} intensity={2} />
