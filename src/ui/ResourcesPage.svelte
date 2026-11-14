<!--
	@component
	Resources page (#10): every resource with its live amount, a one-line
	description, and where it comes from.
-->
<script lang="ts">
	import { RESOURCES, type ResourceId } from '../lib/balance';
	import { getCarried } from '../state/carry.svelte';
	import { getStoredRawMinerals } from '../state/economy.svelte';
	import { getResource } from '../state/resources.svelte';
	import PageShell from './PageShell.svelte';

	const ids = Object.keys(RESOURCES) as ResourceId[];

	/** Raw Minerals are physical: the amount is everything carried or stored. */
	function liveAmount(id: ResourceId): number {
		if (id === 'rawMinerals') return getCarried() + getStoredRawMinerals();
		return getResource(id);
	}
</script>

<PageShell title="Resources">
	<div class="grid">
		{#each ids as id (id)}
			<div class="resource">
				<!-- TODO: replace with a resource icon image -->
				<span class="icon" aria-hidden="true"></span>
				<div class="info">
					<span class="name">{RESOURCES[id].label}</span>
					<span class="hint">{RESOURCES[id].hint}</span>
				</div>
				<span class="amount">{Math.floor(liveAmount(id))}</span>
			</div>
		{/each}
	</div>
</PageShell>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 0.7rem;

		& .resource {
			display: flex;
			align-items: center;
			gap: 0.8rem;
			padding: 0.8rem 1rem;
			border: 1px solid rgba(178, 188, 202, 0.7);
			border-radius: 16px;
			background: rgba(255, 255, 255, 0.72);

			& .icon {
				flex: none;
				width: 2.2rem;
				height: 2.2rem;
				border-radius: 10px;
				background: linear-gradient(180deg, #e8edf5, #cdd7e4);
				box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
			}

			& .info {
				display: flex;
				flex-direction: column;
				gap: 0.15rem;
				min-width: 0;

				& .name {
					font-weight: 800;
					color: #12151c;
				}

				& .hint {
					font-size: 0.8rem;
					line-height: 1.3;
					color: #5a6472;
				}
			}

			& .amount {
				margin-left: auto;
				font-size: 1.5rem;
				font-weight: 800;
				color: #12151c;
			}
		}
	}
</style>
