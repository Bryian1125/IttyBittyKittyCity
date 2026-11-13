<!--
	@component
	Drives the per-frame economy tick and animates Raw Mineral packets flying
	from collectors to the refineries that pull them in.
-->
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { tickEconomy, transferPackets, type TransferPacket } from '../state/economy.svelte';

	const PACKET_LIFT = 1.4;

	useTask((delta) => {
		tickEconomy(delta);
	});

	function packetPosition(packet: TransferPacket): [number, number, number] {
		const travelled = packet.progress;
		return [
			packet.from[0] + (packet.to[0] - packet.from[0]) * travelled,
			packet.from[1] +
				(packet.to[1] - packet.from[1]) * travelled +
				Math.sin(travelled * Math.PI) * PACKET_LIFT,
			packet.from[2] + (packet.to[2] - packet.from[2]) * travelled,
		];
	}
</script>

{#each transferPackets as packet (packet.id)}
	<T.Mesh position={packetPosition(packet)}>
		<T.BoxGeometry args={[0.35, 0.35, 0.35]} />
		<T.MeshStandardMaterial color="#e0b25e" />
	</T.Mesh>
{/each}
