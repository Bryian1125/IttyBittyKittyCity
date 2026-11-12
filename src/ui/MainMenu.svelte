<script lang="ts">
	import { startGame } from '../state/ui.svelte';
</script>

<div class="menu">
	<h1 class="title">Itty Bitty Kitty City</h1>

	<div class="channels">
		<button type="button" class="channel" onclick={startGame}>
			<span class="channel-label">Start Game</span>
		</button>

		<button type="button" class="channel">
			<span class="channel-label">Load Game</span>
		</button>
	</div>
</div>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
		background: #12141a;
	}

	.title {
		margin: 0 0 3.5rem;
		font-size: clamp(3rem, 7vw, 4.5rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #f4f6fa;
		text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
	}

	.channels {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 20rem;
	}

	.channel {
		position: relative;
		overflow: hidden;
		padding: 1.5rem 1rem;
		border: 1px solid rgba(178, 188, 202, 0.9);
		border-radius: 20px;
		font: inherit;
		font-size: 1.375rem;
		font-weight: 700;
		cursor: pointer;
		color: #12151c;
		background: linear-gradient(180deg, #ffffff, #eaf0f8);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			inset 0 -1px 0 rgba(150, 162, 178, 0.5),
			0 10px 24px rgba(0, 0, 0, 0.45);
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
	}

	/* Glossy top sheen with a whisper of blue */
	.channel::before {
		content: '';
		position: absolute;
		inset: 0 0 52% 0;
		border-radius: 19px 19px 60% 60% / 19px 19px 20px 20px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0));
		pointer-events: none;
	}

	.channel:hover {
		transform: translateY(-2px);
	}

	.channel:active {
		transform: translateY(3px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			inset 0 -1px 0 rgba(150, 162, 178, 0.5),
			0 4px 10px rgba(0, 0, 0, 0.45);
	}

	.channel-label {
		position: relative;
	}

	@media (prefers-reduced-motion: reduce) {
		.channel {
			transition: none;
		}
	}
</style>
