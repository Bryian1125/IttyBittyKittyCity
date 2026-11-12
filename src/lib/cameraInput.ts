import { rotateCamera } from '../state/camera.svelte';

const steps: Record<string, number> = {
	KeyE: 1,
	KeyQ: -1,
};

if (typeof window !== 'undefined') {
	window.addEventListener('keydown', (event) => {
		const direction = steps[event.code];
		if (direction === undefined || event.repeat) return;
		rotateCamera(direction);
	});
}
