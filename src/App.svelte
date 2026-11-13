<script lang="ts">
	import { Canvas } from '@threlte/core';
	import type { Mesh } from 'three';
	import MainMenu from './ui/MainMenu.svelte';
	import Environment from './ui/Environment.svelte';
	import FollowCamera from './ui/FollowCamera.svelte';
	import Player from './ui/Player.svelte';
	import { gameState } from './state/ui.svelte';

	let player = $state<Mesh | undefined>(undefined);
</script>

<main>
	{#if gameState.started}
		<Canvas>
			<Environment />
			<Player bind:object={player} />
			{#if player !== undefined}
				<FollowCamera target={player} />
			{/if}
		</Canvas>
	{:else}
		<MainMenu />
	{/if}
</main>
