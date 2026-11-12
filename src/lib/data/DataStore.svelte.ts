import { deserialize, serialize } from './saveFile';
import type { PersistenceAdapter } from './types';

export class DataStore<T extends object> {
	private readonly initial: T;
	private readonly key: string;
	private readonly adapter: PersistenceAdapter;
	private readonly version: number;

	data = $state<T>();

	constructor(key: string, initial: T, adapter: PersistenceAdapter, version = 1) {
		this.key = key;
		this.initial = initial;
		this.adapter = adapter;
		this.version = version;
		this.data = this.load() ?? { ...initial };
	}

	patch(partial: Partial<T>): void {
		Object.assign(this.data, partial);
	}

	save(): void {
		this.adapter.write(this.key, serialize(this.data, this.version));
	}

	load(): T | null {
		const raw = this.adapter.read(this.key);
		if (raw === null) return null;

		try {
			return deserialize<T>(raw, this.version);
		} catch {
			// Corrupt or version-mismatched saves are ignored rather than fatal.
			return null;
		}
	}

	clear(): void {
		this.adapter.remove(this.key);
		this.data = { ...this.initial };
	}
}
