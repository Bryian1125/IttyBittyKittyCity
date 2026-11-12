<script lang="ts">
	import { T } from '@threlte/core';
	import { floor, obstacles } from '../lib/layout';
</script>

<T.Mesh position={floor.position}>
	<T.BoxGeometry args={floor.size} />
	<T.MeshStandardMaterial color={floor.color} />
</T.Mesh>

{#each obstacles as obstacle (obstacle.id)}
	<T.Mesh position={obstacle.position}>
		<T.BoxGeometry args={obstacle.size} />
		<T.MeshStandardMaterial color={obstacle.color} />
	</T.Mesh>
{/each}

<T.AmbientLight intensity={1.5} />
<T.DirectionalLight position={[12, 24, 8]} intensity={2} />
