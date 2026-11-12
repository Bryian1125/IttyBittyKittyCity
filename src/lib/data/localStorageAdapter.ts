import type { PersistenceAdapter } from './types';

export const localStorageAdapter: PersistenceAdapter = {
	read: (key) => window.localStorage.getItem(key),
	write: (key, value) => window.localStorage.setItem(key, value),
	remove: (key) => window.localStorage.removeItem(key),
};
