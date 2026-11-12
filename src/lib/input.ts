export type MovementAction = 'forward' | 'backward' | 'left' | 'right';

export interface MovementState {
	forward: boolean;
	backward: boolean;
	left: boolean;
	right: boolean;
}

const bindings: Record<string, MovementAction> = {
	KeyW: 'forward',
	KeyA: 'left',
	KeyS: 'backward',
	KeyD: 'right',
};

const state: MovementState = {
	forward: false,
	backward: false,
	left: false,
	right: false,
};

function handleKey(event: KeyboardEvent, pressed: boolean): void {
	const action = bindings[event.code];
	if (action === undefined) return;
	state[action] = pressed;
	event.preventDefault();
}

if (typeof window !== 'undefined') {
	window.addEventListener('keydown', (event) => handleKey(event, true));
	window.addEventListener('keyup', (event) => handleKey(event, false));
}

export function readMovement(): MovementState {
	return { ...state };
}
