<!--
	@component
	Renders one placed building. Buildings without a `model` keep the grey
	placeholder box; buildings with one load their glTF, clone it (the loader
	caches by URL and shares one scene), scale it so its height matches
	BUILDING_HEIGHT and centre it on the footprint with its base at y = 0.
	Passing `tint` turns the model into a translucent placement ghost: the
	materials are cloned, so tinting it never touches the placed instances.
-->
<script lang="ts">
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { untrack } from 'svelte';
	import {
		Box3,
		Mesh,
		Vector3,
		type Material,
		type MeshStandardMaterial,
		type Object3D,
	} from 'three';
	import { BUILDING_HEIGHT, type BuildingDef } from '../lib/balance';
	import { getBuildingCenter, rotateFootprint, type Cell, type Rotation } from '../lib/placement';

	let {
		def,
		anchor,
		rotation = 0,
		tint,
		opacity = 1,
	}: {
		def: BuildingDef;
		anchor: Cell;
		/** Quarter turns clockwise from the def's authored orientation. */
		rotation?: Rotation;
		/** Ghost colour: clones the materials, tints them, and makes them translucent. */
		tint?: string;
		/** Ghost alpha; ignored when `tint` is undefined. */
		opacity?: number;
	} = $props();

	const footprint = $derived(rotateFootprint(def.footprint, rotation));
	const center = $derived(getBuildingCenter(anchor, footprint));
	const yaw = $derived((rotation * Math.PI) / 2);

	// The loader is cached by URL and read once per instance; the prop is fixed
	// for the lifetime of a placed building.
	const loader = untrack(() =>
		def.model === undefined ? undefined : useGltf(def.model),
	);

	let model = $state.raw<Object3D>();
	/** Material clones made for the ghost; the cached geometries/materials stay shared. */
	const ghostMaterials: Material[] = [];

	$effect(() => {
		if (loader === undefined) return;

		let cancelled = false;
		void loader.promise
			.then((gltf) => {
				if (!cancelled) model = prepareModel(gltf.scene);
			})
			.catch(() => {
				// The loader already reports the failure; leave the model hidden.
			});

		return () => {
			cancelled = true;
		};
	});

	/** Keeps the ghost colour in sync without rebuilding the clone. */
	$effect(() => {
		const colour = tint;
		const alpha = opacity;
		const target = model;
		if (target === undefined || colour === undefined) return;

		target.traverse((object) => {
			if (!(object instanceof Mesh)) return;
			for (const material of toMaterials(object)) {
				(material as MeshStandardMaterial).color?.set(colour);
				material.opacity = alpha;
			}
		});
	});

	$effect(() => {
		return () => {
			for (const material of ghostMaterials) material.dispose();
		};
	});

	function toMaterials(mesh: Mesh): Material[] {
		return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
	}

	/** Clone the cached scene, scaled to BUILDING_HEIGHT and resting at y = 0. */
	function prepareModel(scene: Object3D): Object3D {
		const clone = scene.clone(true);

		if (tint !== undefined) {
			clone.traverse((object) => {
				if (!(object instanceof Mesh)) return;

				const copies = toMaterials(object).map((material) => {
					const copy = material.clone();
					copy.transparent = true;
					copy.depthWrite = false;
					copy.opacity = opacity;
					ghostMaterials.push(copy);
					return copy;
				});

				object.material = Array.isArray(object.material) ? copies : copies[0];
			});
		}

		const box = new Box3().setFromObject(clone);
		const size = box.getSize(new Vector3());
		const offset = box.getCenter(new Vector3());
		const scale = size.y > 0 ? BUILDING_HEIGHT / size.y : 1;

		clone.scale.setScalar(scale);
		clone.position.set(-offset.x * scale, -box.min.y * scale, -offset.z * scale);
		return clone;
	}
</script>

{#if model !== undefined}
	<T.Group position={[center[0], 0, center[2]]} rotation={[0, yaw, 0]}>
		<!-- Cloned meshes share the cached geometries/materials, so never dispose them. -->
		<T is={model} dispose={false} />
	</T.Group>
{:else}
	<!--
		Placeholder: permanent for a def without a model, temporary while a model
		loads, and the fallback if loading fails, so a building is never invisible.
	-->
	<T.Mesh position={center}>
		<T.BoxGeometry args={[footprint[0], BUILDING_HEIGHT, footprint[1]]} />
		<T.MeshStandardMaterial
			color={tint ?? '#9aa4b5'}
			transparent={tint !== undefined}
			opacity={tint !== undefined ? opacity : 1}
			depthWrite={tint === undefined}
		/>
	</T.Mesh>
{/if}
