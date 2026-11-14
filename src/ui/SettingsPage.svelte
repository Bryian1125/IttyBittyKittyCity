<!--
	@component
	Settings page (#12): the player skin picker and the controls reference.
	Skin changes apply instantly and persist across reloads.
-->
<script lang="ts">
	import { SKINS } from '../lib/skins';
	import { getSkin, setSkin } from '../state/skins.svelte';
	import PageShell from './PageShell.svelte';

	// Mirrors the real bindings: input.ts, cameraInput.ts, Interaction.svelte, Placement.svelte.
	const CONTROLS: ReadonlyArray<{ keys: string; action: string }> = [
		{ keys: 'W A S D', action: 'Move' },
		{ keys: 'Q / E', action: 'Turn camera' },
		{ keys: 'Mouse wheel', action: 'Zoom' },
		{ keys: 'R', action: 'Rotate structure while building' },
		{ keys: 'Esc', action: 'Cancel / close' },
	];
</script>

<PageShell title="Settings">
	<section class="section">
		<h3 class="heading">Skin</h3>
		<div class="swatches">
			{#each SKINS as skin (skin.id)}
				<button
					type="button"
					class="swatch"
					data-selected={getSkin() === skin.id}
					onclick={() => setSkin(skin.id)}
				>
					<span class="dot" style:background={skin.color} aria-hidden="true"></span>
					{skin.label}
				</button>
			{/each}
		</div>
	</section>

	<section class="section">
		<h3 class="heading">Controls</h3>
		<ul class="controls">
			{#each CONTROLS as row (row.keys)}
				<li class="row">
					<span class="keys">{row.keys}</span>
					<span class="action">{row.action}</span>
				</li>
			{/each}
		</ul>
	</section>
</PageShell>

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;

		& .heading {
			margin: 0;
			font-size: 0.8rem;
			font-weight: 700;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: #5a6472;
		}
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;

		& .swatch {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.55rem 1rem;
			border: 1px solid rgba(178, 188, 202, 0.9);
			border-radius: 999px;
			font: inherit;
			font-weight: 700;
			color: #12151c;
			cursor: pointer;
			background: linear-gradient(180deg, #ffffff, #eaf0f8);
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.95),
				0 4px 12px rgba(0, 0, 0, 0.2);
			transition: transform 0.12s ease;

			&:hover {
				transform: translateY(-2px);
			}

			&[data-selected='true'] {
				border-color: #7fce96;
				background: linear-gradient(180deg, #ffffff, #d9f4de);
				transform: scale(1.05);
			}

			& .dot {
				width: 1.1rem;
				height: 1.1rem;
				border-radius: 999px;
				box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
			}
		}
	}

	.controls {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;

		& .row {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			padding: 0.45rem 0.2rem;
			border-bottom: 1px solid rgba(178, 188, 202, 0.4);

			&:last-child {
				border-bottom: none;
			}

			& .keys {
				font-weight: 700;
				color: #12151c;
			}

			& .action {
				color: #5a6472;
			}
		}
	}
</style>
