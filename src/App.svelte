<script lang="ts">
	import { Canvas } from '@threlte/core';
	import type { Group } from 'three';
	import { CollisionSystem } from './engine/CollisionSystem';
	import MainMenu from './ui/MainMenu.svelte';
	import BuildMenu from './ui/BuildMenu.svelte';
	import Colonists from './ui/Colonists.svelte';
	import EconomyLayer from './ui/EconomyLayer.svelte';
	import Environment from './ui/Environment.svelte';
	import FollowCamera from './ui/FollowCamera.svelte';
	import Interaction from './ui/Interaction.svelte';
	import Nodes from './ui/Nodes.svelte';
	import Placement from './ui/Placement.svelte';
	import Player from './ui/Player.svelte';
	import Refineries from './ui/Refineries.svelte';
	import ResourceHud from './ui/ResourceHud.svelte';
	import { gameState } from './state/ui.svelte';

	let player = $state<Group | undefined>(undefined);
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
			<Placement {collision} {player} />
			<Nodes />
			<Refineries />
			<Colonists />
			<EconomyLayer />
		</Canvas>
		<BuildMenu />
		<ResourceHud />
		<Interaction {player} />
	{:else}
		<MainMenu />
	{/if}
</main>
