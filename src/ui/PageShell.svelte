<!--
	@component
	Full-screen overlay shell for the HUD pages: a dark backdrop, a glossy
	Wii/iisu card with a title, the page content, and a Close button. Esc
	dismisses the page.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { closePage } from '../state/ui.svelte';

	let { title, children }: { title: string; children?: Snippet } = $props();

	function onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') closePage();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="backdrop" role="presentation">
	<div class="card" role="dialog" aria-label={title}>
		<h2 class="title">{title}</h2>
		{@render children?.()}
		<button type="button" class="close" onclick={closePage}>Close</button>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(22, 22, 29, 0.72);
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: min(92vw, 44rem);
		max-height: 84vh;
		overflow-y: auto;
		padding: 1.5rem;
		border: 1px solid rgba(178, 188, 202, 0.9);
		border-radius: 22px;
		background: linear-gradient(180deg, #ffffff, #eef3fa);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 18px 50px rgba(0, 0, 0, 0.5);

		& .title {
			margin: 0;
			text-align: center;
			font-size: 1.9rem;
			font-weight: 800;
			letter-spacing: -0.02em;
			color: #12151c;
		}

		& .close {
			align-self: center;
			padding: 0.7rem 2.2rem;
			border: 1px solid rgba(178, 188, 202, 0.9);
			border-radius: 999px;
			font: inherit;
			font-size: 1.05rem;
			font-weight: 700;
			color: #12151c;
			cursor: pointer;
			background: linear-gradient(180deg, #ffffff, #eaf0f8);
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.95),
				inset 0 -1px 0 rgba(150, 162, 178, 0.5),
				0 8px 18px rgba(0, 0, 0, 0.35);
			transition: transform 0.12s ease;

			&:hover {
				transform: translateY(-2px);
			}

			&:active {
				transform: translateY(2px);
			}
		}
	}
</style>
