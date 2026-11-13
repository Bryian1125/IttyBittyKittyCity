import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SKIN, SKINS, loadSkin, saveSkin, skinColor } from './skins';

function fakeStorage() {
	const map = new Map<string, string>();
	return {
		getItem: (key: string): string | null => map.get(key) ?? null,
		setItem: (key: string, value: string): void => {
			map.set(key, value);
		},
		removeItem: (key: string): void => {
			map.delete(key);
		},
		clear: (): void => map.clear(),
		key: (index: number): string | null => [...map.keys()][index] ?? null,
		get length(): number {
			return map.size;
		},
	};
}

describe('skins', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('offers the four skins in order', () => {
		expect(SKINS.map((skin) => skin.id)).toEqual([
			'green',
			'blue',
			'orange',
			'purple',
		]);
	});

	it('maps every skin id to a colour', () => {
		for (const skin of SKINS) {
			expect(skinColor(skin.id)).toBe(skin.color);
		}
	});

	it('falls back to the default without storage', () => {
		vi.stubGlobal('localStorage', undefined);
		expect(loadSkin()).toBe(DEFAULT_SKIN);
	});

	it('round-trips a saved skin', () => {
		vi.stubGlobal('localStorage', fakeStorage());
		saveSkin('purple');
		expect(loadSkin()).toBe('purple');
	});

	it('ignores invalid stored values', () => {
		const storage = fakeStorage();
		storage.setItem('kitty.skin', 'rainbow');
		vi.stubGlobal('localStorage', storage);
		expect(loadSkin()).toBe(DEFAULT_SKIN);
	});
});
