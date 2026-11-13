export type SkinId = 'green' | 'blue' | 'orange' | 'purple';

export interface Skin {
	id: SkinId;
	label: string;
	color: string;
}

/** The four player skins, in picker order. */
export const SKINS: readonly Skin[] = [
	{ id: 'green', label: 'Green', color: '#7ed957' },
	{ id: 'blue', label: 'Blue', color: '#5aa9e6' },
	{ id: 'orange', label: 'Orange', color: '#f2a65a' },
	{ id: 'purple', label: 'Purple', color: '#b58cf2' },
];

export const DEFAULT_SKIN: SkinId = 'orange';

const STORAGE_KEY = 'kitty.skin';

const BY_ID = Object.fromEntries(
	SKINS.map((skin) => [skin.id, skin]),
) as Record<SkinId, Skin>;

/** The skin's body colour. */
export function skinColor(id: SkinId): string {
	return BY_ID[id].color;
}

function isSkinId(value: unknown): value is SkinId {
	return typeof value === 'string' && value in BY_ID;
}

/** Reads the persisted skin; falls back to the default. */
export function loadSkin(): SkinId {
	if (typeof localStorage === 'undefined') return DEFAULT_SKIN;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return isSkinId(stored) ? stored : DEFAULT_SKIN;
	} catch {
		return DEFAULT_SKIN;
	}
}

/** Persists the selected skin; a storage failure never blocks the choice. */
export function saveSkin(id: SkinId): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, id);
	} catch {
		// Private mode or quota problems: the skin still applies for the session.
	}
}
