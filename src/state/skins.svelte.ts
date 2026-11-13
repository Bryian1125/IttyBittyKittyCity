import { loadSkin, saveSkin, type SkinId } from '../lib/skins';

let current = $state<SkinId>(loadSkin());

/** The selected player skin. */
export function getSkin(): SkinId {
	return current;
}

/** Applies and persists a skin; components reading `getSkin` update at once. */
export function setSkin(id: SkinId): void {
	current = id;
	saveSkin(id);
}
