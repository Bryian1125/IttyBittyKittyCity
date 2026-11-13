<!--
	@component
	Readability layer for refineries: a floating bar above each one shows the
	input buffer fill, coloured by status (working / starved / low-power). The
	conversion loop itself runs in EconomyLayer; this component only reads.
-->
<script lang="ts">
	import { T } from '@threlte/core';
	import { BUILDING_HEIGHT } from '../lib/balance';
	import { refineryViews, type RefineryStatus } from '../state/refineries.svelte';

	const BAR_WIDTH = 0.9;
	const BAR_DEPTH = 0.18;
	const MIN_HEIGHT = 0.06;
	const MAX_HEIGHT = 0.6;

	const STATUS_COLORS: Record<RefineryStatus, string> = {
		working: '#2ecc71',
		starved: '#9aa4b5',
		'low-power': '#e0b64a',
	};

	const views = $derived(refineryViews());
</script>

{#each views as view (view.buildingId)}
	{@const height = Math.max(MIN_HEIGHT, MAX_HEIGHT * (view.input / view.capacity))}
	<T.Mesh position={[view.x, BUILDING_HEIGHT + 0.55, view.z]}>
		<T.BoxGeometry args={[BAR_WIDTH, height, BAR_DEPTH]} />
		<T.MeshStandardMaterial color={STATUS_COLORS[view.status]} />
	</T.Mesh>
{/each}
