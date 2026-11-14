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
	import Placement from './ui/Placement.svelte';
	import Player from './ui/Player.svelte';
	import Refineries from './ui/Refineries.svelte';
	import ResourceHud from './ui/ResourceHud.svelte';
	import ResourcesPage from './ui/ResourcesPage.svelte';
	import SettingsPage from './ui/SettingsPage.svelte';
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
			<Refineries />
			<Colonists />
			<EconomyLayer />
		</Canvas>
		<BuildMenu />
		<ResourceHud />
	{:else}
		<MainMenu />
	{/if}

	{#if gameState.page === 'resources'}
		<ResourcesPage />
	{:else if gameState.page === 'settings'}
		<SettingsPage />
	{/if}
</main>
