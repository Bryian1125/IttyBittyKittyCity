<script lang="ts">
	import { Canvas } from '@threlte/core';
	import type { Mesh } from 'three';
	import Environment from './ui/Environment.svelte';
	import FollowCamera from './ui/FollowCamera.svelte';
	import Player from './ui/Player.svelte';

	let player = $state<Mesh | undefined>(undefined);
</script>

<main>
	<Canvas>
		<Environment />
		<Player bind:object={player} />
		{#if player !== undefined}
			<FollowCamera target={player} />
		{/if}
	</Canvas>
</main>
