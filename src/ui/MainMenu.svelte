<script lang="ts">
	import { startGame } from '../state/ui.svelte';
</script>

<div class="menu">
	<div class="panel">
		<h1 class="title">Itty Bitty Kitty City</h1>

		<div class="channels">
			<button type="button" class="channel channel--start" onclick={startGame}>
				<span class="channel-label">Start Game</span>
			</button>

			<button type="button" class="channel channel--load">
				<span class="channel-label">Load Game</span>
			</button>
		</div>
	</div>
</div>

<style>
	.menu {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35), transparent 60%),
			linear-gradient(160deg, #a8e0f7 0%, #c9b6ec 55%, #f7c6d9 100%);
	}

	.panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 4rem 3.5rem;
		background: rgba(255, 255, 255, 0.28);
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 36px;
		box-shadow:
			0 24px 48px rgba(60, 40, 90, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		animation: panel-in 0.45s cubic-bezier(0.22, 1.4, 0.36, 1) both;
	}

	@keyframes panel-in {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.title {
		margin: 0 0 2.25rem;
		font-size: 2.5rem;
		font-weight: 800;
		letter-spacing: 0.02em;
		color: #fff;
		text-shadow: 0 2px 8px rgba(87, 60, 120, 0.45);
	}

	.channels {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 20rem;
	}

	.channel {
		position: relative;
		overflow: hidden;
		padding: 1.5rem 1rem;
		border: none;
		border-radius: 24px;
		font: inherit;
		font-size: 1.375rem;
		font-weight: 700;
		cursor: pointer;
		color: #fff;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%),
			linear-gradient(180deg, #6ec7f0, #4a9fd8);
		box-shadow:
			0 6px 0 #3a7fb4,
			0 12px 20px rgba(40, 30, 70, 0.25);
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
	}

	.channel--load {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 45%),
			linear-gradient(180deg, #c7a8e8, #a884d0);
		box-shadow:
			0 6px 0 #8a68b0,
			0 12px 20px rgba(40, 30, 70, 0.25);
	}

	/* Glossy top highlight, like the 3DS/Wii channel sheen */
	.channel::before {
		content: '';
		position: absolute;
		inset: 0 0 55% 0;
		border-radius: 24px 24px 60% 60% / 24px 24px 22px 22px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
		pointer-events: none;
	}

	.channel:hover {
		transform: translateY(-2px);
	}

	.channel:active {
		transform: translateY(4px);
		box-shadow:
			0 2px 0 #3a7fb4,
			0 6px 10px rgba(40, 30, 70, 0.25);
	}

	.channel--load:active {
		box-shadow:
			0 2px 0 #8a68b0,
			0 6px 10px rgba(40, 30, 70, 0.25);
	}

	.channel-label {
		position: relative;
		text-shadow: 0 1px 2px rgba(30, 30, 60, 0.35);
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
</style>
