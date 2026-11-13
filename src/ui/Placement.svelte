<!--
	@component
	Build-mode placement: a ghost structure follows the pointer — green when
	placing succeeds, red when blocked — and a click charges the cost and
	commits it. Esc leaves build mode.
-->
<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { Plane, Raycaster, Vector2, Vector3 } from 'three';
	import type { CollisionSystem } from '../engine/CollisionSystem';
	import { BUILDING_HEIGHT } from '../lib/balance';
	import { getBuildingCenter, toCell } from '../lib/placement';
	import {
		buildingsState,
		confirmPlacement,
		getPlacementProblemAt,
		setPlacementCursor,
		stopPlacing,
	} from '../state/buildings.svelte';

	let { collision }: { collision: CollisionSystem } = $props();

	const { camera, renderer } = useThrelte();

	const raycaster = new Raycaster();
	const pointerNdc = new Vector2();
	const groundPlane = new Plane(new Vector3(0, 1, 0), 0);
	const groundPoint = new Vector3();

	const selected = $derived(buildingsState.selected);
	const cursor = $derived(buildingsState.cursor);
	const ghostProblem = $derived(cursor !== undefined ? getPlacementProblemAt(cursor) : null);

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

		const placed = confirmPlacement(anchor);
		if (placed === null) return;

		collision.addBox({
			position: getBuildingCenter(placed.anchor, placed.def.footprint),
			size: [placed.def.footprint[0], BUILDING_HEIGHT, placed.def.footprint[1]],
		});
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') stopPlacing();
	}
</script>

{#if selected !== undefined && cursor !== undefined}
	<T.Mesh position={getBuildingCenter(cursor, selected.footprint)}>
		<T.BoxGeometry args={[selected.footprint[0], BUILDING_HEIGHT, selected.footprint[1]]} />
		<T.MeshStandardMaterial
			color={ghostProblem === null ? '#2ecc71' : '#e74c3c'}
			transparent
			opacity={0.55}
			depthWrite={false}
		/>
	</T.Mesh>
{/if}

{#each buildingsState.placed as building (building.id)}
	<T.Mesh position={getBuildingCenter(building.anchor, building.def.footprint)}>
		<T.BoxGeometry args={[building.def.footprint[0], BUILDING_HEIGHT, building.def.footprint[1]]} />
		<T.MeshStandardMaterial color="#9aa4b5" />
	</T.Mesh>
{/each}

<svelte:window onpointermove={handlePointerMove} onclick={handleClick} onkeydown={handleKeydown} />
