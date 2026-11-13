<!--
	@component
	World interaction: every frame it finds the nearest interactable within
	reach — resource nodes (#5) and refinery input buffers (#6) — shows the [F]
	prompt, and fires its action on an F press (the camera owns Q/E). Build
	placement mode wins: a short hint replaces the prompt while a structure is
	selected.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Group } from 'three';
	import { COLLECTION, REFINING } from '../lib/balance';
	import { pickNearest, type Interactable } from '../lib/interact';
	import { buildingsState } from '../state/buildings.svelte';
	import { getCarried, getCarryCapacity } from '../state/carry.svelte';
	import { nodeViews, tryCollectNode } from '../state/nodes.svelte';
	import { depositIntoRefinery, refineryViews } from '../state/refineries.svelte';

	let { player }: { player?: Group } = $props();

	let nearest = $state<Interactable>();
	let toast = $state<string>();
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	function showToast(text: string): void {
		toast = text;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toast = undefined;
		}, 1600);
	}

	function candidates(): Interactable[] {
		const list: Interactable[] = [];

		for (const node of nodeViews()) {
			list.push({
				id: `node:${node.id}`,
				x: node.x,
				z: node.z,
				radius: COLLECTION.interactRadius,
				label: node.label,
				enabled: node.available,
				act: () => {
					const result = tryCollectNode(node.id);
					if (result !== null) showToast(result.text);
				},
			});
		}

		for (const refinery of refineryViews()) {
			list.push({
				id: `refinery:${refinery.buildingId}`,
				x: refinery.x,
				z: refinery.z,
				radius: REFINING.interactRadius,
				label: `Deposit Raw Minerals — ${getCarried()}/${getCarryCapacity()} carried`,
				enabled: refinery.input < refinery.capacity && getCarried() > 0,
				act: () => {
					const moved = depositIntoRefinery(refinery.buildingId, getCarried());
					if (moved > 0) showToast(`+${moved} Raw Minerals → Refinery`);
				},
			});
		}

		return list;
	}

	function refresh(): void {
		if (buildingsState.selected !== undefined || player === undefined) {
			nearest = undefined;
			return;
		}

		const next = pickNearest(candidates(), player.position.x, player.position.z);
		if (next?.id !== nearest?.id || next?.label !== nearest?.label) {
			nearest = next;
		}
	}

	let frame = 0;
	$effect(() => {
		const loop = (): void => {
			refresh();
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	});

	onDestroy(() => {
		clearTimeout(toastTimer);
	});

	function onKeydown(event: KeyboardEvent): void {
		if (event.code !== 'KeyF' || event.repeat) return;
		if (buildingsState.selected !== undefined || nearest === undefined) return;

		nearest.act();
		refresh();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if buildingsState.selected !== undefined}
	<div class="prompt">Build mode — click to place, Esc to cancel</div>
{:else if nearest !== undefined}
	<div class="prompt">[F] {nearest.label}</div>
{/if}
{#if toast !== undefined}
	<div class="toast" role="status">{toast}</div>
{/if}

<style>
	.prompt,
	.toast {
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.55rem 1.15rem;
		border: 1px solid rgba(178, 188, 202, 0.9);
		border-radius: 999px;
		color: #12151c;
		font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
		font-weight: 700;
		background: linear-gradient(180deg, #ffffff, #eef3fa);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.95),
			0 8px 20px rgba(0, 0, 0, 0.35);
		pointer-events: none;
		white-space: nowrap;
	}

	.prompt {
		bottom: 1.6rem;
	}

	.toast {
		bottom: 4.4rem;
	}
</style>
