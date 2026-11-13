<!--
	@component
	Build toolbar: pick a structure to place, see its cost, the current
	placement status, and the colony's power balance.
-->
<script lang="ts">
	import { BUILDINGS, type ResourceCost } from '../lib/balance';
	import { computePower } from '../lib/power';
	import type { PlacementProblem } from '../lib/placement';
	import {
		buildingsState,
		getPlacementProblemAt,
		startPlacing,
	} from '../state/buildings.svelte';

	const RESOURCE_LABELS = {
		food: 'Food',
		rawMinerals: 'Raw Minerals',
		materials: 'Materials',
		h3: 'H3',
	} as const;

	const PROBLEM_LABELS: Record<PlacementProblem, string> = {
		'out-of-bounds': 'Outside the buildable area',
		occupied: 'Blocked — something is already there',
		unaffordable: 'Not enough resources',
	};

	function formatCost(cost: ResourceCost): string {
		return Object.entries(cost)
			.map(([id, amount]) => `${amount} ${RESOURCE_LABELS[id as keyof typeof RESOURCE_LABELS]}`)
			.join(' + ');
	}

	const power = $derived(computePower(buildingsState.placed));
	const problem = $derived(
		buildingsState.selected !== undefined && buildingsState.cursor !== undefined
			? getPlacementProblemAt(buildingsState.cursor)
			: null,
	);
	const status = $derived(
		buildingsState.selected === undefined
			? 'Pick a structure to build'
			: problem !== null
				? PROBLEM_LABELS[problem]
				: 'Click a spot to build — Esc to cancel',
	);
</script>

<div class="toolbar">
	<div class="options">
		{#each BUILDINGS as def (def.id)}
			<button
				type="button"
				class="option"
				data-selected={buildingsState.selected?.id === def.id}
				onclick={() => startPlacing(def)}
			>
				{def.name}
				<span class="cost">{formatCost(def.cost)}</span>
			</button>
		{/each}
	</div>

	<p class="status" data-alert={problem !== null}>{status}</p>

	<p class="power" data-low={power.demand > 0 && power.satisfaction < 1}>
		Power {power.generate}/{power.demand} ({Math.round(power.satisfaction * 100)}%)
	</p>
</div>

<style>
	.toolbar {
		position: fixed;
		top: 1rem;
		left: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.6rem;
		max-width: 17rem;
		border-radius: 10px;
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
		font-size: 0.85rem;
		color: #dfe6f0;
		background: rgba(22, 22, 29, 0.85);

		& .options {
			display: flex;
			flex-direction: column;
			gap: 0.35rem;
		}

		& .option {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 0.75rem;
			padding: 0.45rem 0.6rem;
			border: 1px solid rgba(178, 188, 202, 0.6);
			border-radius: 7px;
			font: inherit;
			cursor: pointer;
			color: inherit;
			background: rgba(255, 255, 255, 0.08);

			&:hover {
				background: rgba(255, 255, 255, 0.16);
			}

			&[data-selected='true'] {
				border-color: #2ecc71;
				background: rgba(46, 204, 113, 0.25);
			}

			& .cost {
				color: #9fadc0;
			}
		}

		& .status,
		& .power {
			margin: 0;
			padding: 0 0.15rem;
		}

		& .status[data-alert='true'],
		& .power[data-low='true'] {
			color: #ff7b72;
		}
	}
</style>
