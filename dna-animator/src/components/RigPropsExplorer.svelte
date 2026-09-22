<script lang="ts">
	import { appState } from '../AppState.svelte';
	import { type RigObject, type RigEnum, type RigVector2, SelectedNodeType } from '../DNARig';
	import GroupEditor from './PropertiesExplorerComponents/GroupEditor.svelte';
	import Boolean from './PropertiesExplorerComponents/Boolean.svelte';
	import Color from './PropertiesExplorerComponents/Color.svelte';
	import Enum from './PropertiesExplorerComponents/Enum.svelte';
	import EnumEditor from './PropertiesExplorerComponents/EnumEditor.svelte';
	import Group from './PropertiesExplorerComponents/Group.svelte';
	import Number from './PropertiesExplorerComponents/Number.svelte';
	import Section from './PropertiesExplorerComponents/Section.svelte';
	import Text from './PropertiesExplorerComponents/Text.svelte';
	import VectorThree from './PropertiesExplorerComponents/VectorThree.svelte';
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
			<Boolean label="Disable All Debug Options" bind:value={rigObject.disable_all_debug_options} />
			<Boolean label="Hide All Elements" bind:value={rigObject.hide_all_elements} />
			<Section label="Base Offsets">
				<VectorTwo label="Starting Position" bind:value={rigObject.base.starting_position} />
				<Number label="Starting Rotation" bind:value={rigObject.base.starting_rotation} />
				<VectorTwo label="Starting Scale" bind:value={rigObject.base.starting_scale} />
			</Section>
			<Section label="Rig Transforms">
				<VectorTwo label="Position" bind:value={rigObject.position} />
				<Number label="Rotation" bind:value={rigObject.rotation} />
				<VectorTwo label="Scale" bind:value={rigObject.scale} />
			</Section>
			<Section label="Rig Groups">
				<GroupEditor bind:value={rigObject.groups} />
			</Section>
			<Section label="Rig Enums">
				{#each rigObject.enums as rigEnum}
					<EnumEditor value={rigEnum} />
				{/each}
			</Section>
		{:else if selectedNode?.type === SelectedNodeType.Group} 
			{let currentGroup = $derived((selectedNode && selectedNode.index !== undefined) ? rigObject.groups[selectedNode.index] : null)}
			{#if currentGroup}
				<Text label="Group ID" bind:value={currentGroup.id} />
				<Boolean label="Node Expanded" bind:value={currentGroup.expanded} />
				<Boolean label="Group Visible" bind:value={currentGroup.visible} />
			{/if}
		{:else if selectedNode?.type === SelectedNodeType.Element}
			<!--Element/Shape Node-->
			{let currentElement = $derived(
				(selectedNode && selectedNode.index !== undefined)
					? rigObject.elements[selectedNode.index]
					: null
			)}
			{#if currentElement}
				<Text label="Element Name" bind:value={currentElement.name} />
				<Group label="Element Group" bind:value={(currentElement.group_id!)} rigGroups={rigObject.groups} />
				<Boolean label="Node Expanded" bind:value={currentElement.expanded} />
				<Boolean label="Visible" bind:value={currentElement.visible} />
				<Boolean label="Debug: Show Position Point" bind:value={currentElement.show_position_point} />
				<Boolean label="Debug: Show Origin Point" bind:value={currentElement.show_origin_point} />
				<Section label="Element Offsets">
					<VectorTwo label="Starting Position" bind:value={currentElement.offsets.position} />
					<Number label="Starting Rotation" bind:value={currentElement.offsets.rotation} />
					<VectorTwo label="Starting Scale" bind:value={currentElement.offsets.scale} />
					<Number label="Starting Rotation 2" bind:value={currentElement.offsets.rotation_two} />
				</Section>
				<Section label="Element Transforms">
					<VectorTwo label="Position" bind:value={currentElement.position} />
					<Number label="Rotation" bind:value={currentElement.rotation} />
					<VectorTwo label="Scale" bind:value={currentElement.scale} />
					<Number label="Rotation 2" bind:value={currentElement.rotation_two} />
					<VectorTwo label="Transform Origin" bind:value={currentElement.transform_origin} />
				</Section>
				<Boolean label="Closed Shape" bind:value={currentElement.closed} />
				<Color label="Fill Color" bind:value={currentElement.fill_color} />
				<Color label="Stroke Color" bind:value={currentElement.stroke_color} />
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
