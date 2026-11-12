<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import type { Object3D } from 'three';
	import { FollowCameraSystem } from '../engine/FollowCameraSystem';

	let { target }: { target: Object3D } = $props();

	const { camera } = useThrelte();
	const system = new FollowCameraSystem();

	useTask((delta) => {
		system.update(delta, camera.current, target.position);
	});
</script>
