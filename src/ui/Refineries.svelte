<!--
	@component
	Buffer bars over the placed refineries: one small floating box each, as tall
	as the input buffer is full and coloured by whether the refinery is working,
	starved, or short on power. The same component drives the refining tick that
	turns buffered Raw Minerals into Materials.
-->
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BUILDING_HEIGHT } from '../lib/balance';
	import {
		refineryViews,
		tickRefineries,
		type RefineryStatus,
	} from '../state/refineries.svelte';

	/** Green while converting, grey starved (no input), amber low-power. */
	const STATUS_COLORS: Record<RefineryStatus, string> = {
		working: '#2ecc71',
		starved: '#9aa4b5',
		'low-power': '#e0b64a',
	};

	const BAR_WIDTH = 0.9;
	const BAR_DEPTH = 0.18;
	const BAR_MAX_HEIGHT = 0.6;
	const BAR_MIN_HEIGHT = 0.06;
	const BAR_Y = BUILDING_HEIGHT + 0.55;

	/** Buffer fullness as a bar height, never flatter than a sliver. */
	function barHeight(input: number, capacity: number): number {
		return Math.max(BAR_MIN_HEIGHT, (BAR_MAX_HEIGHT * input) / capacity);
	}

	useTask((delta) => tickRefineries(delta));

	const views = $derived(refineryViews());
</script>

{#each views as view (view.buildingId)}
	<T.Mesh position={[view.x, BAR_Y, view.z]}>
		<T.BoxGeometry
			args={[BAR_WIDTH, barHeight(view.input, view.capacity), BAR_DEPTH]}
		/>
		<T.MeshStandardMaterial color={STATUS_COLORS[view.status]} />
	</T.Mesh>
{/each}
