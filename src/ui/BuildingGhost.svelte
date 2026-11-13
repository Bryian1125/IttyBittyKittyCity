<!--
	@component
	The placement ghost for any building: translucent green while the anchor is
	free, red while it is blocked. It always delegates to `BuildingModel`, so a
	def with a `model` previews that model and a def without one previews the
	same placeholder box — the ghost can never drift from what gets built.
-->
<script lang="ts">
	import type { BuildingDef } from '../lib/balance';
	import type { Cell } from '../lib/placement';
	import BuildingModel from './BuildingModel.svelte';

	let {
		def,
		anchor,
		blocked = false,
	}: { def: BuildingDef; anchor: Cell; blocked?: boolean } = $props();

	const GHOST_OPACITY = 0.55;
	const VALID_COLOR = '#2ecc71';
	const BLOCKED_COLOR = '#e74c3c';

	const color = $derived(blocked ? BLOCKED_COLOR : VALID_COLOR);
</script>

<!-- Keyed on the def so switching the picker reloads the right model. -->
{#key def.id}
	<BuildingModel {def} {anchor} tint={color} opacity={GHOST_OPACITY} />
{/key}
