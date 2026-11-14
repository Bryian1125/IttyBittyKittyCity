export type OverlayPage = 'resources' | 'settings';

export const gameState = $state({
	started: false,
	/** Open overlay page; gameplay input is ignored while one is open. */
	page: undefined as OverlayPage | undefined,
});

export function startGame(): void {
	gameState.started = true;
}

export function openPage(page: OverlayPage): void {
	gameState.page = page;
}

export function closePage(): void {
	gameState.page = undefined;
}
