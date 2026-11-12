import type { PersistenceAdapter } from './types';

export function createMemoryAdapter(): PersistenceAdapter {
	const store = new Map<string, string>();

	return {
		read: (key) => store.get(key) ?? null,
		write: (key, value) => {
			store.set(key, value);
		},
		remove: (key) => {
			store.delete(key);
		},
	};
}
