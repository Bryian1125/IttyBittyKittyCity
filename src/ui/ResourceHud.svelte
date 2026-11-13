<!--
	@component
	Bottom-left resource HUD: a counter box per registry resource flagged for
	the HUD, plus the colony's power status (moved off the build menu).
-->
<script lang="ts">
	import { RESOURCES, type ResourceId } from '../lib/balance';
	import { computePower } from '../lib/power';
	import { buildingsState } from '../state/buildings.svelte';
	import { getCarried, getCarryCapacity } from '../state/carry.svelte';
	import { getHousingCapacity, getPopulation } from '../state/npcs.svelte';
	import { getResource } from '../state/resources.svelte';

	const HUD_RESOURCES = (Object.keys(RESOURCES) as ResourceId[]).filter(
		(id) => RESOURCES[id].hud,
	);

	const power = $derived(computePower(buildingsState.placed));
</script>

<div class="hud">
	{#each HUD_RESOURCES as id (id)}
		<div class="box">
			<span class="name">{RESOURCES[id].label}</span>
			<span class="amount">{getResource(id)}</span>
		</div>
	{/each}

	<div class="box">
		<span class="name">Carried</span>
		<span class="amount">{getCarried()}/{getCarryCapacity()}</span>
	</div>

	<div class="box">
		<span class="name">Colonists</span>
		<span class="amount">{getPopulation()}/{getHousingCapacity()}</span>
	</div>

	<div class="box" data-low={power.demand > 0 && power.satisfaction < 1}>
		<span class="name">Power</span>
		<span class="amount">{power.generate}/{power.demand}</span>
		<span class="percent">{Math.round(power.satisfaction * 100)}%</span>
	</div>
</div>

<style>
	.hud {
		position: fixed;
		left: 1rem;
		bottom: 1rem;
		display: flex;
		gap: 0.6rem;
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;

		& .box {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			min-width: 5.25rem;
			padding: 0.5rem 0.9rem;
			border: 1px solid rgba(178, 188, 202, 0.9);
			border-radius: 14px;
			color: #12151c;
			background: linear-gradient(180deg, #ffffff, #eef3fa);
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.95),
				0 8px 20px rgba(0, 0, 0, 0.35);

			& .name {
				font-size: 0.68rem;
				font-weight: 700;
				letter-spacing: 0.05em;
				text-transform: uppercase;
				color: #5a6472;
			}

			& .amount {
				font-size: 1.15rem;
				font-weight: 800;
				line-height: 1.2;
			}

			& .percent {
				font-size: 0.7rem;
				font-weight: 600;
				color: #5a6472;
			}

			&[data-low='true'] {
				border-color: #e59a9a;
				background: linear-gradient(180deg, #ffffff, #ffdcdc);

				& .name,
				& .amount,
				& .percent {
					color: #a3372f;
				}
			}
		}
	}
</style>
