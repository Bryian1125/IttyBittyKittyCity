export interface BoxSpec {
	id: string;
	position: [number, number, number];
	size: [number, number, number];
	color: string;
}

export const floor: BoxSpec = {
	id: 'floor',
	position: [0, -0.1, 0],
	size: [60, 0.2, 60],
	color: '#2b2b2b',
};

export const obstacles: BoxSpec[] = [
	{
		id: 'wall-north',
		position: [0, 1.5, -12],
		size: [24, 3, 0.5],
		color: '#4a4a4a',
	},
	{
		id: 'wall-west',
		position: [-12, 1.5, 0],
		size: [0.5, 3, 24],
		color: '#4a4a4a',
	},
	{
		id: 'wall-east',
		position: [12, 1.5, 0],
		size: [0.5, 3, 24],
		color: '#4a4a4a',
	},
	{
		id: 'crate-small',
		position: [4, 0.5, 3],
		size: [1, 1, 1],
		color: '#8a8a8a',
	},
	{
		id: 'slab-wide',
		position: [-4, 0.5, -4],
		size: [4, 1, 2],
		color: '#6e6e6e',
	},
	{
		id: 'pillar-tall',
		position: [6, 2, -6],
		size: [1.5, 4, 1.5],
		color: '#7c7c7c',
	},
	{
		id: 'block-low',
		position: [-8, 0.25, 5],
		size: [3, 0.5, 3],
		color: '#5d5d5d',
	},
	{
		id: 'wall-segment',
		position: [2, 2, 9],
		size: [8, 4, 0.5],
		color: '#4a4a4a',
	},
];
