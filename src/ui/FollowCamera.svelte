<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import type { Object3D } from 'three';
	// Registers the Q/E key listeners on window as an import side effect.
	import '../lib/cameraInput';
	import { camera } from '../state/camera.svelte';
	import { FollowCameraSystem } from '../engine/FollowCameraSystem';

	let { target }: { target: Object3D } = $props();

	const { camera: sceneCamera } = useThrelte();
	const system = new FollowCameraSystem(camera);

	system.initialize(sceneCamera.current);

	function onWheel(event: WheelEvent): void {
		system.zoom(event.deltaY);
	}

	$effect(() => {
		window.addEventListener('wheel', onWheel, { passive: true });
		return () => window.removeEventListener('wheel', onWheel);
	});

	useTask((delta) => {
		system.update(delta, sceneCamera.current, target.position);
	});
</script>
