<!--
	@component
	Build-mode placement: a ghost structure follows the pointer — green when
	placing succeeds, red when blocked — and a click charges the cost and
	commits it. R turns the structure a quarter turn. Esc leaves build mode.
-->
<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { Plane, Raycaster, Vector2, Vector3, type Mesh } from 'three';
	import type { CollisionSystem } from '../engine/CollisionSystem';
	import { BUILDING_HEIGHT } from '../lib/balance';
	import { getBuildingCenter, rotateFootprint, toCell, type Cell } from '../lib/placement';
	import {
		buildingsState,
		confirmPlacement,
		getPlacementProblemAt,
		rotatePlacement,
		setPlacementCursor,
		stopPlacing,
	} from '../state/buildings.svelte';
	import BuildingGhost from './BuildingGhost.svelte';
	import BuildingModel from './BuildingModel.svelte';

	let { collision, player }: { collision: CollisionSystem; player?: Mesh } = $props();

	const { camera, renderer } = useThrelte();

	const raycaster = new Raycaster();
	const pointerNdc = new Vector2();
	const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
	const groundPoint = new Vector3();

	let playerCell = $state<Cell | undefined>(undefined);

	const selected = $derived(buildingsState.selected);
	const cursor = $derived(buildingsState.cursor);
	const ghostProblem = $derived(
		cursor !== undefined ? getPlacementProblemAt(cursor, playerCell) : null,
	);

	// Tracked once per frame; a structure can never be built over the player.
	useTask(() => {
		if (player === undefined) return;

		const cell = toCell(player.position.x, player.position.z);
		if (
			playerCell === undefined ||
			cell.column !== playerCell.column ||
			cell.row !== playerCell.row
		) {
			playerCell = cell;
		}
	});

	function isCanvasEvent(event: MouseEvent): boolean {
		return event.composedPath().includes(renderer.domElement);
	}

	function handlePointerMove(event: PointerEvent): void {
		if (!isCanvasEvent(event) || buildingsState.selected === undefined) return;

		const canvasRect = renderer.domElement.getBoundingClientRect();
		pointerNdc.set(
			((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1,
			-((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1,
		);

		raycaster.setFromCamera(pointerNdc, camera.current);
		if (raycaster.ray.intersectPlane(groundPlane, groundPoint)) {
			setPlacementCursor(toCell(groundPoint.x, groundPoint.z));
		}
	}

	function handleClick(event: MouseEvent): void {
		const anchor = cursor;
		if (!isCanvasEvent(event) || anchor === undefined) return;

		const placed = confirmPlacement(anchor, playerCell);
		if (placed === null) return;

		const footprint = rotateFootprint(placed.def.footprint, placed.rotation);
		collision.addBox({
			position: getBuildingCenter(placed.anchor, footprint),
			size: [footprint[0], BUILDING_HEIGHT, footprint[1]],
		});
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') stopPlacing();

		// Physical key, like the movement and camera bindings: R must not depend
		// on the layout. Ignore auto-repeat and leave Ctrl/Cmd+R to the browser.
		if (
			event.code === 'KeyR' &&
			!event.repeat &&
			!event.ctrlKey &&
			!event.metaKey &&
			buildingsState.selected !== undefined
		) {
			rotatePlacement();
		}
	}
</script>

{#if selected !== undefined && cursor !== undefined}
	<BuildingGhost
		def={selected}
		anchor={cursor}
		rotation={buildingsState.rotation}
		blocked={ghostProblem !== null}
	/>
{/if}

{#each buildingsState.placed as building (building.id)}
	<BuildingModel def={building.def} anchor={building.anchor} rotation={building.rotation} />
{/each}

<svelte:window onpointermove={handlePointerMove} onclick={handleClick} onkeydown={handleKeydown} />
