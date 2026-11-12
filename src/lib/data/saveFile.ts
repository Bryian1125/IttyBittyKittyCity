export interface SaveFile<T> {
	version: number;
	savedAt: string;
	data: T;
}

export function serialize<T>(data: T, version: number): string {
	const file: SaveFile<T> = {
		version,
		savedAt: new Date().toISOString(),
		data,
	};

	return JSON.stringify(file);
}

export function deserialize<T>(raw: string, version: number): T {
	const file = JSON.parse(raw) as SaveFile<T>;

	if (file.version !== version) {
		throw new Error(`save version mismatch: expected ${version}, found ${file.version}`);
	}

	return file.data;
}
