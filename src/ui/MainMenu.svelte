<script lang="ts">
	import { openPage, startGame } from '../state/ui.svelte';
</script>

<div class="menu">
	<div class="stars" aria-hidden="true"></div>

	<h1 class="title">Itty Bitty Kitty City</h1>

	<div class="channels">
		<button type="button" class="channel" onclick={startGame}>
			<span class="channel-label">Start Game</span>
		</button>

		<button type="button" class="channel" onclick={() => openPage('settings')}>
			<span class="channel-label">Settings</span>
		</button>

		<button type="button" class="channel">
			<span class="channel-label">Load Game</span>
		</button>
	</div>
</div>

<style>
	.menu {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
		background: #16161d;
	}

	/* Eigengrau starfield, pure CSS so there are no image assets to load */
	.stars {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			radial-gradient(1.5px 1.5px at 8% 14%, rgba(255, 255, 255, 0.9), transparent 60%),
			radial-gradient(1px 1px at 17% 58%, rgba(255, 255, 255, 0.7), transparent 60%),
			radial-gradient(1px 1px at 23% 32%, rgba(255, 255, 255, 0.8), transparent 60%),
			radial-gradient(2px 2px at 31% 78%, rgba(190, 220, 255, 0.9), transparent 60%),
			radial-gradient(1px 1px at 38% 20%, rgba(255, 255, 255, 0.75), transparent 60%),
			radial-gradient(1.5px 1.5px at 45% 66%, rgba(255, 255, 255, 0.85), transparent 60%),
			radial-gradient(1px 1px at 52% 40%, rgba(255, 255, 255, 0.65), transparent 60%),
			radial-gradient(2px 2px at 59% 12%, rgba(190, 220, 255, 0.85), transparent 60%),
			radial-gradient(1px 1px at 64% 84%, rgba(255, 255, 255, 0.7), transparent 60%),
			radial-gradient(1px 1px at 71% 48%, rgba(255, 255, 255, 0.75), transparent 60%),
			radial-gradient(1.5px 1.5px at 77% 26%, rgba(255, 255, 255, 0.8), transparent 60%),
			radial-gradient(1px 1px at 83% 70%, rgba(255, 255, 255, 0.6), transparent 60%),
			radial-gradient(2.5px 2.5px at 89% 38%, rgba(190, 220, 255, 0.8), transparent 60%),
			radial-gradient(1px 1px at 94% 82%, rgba(255, 255, 255, 0.7), transparent 60%),
			radial-gradient(1px 1px at 13% 92%, rgba(255, 255, 255, 0.6), transparent 60%);
		background-repeat: no-repeat;
		animation: twinkle 5s ease-in-out infinite alternate;
	}

	@keyframes twinkle {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 1;
		}
	}

	.title {
		position: relative;
		margin: 0 0 3.5rem;
		font-size: clamp(3.25rem, 7vw, 4.75rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #f4f8ff;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
	}

	.channels {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.35rem;
		width: 19rem;
	}

	.channel {
		position: relative;
		overflow: hidden;
		padding: 1.4rem 1rem;
		border: 1px solid rgba(178, 188, 202, 0.9);
		border-radius: 999px;
		font: inherit;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.01em;
		cursor: pointer;
		color: #12151c;
		background: linear-gradient(180deg, #ffffff, #eaf0f8);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			inset 0 -1px 0 rgba(150, 162, 178, 0.5),
			0 10px 26px rgba(0, 0, 0, 0.5);
		transition:
			transform 0.12s ease,
			box-shadow 0.12s ease;
	}

	/* Glossy top sheen with a whisper of blue */
	.channel::before {
		content: '';
		position: absolute;
		inset: 0 0 54% 0;
		border-radius: 999px 999px 60% 60% / 999px 999px 22px 22px;
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
			0 4px 12px rgba(0, 0, 0, 0.5);
	}

	.channel-label {
		position: relative;
	}

	@media (prefers-reduced-motion: reduce) {
		.stars {
			animation: none;
		}

		.channel {
			transition: none;
		}
	}
</style>
