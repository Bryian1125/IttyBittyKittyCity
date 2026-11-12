let yaw = $state(0);

export function getCameraYaw(): number {
	return yaw;
}

export function rotateCamera(steps: number): void {
	yaw += steps * (Math.PI / 2);
}
