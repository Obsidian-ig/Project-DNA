<script lang="ts">
	import { appState } from '../AppState.svelte';
	import { type RigObject, type RigEnum, type RigVector2, SelectedNodeType } from '../DNARig';
	import Boolean from './PropertiesExplorerComponents/Boolean.svelte';
	import Color from './PropertiesExplorerComponents/Color.svelte';
	import Enum from './PropertiesExplorerComponents/Enum.svelte';
	import EnumEditor from './PropertiesExplorerComponents/EnumEditor.svelte';
	import Number from './PropertiesExplorerComponents/Number.svelte';
	import Section from './PropertiesExplorerComponents/Section.svelte';
	import Text from './PropertiesExplorerComponents/Text.svelte';
	import VectorTwo from './PropertiesExplorerComponents/VectorTwo.svelte';

	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let selectedNode = $derived(appState.rigPlaygroundState.selectedNode);
</script>

<div class="header">
	<h1>Properties Explorer</h1>
</div>
<div class="props-container">
	{#if rigObject}
		{#if selectedNode?.type === SelectedNodeType.Root}
			<!--Root Node-->
			<Text label="Rig Name" bind:value={rigObject.name} />
			<Number label="Rig Version" bind:value={rigObject.rig_version} />
			<Number label="Rig Structure Version" bind:value={rigObject.rig_structure_version} />
			<Boolean label="Node Expanded" bind:value={rigObject.expanded} />
			<Section label="Base Offsets">
				<VectorTwo label="Starting Position" bind:value={rigObject.base.starting_position} />
				<VectorTwo label="Starting Rotation" bind:value={rigObject.base.starting_rotation} />
				<VectorTwo label="Starting Scale" bind:value={rigObject.base.starting_scale} />
			</Section>
			<Section label="Rig Transforms">
				<VectorTwo label="Position" bind:value={rigObject.position} />
				<VectorTwo label="Rotation" bind:value={rigObject.rotation} />
				<VectorTwo label="Scale" bind:value={rigObject.scale} />
			</Section>
			<Section label="Rig Enums">
				{#each rigObject.enums as rigEnum}
					<EnumEditor label={rigEnum.id} value={rigEnum} />
				{/each}
			</Section>
		{:else if selectedNode?.type === SelectedNodeType.Element}
			<!--Element/Shape Node-->
			{let currentElement = $derived(
				selectedNode && selectedNode.index !== undefined
					? rigObject.elements[selectedNode.index]
					: null
			)}
			{#if currentElement}
				<Text label="Element Name" bind:value={currentElement.name} />
				<Boolean label="Node Expanded" bind:value={currentElement.expanded} />
				<Section label="Element Offsets">
					<VectorTwo label="Starting Position" bind:value={currentElement.offsets.position} />
					<VectorTwo label="Starting Rotation" bind:value={currentElement.offsets.rotation} />
					<VectorTwo label="Starting Scale" bind:value={currentElement.offsets.scale} />
				</Section>
				<Section label="Element Transforms">
					<VectorTwo label="Position" bind:value={currentElement.position} />
					<VectorTwo label="Rotation" bind:value={currentElement.rotation} />
					<VectorTwo label="Scale" bind:value={currentElement.scale} />
					<VectorTwo label="Transform Origin" bind:value={currentElement.transform_origin} />
				</Section>
				<Boolean label="Closed Shape" bind:value={currentElement.closed} />
				<Color label="Fill Color" bind:value={currentElement.fill_color} />
			{/if}
		{:else if selectedNode?.type === SelectedNodeType.Point}
			<!--Point Node-->
			{let currentPoint = $derived(
				selectedNode && selectedNode.index !== undefined
					? rigObject.elements.find((e) => e.name === selectedNode.name)?.points[selectedNode.index]
					: null
			)}
            {#if currentPoint}
                <VectorTwo label="Position" bind:value={currentPoint.point} />
                {let interpEnum = rigObject.enums.find(e => e.id === "interpolation_type");}
                {#if interpEnum}
                    <Enum label="Interpolation Type" bind:value={currentPoint.interpolation_type} rigEnum={interpEnum} />
                {:else}
                    <p style="color: var(--danger); margin-top: 10px;">Missing required enum 'interpolation_type' for points!</p>
                {/if}
            {/if}
		{:else}
			<!--Render Nothing-->
		{/if}
	{/if}
</div>

<style>
	.header {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--bg-dark);
		text-overflow: ellipsis;
		text-wrap: nowrap;
		user-select: none;
	}
	.props-container {
		display: flex;
		flex-direction: column;
		padding: 15px;
		padding-bottom: 100px;
		gap: 10px;
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
	}
</style>
