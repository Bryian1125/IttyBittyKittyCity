<script lang="ts">
	import { Canvas } from '@threlte/core';
	import type { Object3D } from 'three';
	import Environment from './ui/Environment.svelte';
	import FollowCamera from './ui/FollowCamera.svelte';
	import Player from './ui/Player.svelte';

	let player = $state<Object3D | undefined>(undefined);
</script>

<main>
	<Canvas style="width: 100%; height: 100%">
		<Environment />
		<Player bind:object={player} />
		{#if player !== undefined}
			<FollowCamera target={player} />
		{/if}
	</Canvas>
</main>
