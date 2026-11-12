<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import type { Object3D } from 'three';
	import { cameraYaw } from '../state/camera.svelte';
	import { FollowCameraSystem } from '../engine/FollowCameraSystem';

	let { target }: { target: Object3D } = $props();

	const { camera } = useThrelte();
	const system = new FollowCameraSystem();

	system.initialize(camera.current);

	function onWheel(event: WheelEvent): void {
		system.zoom(event.deltaY);
	}

	$effect(() => {
		window.addEventListener('wheel', onWheel, { passive: true });
		return () => window.removeEventListener('wheel', onWheel);
	});

	useTask((delta) => {
		system.update(delta, camera.current, target.position, cameraYaw);
	});
</script>
