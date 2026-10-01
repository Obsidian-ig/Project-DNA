<script lang="ts">
	import downArrowIcon from '$lib/assets/down-arrow-icon-white.png';
	import * as DNARig from '../DNARig';
	import { appState } from '../AppState.svelte';
	import { updated } from '$app/state';

	interface ContextMenuOptions {
		options: {
			label: string;
			action: () => void;
		}[];
	}

	interface RigTreeNode {
		type: DNARig.RigLayeringOrderNodeType;
		id: string;
		elements: (DNARig.RigElement | null | undefined)[];
	}

	let { rigFile }: { rigFile: File | null } = $props();
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let selectedNode = $derived(appState.rigPlaygroundState.selectedNode);
	let showContextMenu = $state(false);
	let currentContextMenuOptions: ContextMenuOptions | null = $state(null);
	let expandedNodes = $derived(appState.rigPlaygroundState.expandedNodes);
	let lastDraggingElementId = $state('');
	let rigTreeNodes: (RigTreeNode | undefined)[] | undefined = $state([]);

	$effect(() => {
		if (rigFile) {
			//console.log('Rig Tree => Received new rig!');
			async function GetFileTextAndUpdateRigObject() {
				const rigFileContent = await rigFile?.text();
				if (!rigFileContent) return;
				function ConvertRigDataIntoObject<T extends object>(data: T): DNARig.RigObject & T {
					let finishedObject: DNARig.RigObject = {
						name: (data as any)?.name ?? 'null',
						rig_version: (data as any)?.rig_version ?? 0,
						rig_structure_version: (data as any)?.rig_structure_version ?? 0,
						author: (data as any)?.author,
						author_link: (data as any)?.author_link,
						last_updated_utc: (data as any)?.last_updated_utc,
						offsets: (data as any)?.offsets ?? {
							position: (data as any)?.offsets.position ?? { x: 0.0, y: 0.0 },
							rotation: (data as any)?.offsets.rotation ?? 0,
							scale: (data as any)?.offsets.scale ?? { x: 0.0, y: 0.0 },
							rotation_two: (data as any)?.offsets.rotation_two ?? 0
						},
						transforms: {
							position: { x: 0.0, y: 0.0 },
							rotation: 0,
							scale: { x: 0.0, y: 0.0 },
							rotation_two: 0
						},
						elements: (data as any)?.elements ?? [],
						groups: (data as any)?.groups ?? [],
						layering_order: (data as any)?.layering_order ?? [],
						default_state: (data as any)?.default_state ?? null,
						state_enum: (data as any)?.state_enum ?? null,
						state_rules: (data as any)?.state_rules ?? null,
						events: (data as any)?.events ?? null,
						poses: (data as any)?.poses ?? null,
						animations: (data as any)?.animations ?? null,
						sensors: (data as any)?.sensors ?? null,
						bindings: (data as any)?.bindings ?? null
					};
					return {
						...data,
						...finishedObject
					};
				}
				const rawData = JSON.parse(rigFileContent);
				rigObject = ConvertRigDataIntoObject(rawData);
				appState.UpdateRigPlaygroundStateLoadedRig(rigObject);
			}
			GetFileTextAndUpdateRigObject();
		}

		/*Dragging Element Nodes Logic*/
		let nodesContainer = document.querySelector('.rig-tree-container');

		const initSortableList = (e: any) => {
			e.preventDefault();
			if (!rigObject || !rigTreeNodes) return;
			const draggingItem: HTMLElement = document.querySelector('.dragging') as HTMLElement;
			let isGroup = draggingItem.classList.contains('group-node');
			//console.log(draggingItem);
			let siblings = isGroup
				? ([...document.querySelectorAll('.group-node:not(.dragging)')] as HTMLElement[])
				: draggingItem.classList.contains('element-node')
					? ([
							...document.querySelectorAll(
								'.element-node:not(.dragging), .group-node:not(.dragging)'
							)
						] as HTMLElement[])
					: [];
			if (siblings.length <= 0) return;

			let draggedIndex: number = -1;
			if (isGroup)
				draggedIndex = rigTreeNodes.findIndex(
					(n) => n?.id === draggingItem.id && n.type === DNARig.RigLayeringOrderNodeType.Group
				);
			if (!isGroup)
			//this doesn't currently work because the rigTreeNodes doesn't contain all individual elements; so, it doesn't find the element that is inside a group.
				draggedIndex = rigTreeNodes.findIndex(
					(n) => n?.id === draggingItem.id && n.type === DNARig.RigLayeringOrderNodeType.Element
				);
			console.log(draggedIndex);
			if (draggedIndex === -1) return;
			

			let draggedRigObjectIndex = rigTreeNodes.findIndex(
				(n) =>
					n?.id === draggingItem.id &&
					n.type ===
						(isGroup
							? DNARig.RigLayeringOrderNodeType.Group
							: DNARig.RigLayeringOrderNodeType.Element)
			);
			if (draggedRigObjectIndex === -1) return;

			let nextTreeNode = siblings.find((sibling) => {
				const box = sibling.getBoundingClientRect();
				return e.clientY <= box.top + box.height / 2;
			});
			//console.log(nextTreeNode);
			let targetIndex = -1;
			if (!nextTreeNode) {
				targetIndex = rigTreeNodes.length;
			} else {
				let nextNodeIndex = nextTreeNode.classList.contains('group-node')
					? rigTreeNodes.findIndex(
							(n) => n?.id === nextTreeNode.id && n.type === DNARig.RigLayeringOrderNodeType.Group
						)
					: rigTreeNodes.findIndex(
							(n) => n?.id === nextTreeNode.id && n.type === DNARig.RigLayeringOrderNodeType.Element
						);
				if (nextNodeIndex === -1) {
					targetIndex = draggedRigObjectIndex;
					return;
				}
				//console.log(nextNodeIndex);
				targetIndex = nextNodeIndex;
			}
			if (
				targetIndex === draggedRigObjectIndex ||
				targetIndex < 0 ||
				targetIndex === draggedRigObjectIndex + 1
			)
				return;
			let updatedTreeNodes = [...rigTreeNodes];
			let draggedItem = updatedTreeNodes.splice(draggedRigObjectIndex, 1)[0];
			if (!draggedItem) return;
			console.log(targetIndex);
			const finalInsertIndex = draggedRigObjectIndex < targetIndex ? targetIndex - 1 : targetIndex;
			console.log(finalInsertIndex);
			updatedTreeNodes.splice(finalInsertIndex, 0, draggedItem);
			rigTreeNodes = updatedTreeNodes;
		};
		nodesContainer?.addEventListener('dragover', initSortableList);
		nodesContainer?.addEventListener('dragenter', (e) => e.preventDefault());
		/*End Dragging Element Nodes Logic*/

		/*Context Menu Logic*/
		const contextMenu = document.getElementById('rig-tree-context-menu');
		document.addEventListener('contextmenu', (e: MouseEvent) => {
			if (!rigObject) return;
			if (!(e.target instanceof HTMLElement)) {
				showContextMenu = false;
				return;
			}
			const target = e.target.closest('.context-target') as HTMLElement;
			if (!target) {
				showContextMenu = false;
				return;
			}

			function CreateNewElement(groupId: string) {
				if (!rigObject) return;
				let newElements = rigObject.elements.filter((el) => el.name.includes('New_Element_'));
				let numberToUse = 0;
				if (newElements) {
					let lastElementNumber = Number.parseInt(
						newElements?.[newElements.length - 1]?.name.split('_')?.[2]
					);
					console.log('Last Element Number: ' + lastElementNumber);
					if (lastElementNumber >= 0) {
						numberToUse = lastElementNumber + 1;
					}
				}
				let newElement = {
					name: 'New_Element_' + numberToUse.toString(),
					group_id: groupId,
					expanded: false,
					visible: true,
					show_position_point: false,
					show_origin_point: false,
					offsets: {
						position: {
							x: 0,
							y: 0
						},
						rotation: 0,
						scale: {
							x: 0,
							y: 0
						},
						rotation_two: 0,
						transform_origin: {
							x: 0,
							y: 0
						}
					},
					transforms: {
						position: {
							x: 0,
							y: 0
						},
						rotation: 0,
						scale: {
							x: 0,
							y: 0
						},
						rotation_two: 0
					},
					points: [
						{
							point: {
								x: 0,
								y: 0
							},
							interpolation_type: DNARig.RigPointInterpolationType.Linear
						}
					],
					fill_color: '#FFFFFF',
					stroke_color: '#FFFFFF',
					closed: true,
					filled: true
				};
				return newElement;
			}

			function AddPointToElement(elementName: string) {
				if (!rigObject) return;
				let element = rigObject.elements.find((el) => el.name === elementName);
				if (!element) return;
				element.points.push({
					point: {
						x: 0,
						y: 0
					},
					interpolation_type: 'Linear'
				});
			}

			if (target.classList.contains('root-node')) {
				currentContextMenuOptions = {
					options: [
						{
							label: 'Create New Element',
							action: () => {
								let element = CreateNewElement('');
								if (!rigObject || !element) return;
								rigObject.elements.push(element);
							}
						},
						{
							label: expandedNodes?.find((n) => n.type === DNARig.SelectedNodeType.Root)
								? 'Collapse Node'
								: 'Expand Node',
							action: () => {
								if (!rigObject) return;
								let exists = expandedNodes?.find((n) => n.type === DNARig.SelectedNodeType.Root);
								if (exists) {
									expandedNodes?.slice().forEach((n, index) => {
										if (n.type === DNARig.SelectedNodeType.Root && n.name === rigObject?.name) {
											expandedNodes?.splice(index, 1);
										}
									});
								}

								if (!exists) {
									expandedNodes?.push({
										name: rigObject?.name,
										type: DNARig.SelectedNodeType.Root,
										index: 0
									});
								}
							}
						}
					]
				};
			} else if (target.classList.contains('group-node')) {
				let group = rigObject.groups.find((g) => g.id === target.id);
				if (!group || !rigObject) return;
				currentContextMenuOptions = {
					options: [
						{
							label: 'Add New Element',
							action: () => {
								if (!rigObject) return;
								let newElement = CreateNewElement(group.id);
								if (!newElement) return;
								let groupElements = rigObject.elements.filter((e) => e.group_id === group.id);
								if (!groupElements) return;
								let lastElementofGroupIndex = rigObject.elements.findIndex(
									(e) => e.name === groupElements?.[groupElements.length - 1]?.name
								);
								if (!lastElementofGroupIndex && lastElementofGroupIndex != 0) return;
								rigObject.elements.splice(lastElementofGroupIndex + 1, 0, newElement);
							}
						},
						{
							label: expandedNodes?.find(
								(n) => n.type === DNARig.SelectedNodeType.Group && n.name === group.id
							)
								? 'Collapse Node'
								: 'Expand Node',
							action: () => {
								let exists = expandedNodes?.find(
									(n) => n.type === DNARig.SelectedNodeType.Group && n.name === group.id
								);
								if (exists) {
									expandedNodes?.slice().forEach((n, index) => {
										if (n.type === DNARig.SelectedNodeType.Group && n.name === group.id) {
											expandedNodes?.splice(index, 1);
										}
									});
								} else {
									expandedNodes?.push({
										name: group.id,
										type: DNARig.SelectedNodeType.Group,
										index: rigObject?.groups.findIndex((g) => g.id === group.id) ?? 0
									});
								}
							}
						},
						{
							label: group.visible ? 'Hide Group' : 'Render Group',
							action: () => {
								group.visible = !group.visible;
							}
						},
						{
							label: 'Delete Group',
							action: () => {
								if (!rigObject) return;
								rigObject.groups.splice(
									rigObject.groups.findIndex((g) => g.id === group.id),
									1
								);
							}
						}
					]
				};
			} else if (target.classList.contains('element-node')) {
				let element = rigObject.elements.find((el) => el.name === target.id);
				if (!element) return;
				currentContextMenuOptions = {
					options: [
						{
							label: 'Add New Point',
							action: () => AddPointToElement(element.name)
						},
						{
							label: 'Duplicate Element',
							action: () => {
								if (!rigObject) return;
								let clone = structuredClone($state.snapshot(element));
								clone.name = clone.name + '_Clone';
								rigObject.elements.push(clone);
							}
						},
						{
							label: expandedNodes?.find(
								(n) => n.type === DNARig.SelectedNodeType.Element && n.name === element.name
							)
								? 'Collapse Node'
								: 'Expand Node',
							action: () => {
								let exists = expandedNodes?.find(
									(n) => n.type === DNARig.SelectedNodeType.Element && n.name === element.name
								);
								if (exists) {
									expandedNodes?.slice().forEach((n, index) => {
										if (n.type === DNARig.SelectedNodeType.Element && n.name === element.name) {
											expandedNodes?.splice(index, 1);
										}
									});
								} else {
									expandedNodes?.push({
										name: element.name,
										type: DNARig.SelectedNodeType.Element,
										index: rigObject?.groups.findIndex((g) => g.id === element.name) ?? 0
									});
								}
							}
						},
						{
							label: element.visible ? 'Hide Element' : 'Render Element',
							action: () => {
								element.visible = !element.visible;
							}
						},
						{
							label: 'Delete Element',
							action: () => {
								if (!rigObject) return;
								rigObject.elements.splice(
									rigObject.elements.findIndex((el) => el.name === element.name),
									1
								);
							}
						}
					]
				};
			} else if (target.classList.contains('point-node')) {
				let parentElement = rigObject.elements.find((el) => el.name === target.dataset.elementName);
				let point = parentElement?.points?.[Number.parseInt(target.id)];
				if (!point) return;
				currentContextMenuOptions = {
					options: [
						{
							label: 'Duplicate Point',
							action: () => {
								parentElement?.points.push(point);
							}
						},
						{
							label: 'Delete Point',
							action: () => {
								parentElement?.points.splice(
									parentElement?.points.findIndex((p) => p === point),
									1
								);
							}
						}
					]
				};
			} else if (target.classList.contains('rig-tree-container')) {
			} else {
				console.log('Not a valid context target!');
				return;
			}

			showContextMenu = true;
			if (!contextMenu) {
				console.log('No context menu found');
				return;
			}
			contextMenu.style.left = e.x + 'px';
			contextMenu.style.top = e.y + 'px';
		});

		function FormatLayeringOrder(element: {
			type: DNARig.RigLayeringOrderNodeType;
			id: string;
		}): RigTreeNode | undefined {
			if (!rigObject) return;
			if (element.type === DNARig.RigLayeringOrderNodeType.Group) {
				return {
					type: DNARig.RigLayeringOrderNodeType.Group,
					id: element.id,
					elements: rigObject.elements.filter((e) => e.group_id === element.id)
				};
			} else if (element.type === DNARig.RigLayeringOrderNodeType.Element) {
				return {
					type: DNARig.RigLayeringOrderNodeType.Element,
					id: element.id,
					elements: [rigObject.elements.find((e) => e.name === element.id)]
				};
			}
		}

		rigTreeNodes = rigObject?.layering_order.map(FormatLayeringOrder);
	});

	$effect(() => {
		appState.UpdateRigPlaygroundStateSelectedNode(selectedNode);
	});
</script>

<div class="header">
	<h1>Rig Tree</h1>
</div>
{#if rigObject}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="rig-tree-container"
		onclick={() => {
			selectedNode = null;
		}}
	>
		<div
			class="rig-node root-node context-target {selectedNode?.type === DNARig.SelectedNodeType.Root
				? 'selected'
				: ''}"
		>
			<button
				class="expand-button"
				onclick={(e) => {
					e.stopPropagation();
					if (!rigObject) return;
					let exists = expandedNodes?.find(
						(n) => n.type === DNARig.SelectedNodeType.Root && n.name === rigObject?.name
					);
					if (exists) {
						expandedNodes?.slice().forEach((n, index) => {
							if (n.type === DNARig.SelectedNodeType.Root && n.name === rigObject?.name) {
								expandedNodes?.splice(index, 1);
							}
						});
					} else {
						expandedNodes?.push({
							name: rigObject.name,
							type: DNARig.SelectedNodeType.Root,
							index: 0
						});
					}
				}}
			>
				<img
					class="expand-arrow-icon {expandedNodes?.find(
						(n) => n.type === DNARig.SelectedNodeType.Root && n.name === rigObject?.name
					)
						? 'expanded'
						: ''}"
					src={downArrowIcon}
					alt="Expand/Collapse Arrow"
				/>
			</button>
			<button
				class="rig-node-select-button"
				onclick={(e) => {
					e.stopPropagation();
					if (rigObject)
						selectedNode = { name: rigObject.name, type: DNARig.SelectedNodeType.Root, index: 0 };
				}}>{rigObject?.name}</button
			>
		</div>

		{#if expandedNodes?.find((n) => n.type === DNARig.SelectedNodeType.Root)}
			<!--Root Node is Expanded-->
			{#each rigTreeNodes as node, nodeIndex (node?.id)}
				{#if node}
					{#if node.type === DNARig.RigLayeringOrderNodeType.Group}
						{let group = rigObject.groups.find((g) => g.id === node.id)}
						{let groupIndex = rigObject.groups.findIndex((g) => g.id === group?.id)}
						{#if group && groupIndex != null && groupIndex != undefined}
							<div
								class="rig-node first-node group-node context-target {selectedNode?.type ===
									DNARig.SelectedNodeType.Group &&
								selectedNode?.name === group.id &&
								selectedNode?.index === groupIndex
									? 'selected'
									: ''} {group.id === lastDraggingElementId ? 'dragging' : ''}"
								id={group.id}
								draggable="true"
								ondragstart={(e) => {
									let target = e.currentTarget;
									setTimeout(() => {
										if (target instanceof HTMLElement) {
											target.classList.add('dragging');
										}
									}, 0);
								}}
								ondragend={(e) => {
									let target = e.currentTarget;
									if (target instanceof HTMLElement) {
										console.log('dragended');
										target.classList.remove('dragging');
										lastDraggingElementId = '';
									}
								}}
							>
								<!--Group Element-->
								<button
									class="expand-button"
									onclick={(e) => {
										e.stopPropagation();
										let exists = expandedNodes?.find(
											(n) => n.type === DNARig.SelectedNodeType.Group && n.name === group.id
										);
										if (exists) {
											expandedNodes?.slice().forEach((n, index) => {
												if (n.type === DNARig.SelectedNodeType.Group && n.name === group.id) {
													expandedNodes?.splice(index, 1);
												}
											});
										} else {
											expandedNodes?.push({
												name: group.id,
												type: DNARig.SelectedNodeType.Group,
												index: groupIndex
											});
										}
									}}
								>
									<img
										class="expand-arrow-icon {expandedNodes?.find(
											(n) => n.type === DNARig.SelectedNodeType.Group && n.name === group.id
										)
											? 'expanded'
											: ''}"
										src={downArrowIcon}
										alt="Expand/Collapse Arrow"
									/>
								</button>
								<button
									class="rig-node-select-button"
									onclick={(e) => {
										e.stopPropagation();
										if (rigObject)
											selectedNode = {
												name: group.id,
												type: DNARig.SelectedNodeType.Group,
												index: groupIndex
											};
									}}>{group.id}</button
								>
							</div>
						{/if}
						{#if expandedNodes.find((n) => n.name === group?.id && n.type === DNARig.SelectedNodeType.Group)}
							<!--group is expanded, should loop through its elements-->
							{#each node.elements as element (element?.name)}
								{#if element}
									{@render ElementNode(
										true,
										element,
										rigObject.elements.findIndex((e) => e.name === element.name)
									)}
								{/if}
							{/each}
						{/if}
					{:else if node.type === DNARig.RigLayeringOrderNodeType.Element}
						{let element = node.elements?.[0]}
						{#if element}
							{@render ElementNode(
								true,
								element,
								rigObject.elements.findIndex((e) => e.name === element.name)
							)}
						{/if}
					{/if}
				{/if}
			{/each}
		{/if}
	</div>
{/if}

{#snippet ElementNode(inGroup: boolean, element: DNARig.RigElement, elementIndex: number)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="rig-node {inGroup
			? 'second-node'
			: 'first-node'} element-node context-target {selectedNode?.type ===
			DNARig.SelectedNodeType.Element && selectedNode.name === element.name
			? 'selected'
			: ''} {element.name === lastDraggingElementId ? 'dragging' : ''}"
		id={element.name}
		draggable="true"
		ondragstart={(e) => {
			let target = e.currentTarget;
			setTimeout(() => {
				if (target instanceof HTMLElement) {
					target.classList.add('dragging');
				}
			}, 0);
		}}
		ondragend={(e) => {
			let target = e.currentTarget;
			if (target instanceof HTMLElement) {
				console.log('dragended');
				target.classList.remove('dragging');
				lastDraggingElementId = '';
			}
		}}
	>
		<button
			class="expand-button"
			onclick={(e) => {
				e.stopPropagation();
				let exists = expandedNodes?.find(
					(n) => n.type === DNARig.SelectedNodeType.Element && n.name === element.name
				);
				if (exists) {
					expandedNodes?.slice().forEach((n, index) => {
						if (n.type === DNARig.SelectedNodeType.Element && n.name === element.name) {
							expandedNodes?.splice(index, 1);
						}
					});
				} else {
					expandedNodes?.push({
						name: element.name,
						type: DNARig.SelectedNodeType.Element,
						index: elementIndex
					});
				}
			}}
		>
			<img
				class="expand-arrow-icon {expandedNodes?.find(
					(n) => n.type === DNARig.SelectedNodeType.Element && n.name === element.name
				)
					? 'expanded'
					: ''}"
				src={downArrowIcon}
				alt="Expand/Collapse Arrow"
			/>
		</button>
		<button
			class="rig-node-select-button"
			onclick={(e) => {
				e.stopPropagation();
				if (rigObject)
					selectedNode = {
						name: element.name,
						type: DNARig.SelectedNodeType.Element,
						index: elementIndex
					};
			}}>{element.name}</button
		>
	</div>
	{#if expandedNodes?.find((n) => n.name === element.name && n.type === DNARig.SelectedNodeType.Element)}
		{#each element.points as point, pointIndex (point.point)}
			<div
				class="rig-node {inGroup
					? 'third-node'
					: 'second-node'} point-node context-target {selectedNode?.type ===
					DNARig.SelectedNodeType.Point &&
				selectedNode.index === pointIndex &&
				selectedNode.name === element.name
					? 'selected'
					: ''}"
				id={pointIndex.toString()}
				data-element-name={element.name}
			>
				<button
					class="rig-node-select-button"
					onclick={(e) => {
						e.stopPropagation();
						if (rigObject)
							selectedNode = {
								name: element.name,
								type: DNARig.SelectedNodeType.Point,
								index: pointIndex
							};
					}}>Point: {pointIndex}</button
				>
			</div>
		{/each}
	{/if}
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="context-menu-container {showContextMenu ? 'show' : ''}"
	aria-label="Close Context Menu"
	onclick={() => {
		showContextMenu = false;
	}}
>
	<ul class="context-menu" id="rig-tree-context-menu">
		{#each currentContextMenuOptions?.options as option}
			<li class="context-item">
				<button class="context-item-button" onclick={() => option.action()}>{option.label}</button>
			</li>
		{/each}
	</ul>
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

	.rig-tree-container {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		padding-left: 15px;
		padding-top: 5px;
		height: 100%;
		overflow: auto;
	}

	.rig-node {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		padding-left: 5px;
		text-wrap: nowrap;

		&:hover {
			background-color: var(--border-muted);
		}

		&.selected {
			outline-style: solid;
			outline-width: var(--outline-width);
			outline-color: var(--secondary);
		}

		.expand-button {
			cursor: pointer;
			padding: 5px;

			.expand-arrow-icon {
				min-width: 15px;
				width: 15px;
				min-height: 10px;
				height: 10px;
				transition: ease-out 0.06s;
				transform: rotate(-90deg);
				filter: var(--img-filter);

				&.expanded {
					transform: none;
				}
			}
		}

		.rig-node-select-button {
			width: 100%;
			display: flex;
		}
	}

	.first-node {
		margin-left: 20px;
		margin-top: 3px;
	}

	.second-node {
		margin-left: 70px;
		margin-top: 3px;
	}

	.third-node {
		margin-left: 120px;
		margin-top: 3px;
	}

	.context-menu-container {
		position: fixed;
		min-width: 100vw;
		min-height: 100vh;
		display: none;
		z-index: 3;

		&.show {
			display: block;
			top: 0;
			left: 0;
		}

		.context-menu {
			position: fixed;
			z-index: 3;
			display: flex;
			flex-direction: column;
			width: 200px;
			padding: 10px;
			border-radius: 12px;
			background-color: var(--secondary);

			li {
				padding-left: 5px;
				position: relative;
				z-index: 4 !important;
				cursor: pointer;
				color: var(--text);
				&:hover {
					backdrop-filter: brightness(0.9);
					border-radius: 8px;
				}
			}
		}
	}
</style>
