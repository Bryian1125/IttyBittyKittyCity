export const cameraYaw = $state(0);

export function rotateCamera(steps: number): void {
	cameraYaw += steps * (Math.PI / 2);
}
