<script lang="ts">
	import { Canvas } from '@threlte/core';
	import type { Mesh } from 'three';
	import { CollisionSystem } from './engine/CollisionSystem';
	import MainMenu from './ui/MainMenu.svelte';
	import BuildingToolbar from './ui/BuildingToolbar.svelte';
	import Environment from './ui/Environment.svelte';
	import FollowCamera from './ui/FollowCamera.svelte';
	import Placement from './ui/Placement.svelte';
	import Player from './ui/Player.svelte';
	import { gameState } from './state/ui.svelte';

	let player = $state<Mesh | undefined>(undefined);
	const collision = new CollisionSystem();
</script>

<main>
	{#if gameState.started}
		<Canvas>
			<Environment />
			<Player bind:object={player} {collision} />
			{#if player !== undefined}
				<FollowCamera target={player} />
			{/if}
			<Placement {collision} />
		</Canvas>
		<BuildingToolbar />
	{:else}
		<MainMenu />
	{/if}
</main>
