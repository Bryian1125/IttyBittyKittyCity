<!--
	@component
	Build menu: a bottom-right Build button that toggles the building picker.
	Affordability is communicated by colour — green when buildable, red when
	not — and the selected entry grows slightly. Placement validity lives on
	the ghost block itself, never in text.
-->
<script lang="ts">
	import { BUILDINGS, RESOURCES, type ResourceCost, type ResourceId } from '../lib/balance';
	import { TOOLS } from '../lib/tools';
	import { buildingsState, startPlacing } from '../state/buildings.svelte';
	import { isUnlocked } from '../state/npcs.svelte';
	import { canAfford } from '../state/resources.svelte';
	import { buyTool, equipTool, getEquippedTool, isToolOwned } from '../state/tools.svelte';

	let open = $state(false);

	function formatCost(cost: ResourceCost): string {
		const entries = Object.entries(cost);
		if (entries.length === 0) return 'Free';
		return entries
			.map(([id, amount]) => `${amount} ${RESOURCES[id as ResourceId].label}`)
			.join(' + ');
	}
</script>

<div class="build-menu">
	{#if open}
		<div class="panel">
			<span class="section">Tools</span>
			{#each TOOLS as tool (tool.id)}
				{@const owned = isToolOwned(tool.id)}
				{@const equipped = getEquippedTool().id === tool.id}
				<button
					type="button"
					class="option"
					data-affordable={owned || canAfford({ materials: tool.cost })}
					data-selected={equipped}
					disabled={!owned && !canAfford({ materials: tool.cost })}
					onclick={() => (owned ? equipTool(tool.id) : buyTool(tool.id))}
				>
					{tool.name}
					<span class="cost"
						>{owned ? (equipped ? 'Equipped' : 'Owned') : `${tool.cost} Materials`}</span
					>
				</button>
			{/each}

			<span class="section">Buildings</span>
			{#each BUILDINGS as def (def.id)}
				<button
					type="button"
					class="option"
					data-affordable={canAfford(def.cost)}
					data-selected={buildingsState.selected?.id === def.id}
					data-locked={!isUnlocked(def)}
					disabled={!isUnlocked(def)}
					onclick={() => startPlacing(def)}
				>
					{def.name}
					{#if !isUnlocked(def)}
						<span class="locked">Requires {def.unlock?.minPopulation} colonists</span>
					{:else}
						<span class="cost">{formatCost(def.cost)}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<button type="button" class="build-button" onclick={() => (open = !open)}>
		<!-- TODO: replace with a hammer icon image -->
		<span class="icon" aria-hidden="true"></span>
		Build
	</button>
</div>

<style>
	.build-menu {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.6rem;
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 15rem;
		max-height: min(60vh, 24rem);
		overflow-y: auto;
		padding: 0.75rem;
		border: 1px solid rgba(178, 188, 202, 0.9);
		border-radius: 18px;
		background: linear-gradient(180deg, #ffffff, #eef3fa);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 10px 26px rgba(0, 0, 0, 0.35);

		& .section {
			padding: 0 0.2rem;
			font-size: 0.7rem;
			font-weight: 700;
			letter-spacing: 0.05em;
			text-transform: uppercase;
			color: #5a6472;
		}

		& .option {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 0.75rem;
			padding: 0.55rem 0.8rem;
			border: 1px solid rgba(178, 188, 202, 0.9);
			border-radius: 12px;
			font: inherit;
			font-weight: 700;
			color: #12151c;
			cursor: pointer;
			background: linear-gradient(180deg, #ffffff, #eaf0f8);
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.95),
				0 4px 12px rgba(0, 0, 0, 0.25);
			transition:
				transform 0.12s ease,
				background 0.12s ease;

			&:hover {
				transform: translateY(-2px);
			}

			&[data-affordable='true'] {
				border-color: #7fce96;
				background: linear-gradient(180deg, #ffffff, #d9f4de);
			}

			&[data-affordable='false'] {
				border-color: #e59a9a;
				background: linear-gradient(180deg, #ffffff, #ffdcdc);
			}

			&[data-locked='true'] {
				border-color: rgba(178, 188, 202, 0.9);
				color: #8a93a1;
				cursor: not-allowed;
				background: linear-gradient(180deg, #f7f9fc, #e6ebf2);

				&:hover {
					transform: none;
				}
			}

			&[data-selected='true'] {
				transform: scale(1.06);
				box-shadow:
					inset 0 1px 0 rgba(255, 255, 255, 0.95),
					0 8px 18px rgba(0, 0, 0, 0.35);
			}

			& .cost {
				font-size: 0.75rem;
				font-weight: 600;
				color: #5a6472;
			}

			& .locked {
				font-size: 0.75rem;
				font-weight: 600;
				color: #8a93a1;
			}
		}
	}

	.build-button {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.9rem 1.6rem;
		border: 1px solid rgba(178, 188, 202, 0.9);
		border-radius: 999px;
		font: inherit;
		font-size: 1.1rem;
		font-weight: 700;
		color: #12151c;
		cursor: pointer;
		background: linear-gradient(180deg, #ffffff, #eaf0f8);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			inset 0 -1px 0 rgba(150, 162, 178, 0.5),
			0 10px 26px rgba(0, 0, 0, 0.5);
		transition: transform 0.12s ease;

		&:hover {
			transform: translateY(-2px);
		}

		&:active {
			transform: translateY(3px);
		}

		& .icon {
			width: 1.35rem;
			height: 1.35rem;
			border-radius: 7px;
			background: linear-gradient(180deg, #f0d9a4, #caa257);
			box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
		}
	}
</style>
