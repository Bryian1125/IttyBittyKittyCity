export type BoxSpec = {
	id: string;
	position: [number, number, number];
	size: [number, number, number];
	color: string;
};

export type MapSiteType = 'h3' | 'minerals' | 'nuclear';

export type MapSite = {
	id: string;
	type: MapSiteType;
	position: [number, number, number];
	size: [number, number, number];
};

export const floor: BoxSpec = {
	id: 'floor',
	position: [0, -0.1, 0],
	size: [60, 0.2, 60],
	color: '#2b2b2b',
};

/**
 * Collection points: a site-typed structure must be built on top of one, and
 * no other structure may cover one. Positions and sizes are placeholders.
 */
export const sites: MapSite[] = [
	{
		id: 'minerals-north',
		type: 'minerals',
		position: [-8, 0.4, -6],
		size: [3, 0.8, 3],
	},
	{
		id: 'minerals-east',
		type: 'minerals',
		position: [9, 0.4, -8],
		size: [3, 0.8, 3],
	},
	{ id: 'h3-west', type: 'h3', position: [-10, 0.5, 8], size: [2.5, 1, 2.5] },
	{
		id: 'nuclear-south',
		type: 'nuclear',
		position: [8, 0.4, 10],
		size: [4, 0.8, 4],
	},
];
