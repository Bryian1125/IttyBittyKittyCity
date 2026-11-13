export const camera = $state({
	yawTarget: 0,
	yaw: 0,
});

export function rotateCamera(steps: number): void {
	camera.yawTarget += steps * (Math.PI / 2);
}
