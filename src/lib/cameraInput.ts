export type CameraAction = 'rotateLeft' | 'rotateRight';

export interface CameraInputState {
	rotateLeft: boolean;
	rotateRight: boolean;
}

const bindings: Record<string, CameraAction> = {
	KeyE: 'rotateRight',
	KeyQ: 'rotateLeft',
};

const state: CameraInputState = {
	rotateLeft: false,
	rotateRight: false,
};

if (typeof window !== 'undefined') {
	window.addEventListener('keydown', (event) => {
		const action = bindings[event.code];
		if (action === undefined || event.repeat) return;
		state[action] = true;
	});

	window.addEventListener('keyup', (event) => {
		const action = bindings[event.code];
		if (action === undefined) return;
		state[action] = false;
	});
}

export function readCameraInput(): CameraInputState {
	return { ...state };
}
