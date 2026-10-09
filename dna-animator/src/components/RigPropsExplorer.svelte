<script lang="ts">
	import { appState } from '../AppState.svelte';
	import {
		SelectedNodeType,
		RigPointInterpolationTypeEnum,
		RigLayeringOrderNodeType,

		RigPointInterpolationType

	} from '../DNARig';
	import GroupEditor from './PropertiesExplorerComponents/GroupEditor.svelte';
	import Boolean from './PropertiesExplorerComponents/Boolean.svelte';
	import Color from './PropertiesExplorerComponents/Color.svelte';
	import Enum from './PropertiesExplorerComponents/Enum.svelte';
	import EnumEditor from './PropertiesExplorerComponents/EnumEditor.svelte';
	import Group from './PropertiesExplorerComponents/Group.svelte';
	import Number from './PropertiesExplorerComponents/Number.svelte';
	import Section from './PropertiesExplorerComponents/Section.svelte';
	import Text from './PropertiesExplorerComponents/Text.svelte';
	import VectorTwo from './PropertiesExplorerComponents/VectorTwo.svelte';

	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let selectedNode = $derived(appState.rigPlaygroundState.selectedNode);
	let expandedNodes = $derived(appState.rigPlaygroundState.expandedNodes);
	let nodeExpanded = $state(false);
	let nameErrors: string[] = $state([]);
	let versionErrors: string[] = $state([]);
	let structureErrors: string[] = $state([]);

	$effect(() => {
		nodeExpanded =
			expandedNodes?.find(
				(n) =>
					n.type === selectedNode?.type &&
					n.name === selectedNode?.name &&
					n.index === selectedNode?.index
			) != null;
	});
	$effect(() => {
		let expandedNodeExists = expandedNodes?.find(
			(n) =>
				n.type === selectedNode?.type &&
				n.name === selectedNode?.name &&
				n.index === selectedNode?.index
		);
		if (!nodeExpanded && expandedNodeExists) {
			expandedNodes?.slice().forEach((n, index) => {
				if (
					n.type === selectedNode?.type &&
					n.name === selectedNode?.name &&
					n.index === selectedNode?.index
				) {
					expandedNodes?.splice(index, 1);
				}
			});
		}
		if (nodeExpanded && !expandedNodeExists && selectedNode) {
			expandedNodes?.push(selectedNode);
		}
	});
</script>

<div class="header">
	<h1>Properties Explorer</h1>
</div>
<div class="props-container">
	{#if rigObject}
		{#if selectedNode?.type === SelectedNodeType.Root}
			<!--Root Node-->
			<Text
				label="Rig Name"
				valueToShow={rigObject.name}
				onValueChanged={(value: string) => {
					if (value.length <= 0) {
						if (!nameErrors.includes('Rig Name Cannot Be Empty!'))
							nameErrors.push('Rig Name Cannot Be Empty!');
						return;
					}
					if (nameErrors.includes('Rig Name Cannot Be Empty!')) nameErrors.pop();
					let expandedRootNode = appState.rigPlaygroundState.expandedNodes?.find(
						(n) => n.type === SelectedNodeType.Root
					);
					if (expandedRootNode) expandedRootNode.name = value;
					rigObject.name = value;
				}}
				currentErrors={nameErrors}
			/>
			<Text label="Rig Author" valueToShow={rigObject.author} onValueChanged={(value: string) => {
				rigObject.author = value;
			}} currentErrors={[]} />
			<Text label="Rig Author Link" valueToShow={rigObject.author_link} onValueChanged={(value: string) => {
				rigObject.author_link = value;
			}} currentErrors={[]} />
			<Text
				label="Rig Version"
				valueToShow={rigObject.rig_version}
				onValueChanged={(value: string) => {
					if (value.length <= 0) return;
					rigObject.rig_version = value;
				}}
				currentErrors={versionErrors}
			/>
			<Text
				label="Rig Structure Version"
				valueToShow={rigObject.rig_structure_version}
				onValueChanged={(value: string) => {
					if (value.length <= 0) return;
					rigObject.rig_structure_version = value;
				}}
				currentErrors={structureErrors}
			/>
			<Boolean label="Node Expanded" bind:value={nodeExpanded} />
			<Boolean
				label="Disable All Debug Options"
				bind:value={appState.rigPlaygroundState.disabledAllDebugOptions}
			/>
			<Boolean label="Hide All Elements" bind:value={appState.rigPlaygroundState.hideAllElements} />
			<Boolean label="Hide All Groups" bind:value={appState.rigPlaygroundState.hideAllGroups} />
			<Section label="Base Offsets">
				<VectorTwo label="Starting Position" bind:value={rigObject.offsets.position} />
				<Number label="Starting Rotation" bind:value={rigObject.offsets.rotation} />
				<VectorTwo label="Starting Scale" bind:value={rigObject.offsets.scale} />
			</Section>
			<Section label="Rig Transforms">
				<VectorTwo label="Position" bind:value={rigObject.transforms.position} />
				<Number label="Rotation" bind:value={rigObject.transforms.rotation} />
				<VectorTwo label="Scale" bind:value={rigObject.transforms.scale} />
			</Section>
			<Section label="Rig Groups">
				<GroupEditor bind:value={rigObject.groups} />
			</Section>
			<Section label="Rig State Enum">
				<EnumEditor value={rigObject.state_enum} />
			</Section>
		{:else if selectedNode?.type === SelectedNodeType.Group}
			{let currentGroup = $derived(
				selectedNode && selectedNode.index !== undefined
					? rigObject.groups[selectedNode.index]
					: null
			)}
			{#if currentGroup}
				<Text
					label="Group ID"
					valueToShow={currentGroup.id}
					onValueChanged={(value: string) => {
						const nameAlreadyInUseErrorText = 'A Group With That ID Already Exists!';
						const nameEmpyErrorText = 'Group Names Cannot Be Empty!';
						if (!rigObject) return;
						if (value.length <= 0) {
							if (!nameErrors.includes(nameEmpyErrorText)) nameErrors.push(nameEmpyErrorText);
							return;
						}
						if (nameErrors.includes(nameEmpyErrorText))
							nameErrors.splice(
								nameErrors.findIndex((e) => e === nameEmpyErrorText),
								1
							);
						//if (currentGroup.id === value) return;
						if (rigObject.groups.some((g) => g.id === value) && currentGroup.id != value) {
							console.log('Value: ' + value + ', Group: ' + currentGroup.id);
							if (!nameErrors.includes(nameAlreadyInUseErrorText))
								nameErrors.push(nameAlreadyInUseErrorText);
							return;
						}
						if (nameErrors.includes(nameAlreadyInUseErrorText))
							nameErrors.splice(
								nameErrors.findIndex((e) => e === nameAlreadyInUseErrorText),
								1
							);
						let expandedNode = appState.rigPlaygroundState.expandedNodes?.find(
							(n) => n.name === currentGroup.id && n.type === SelectedNodeType.Group
						);
						if (expandedNode) expandedNode.name = value;
						let layerNode = rigObject.layering_order.find(
							(n) => n.id === currentGroup.id && n.type === RigLayeringOrderNodeType.Group
						);
						if (layerNode) layerNode.id = value;
						rigObject.elements.forEach((element) => {
							if (element.group_id === currentGroup.id) element.group_id = value;
						});
						selectedNode.name = value;
						currentGroup.id = value;
					}}
					currentErrors={nameErrors}
				/>
				<Boolean label="Node Expanded" bind:value={nodeExpanded} />
				<Boolean label="Group Visible" bind:value={currentGroup.visible} />
				<Section label="Offsets">
					<VectorTwo label="Position" bind:value={currentGroup.offsets.position} />
					<Number label="Rotation" bind:value={currentGroup.offsets.rotation} />
					<VectorTwo label="Scale" bind:value={currentGroup.offsets.scale} />
					<Number label="Rotation Two" bind:value={currentGroup.offsets.rotation_two} />
					<VectorTwo label="Transform Origin" bind:value={currentGroup.offsets.transform_origin} />
				</Section>
				<Section label="Transforms">
					<VectorTwo label="Position" bind:value={currentGroup.transforms.position} />
					<Number label="Rotation" bind:value={currentGroup.transforms.rotation} />
					<VectorTwo label="Scale" bind:value={currentGroup.transforms.scale} />
					<Number label="Rotation Two" bind:value={currentGroup.transforms.rotation_two} />
				</Section>
			{/if}
		{:else if selectedNode?.type === SelectedNodeType.Element}
			<!--Element/Shape Node-->
			{let currentElement = $derived(
				selectedNode ? rigObject.elements.find((e) => e.name === selectedNode.name) : null
			)}
			{#if currentElement}
				<Text
					label="Element Name"
					valueToShow={currentElement.name}
					onValueChanged={(value: string) => {
						const nameAlreadyInUseErrorText = 'An Element With That ID Already Exists!';
						const nameEmpyErrorText = 'Element Names Cannot Be Empty!';
						if (!rigObject) return;
						if (value.length <= 0) {
							if (!nameErrors.includes(nameEmpyErrorText)) nameErrors.push(nameEmpyErrorText);
							return;
						}
						if (nameErrors.includes(nameEmpyErrorText))
							nameErrors.splice(
								nameErrors.findIndex((e) => e === nameEmpyErrorText),
								1
							);
						if (rigObject.elements.some((e) => e.name === value)) {
							if (!nameErrors.includes(nameAlreadyInUseErrorText))
								nameErrors.push(nameAlreadyInUseErrorText);
							return;
						}
						if (nameErrors.includes(nameAlreadyInUseErrorText))
							nameErrors.splice(
								nameErrors.findIndex((e) => e === nameAlreadyInUseErrorText),
								1
							);
						let expandedNode = appState.rigPlaygroundState.expandedNodes?.find(
							(n) => n.name === currentElement.name && n.type === SelectedNodeType.Element
						);
						if (expandedNode) expandedNode.name = value;
						let layerNode = rigObject.layering_order.find(
							(n) => n.id === currentElement.name && n.type === RigLayeringOrderNodeType.Element
						);
						if (layerNode) layerNode.id = value;
						currentElement.name = value;
						selectedNode.name = value;
					}}
					currentErrors={nameErrors}
				/>
				<Group
					label="Element Group"
					bind:value={currentElement.group_id!}
					rigGroups={rigObject.groups}
				/>
				<Boolean label="Node Expanded" bind:value={nodeExpanded} />
				<Boolean label="Visible" bind:value={currentElement.visible} />
				<Boolean
					label="Debug: Show Position Point"
					bind:value={currentElement.show_position_point}
				/>
				<Color label="Position Point Color" bind:value={currentElement.position_point_color} />
				<Boolean label="Debug: Show Origin Point" bind:value={currentElement.show_origin_point} />
				<Color label="Origin Point Color" bind:value={currentElement.origin_point_color} />
				<Section label="Offsets">
					<VectorTwo label="Starting Position" bind:value={currentElement.offsets.position} />
					<Number label="Starting Rotation" bind:value={currentElement.offsets.rotation} />
					<VectorTwo label="Starting Scale" bind:value={currentElement.offsets.scale} />
					<Number label="Starting Rotation 2" bind:value={currentElement.offsets.rotation_two} />
					<VectorTwo
						label="Transform Origin"
						bind:value={currentElement.offsets.transform_origin}
					/>
				</Section>
				<Section label="Transforms">
					<VectorTwo label="Position" bind:value={currentElement.transforms.position} />
					<Number label="Rotation" bind:value={currentElement.transforms.rotation} />
					<VectorTwo label="Scale" bind:value={currentElement.transforms.scale} />
					<Number label="Rotation 2" bind:value={currentElement.transforms.rotation_two} />
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
				<Enum
					label="Interpolation Type"
					bind:value={currentPoint.interpolation_type}
					rigEnum={RigPointInterpolationTypeEnum}
					onValueChanged={(value: string) => {
						let hasControls = (currentPoint.controls != undefined);
						let controlsLength = hasControls ? currentPoint.controls!.length : 0;
						if (!hasControls && value === RigPointInterpolationType.Linear && controlsLength <= 0) currentPoint.controls = [];
						if ((!hasControls || controlsLength < 1) && value === RigPointInterpolationType.QuadraticBezierCurve) currentPoint.controls = [{x: 0, y: 0}];
						if ((!hasControls || controlsLength < 2) && value === RigPointInterpolationType.CubicBezierCurve) {
							if (controlsLength <= 0) currentPoint.controls = [{x: 0, y: 0}, {x: 0, y: 0}];
							if (controlsLength === 1) currentPoint.controls?.push({
								x: 0,
								y: 0
							});
						}
					}}
				/>
				<Number label="Steps" bind:value={currentPoint.steps} />
				<Boolean label="Show Control Points" bind:value={currentPoint.show_control_points} />
				<Color label="Control Points Color" bind:value={currentPoint.control_point_color} />
			{/if}
		{:else if selectedNode?.type === SelectedNodeType.ControlPoint}
			{let splitName = $derived(selectedNode.name.split('_Point_'))}
			{let elementName = $derived(splitName[0])}
			{let currentControl = $derived(
				selectedNode && selectedNode.index !== undefined
					? (rigObject.elements.find((e) => e.name === elementName)?.points?.[
							parseInt(splitName[1], 10)
						]?.controls?.[selectedNode.index] ?? null)
					: null
			)}
			{#if currentControl}
				<VectorTwo label="Position" bind:value={currentControl} />
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
