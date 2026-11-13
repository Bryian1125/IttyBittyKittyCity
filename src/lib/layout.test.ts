import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sites } from './layout';

describe('sites', () => {
	it('marks every minerals collection point with an ore deposit', () => {
		const minerals = sites.filter((site) => site.type === 'minerals');

		expect(minerals.length).toBeGreaterThan(0);
		for (const site of minerals) {
			expect(site.deposit).toMatch(/^\/models\//);
		}
	});

	it('points every deposit at a file that ships in public/', () => {
		for (const site of sites) {
			if (site.deposit === undefined) continue;

			const file = join(process.cwd(), 'public', site.deposit.replace(/^\//, ''));
			expect(existsSync(file), `${site.id} -> ${site.deposit}`).toBe(true);
		}
	});
});
