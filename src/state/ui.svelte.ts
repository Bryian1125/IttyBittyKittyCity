export const gameState = $state({
	started: false,
});

export function startGame(): void {
	gameState.started = true;
}
