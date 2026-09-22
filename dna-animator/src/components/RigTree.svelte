<script lang="ts">
	import downArrowIcon from '$lib/assets/down-arrow-icon-white.png';
	import * as DNARig from '../DNARig';
	import { appState } from '../AppState.svelte';

	interface ContextMenuOptions {
		options: {
			label: string;
			action: () => void;
		}[];
	}

	let { rigFile }: { rigFile: File | null } = $props();
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let selectedNode = $derived(appState.rigPlaygroundState.selectedNode);
	let showContextMenu = $state(false);
	let currentContextMenuOptions: ContextMenuOptions | null = $state(null);

	$effect(() => {
		if (rigFile) {
			//console.log('Rig Tree => Received new rig!');
			async function GetFileTextAndUpdateRigObject() {
				const rigFileContent = await rigFile?.text();
				if (!rigFileContent) return;
				function ConvertRigDataIntoObject<T extends object>(data: T): DNARig.RigObject & T {
					let finishedObject: DNARig.RigObject = {
						name: (data as any)?.name ?? 'null',
						expanded: (data as any)?.expanded,
						disable_all_debug_options: false,
						hide_all_elements: false,
						rig_version: (data as any)?.rig_version ?? 0,
						rig_structure_version: (data as any)?.rig_structure_version ?? 0,
						author: (data as any)?.author,
						author_link: (data as any)?.author_link,
						last_updated_utc: (data as any)?.last_updated_utc,
						base: (data as any)?.base ?? {
							starting_position: { x: 0.0, y: 0.0 },
							starting_rotation: { x: 0.0, y: 0.0 },
							starting_scale: { x: 0.0, y: 0.0 }
						},
						position: (data as any)?.position ?? { x: 0.0, y: 0.0 },
						rotation: (data as any)?.rotation ?? { x: 0.0, y: 0.0 },
						scale: (data as any)?.scale ?? { x: 0.0, y: 0.0 },
						elements: (data as any)?.elements ?? [],
						groups: (data as any)?.groups ?? [],
						enums: (data as any)?.enums ?? []
					};
					return {
						...data,
						...finishedObject
					};
				}
				const rawData = JSON.parse(rigFileContent);
				rigObject = ConvertRigDataIntoObject(rawData);
				console.log(rigObject);
				appState.UpdateRigPlaygroundStateLoadedRig(rigObject);
			}
			GetFileTextAndUpdateRigObject();
		}

		/*Dragging Element Nodes Logic*/
		let nodesContainer = document.querySelector('.rig-tree-container');

		const initSortableList = (e: any) => {
			e.preventDefault();
			const draggingItem: HTMLElement = document.querySelector('.dragging') as HTMLElement;
			//console.log(draggingItem);
			let siblings = [
				...document.querySelectorAll('.element-node:not(.dragging)')
			] as HTMLElement[];
			let nextSibling = siblings.find((sibling) => {
				return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
			});
			if (!nextSibling) return;

			let draggedElementIndex = rigObject?.elements.findIndex((el) => el.name === draggingItem.id);
			if (draggedElementIndex === undefined || draggedElementIndex === -1) return;
			let draggedElement = rigObject?.elements.splice(draggedElementIndex, 1);
			if (!draggedElement) return;
			let nextSiblingElementIndex = rigObject?.elements.findIndex(
				(el) => el.name === nextSibling.id
			);
			if (nextSiblingElementIndex === undefined || nextSiblingElementIndex === -1) return;
			if (draggedElementIndex < nextSiblingElementIndex) nextSiblingElementIndex--;
			rigObject?.elements.splice(nextSiblingElementIndex, 0, draggedElement[0]);
			let draggedElementObject = rigObject?.elements.find(e => e.name === draggedElement[0]?.name);
			if (!draggedElementObject) return;
			let siblingElementObject = rigObject?.elements.find(e => e.name === nextSibling.id);
			if (!siblingElementObject) return;
			draggedElementObject.group_id = siblingElementObject.group_id;
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
						rotation_two: 0
					},
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
					},
					points: [
						{
							point: {
								x: 0,
								y: 0
							},
							interpolation_type: DNARig.RigPath2InterpolationType.Linear
						}
					],
					fill_color: '#FFFFFF',
					stroke_color: '#FFFFFF',
					closed: true,
					filled: true
				};
				//rigObject.elements.push(newElement);
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
								let element = CreateNewElement("");
								if (!rigObject || !element) return;
								rigObject.elements.push(element);
							}
						},
						{
							label: rigObject.expanded ? 'Collapse Node' : 'Expand Node',
							action: () => {
								if (!rigObject) return;
								rigObject.expanded = !rigObject.expanded;
							}
						}
					]
				};
			} else if (target.classList.contains('group-node')) {
				let group = rigObject.groups.find(g => g.id === target.id);
				if (!group || !rigObject) return;
				currentContextMenuOptions = {
					options: [
						{
							label: 'Add New Element',
							action: () => {
								if (!rigObject) return;
								let newElement = CreateNewElement(group.id);
								if (!newElement) return;
								let groupElements =rigObject.elements.filter(e => e.group_id === group.id);
								if (!groupElements) return;
								let lastElementofGroupIndex = rigObject.elements.findIndex(e => e.name === groupElements?.[groupElements.length - 1]?.name);
								console.log("Last Group Element Index: " + rigObject.elements.findIndex(e => e.name === groupElements?.[groupElements.length - 1]?.name));
								if (!lastElementofGroupIndex && lastElementofGroupIndex != 0) return;
								console.log('test');
								rigObject.elements.splice(lastElementofGroupIndex + 1, 0, newElement);
							}
						}, 
						{
							label: (group.expanded ? 'Collapse Node' : 'Expand Node'),
							action: () => {group.expanded = !group.expanded}
						},
						{
							label: (group.visible ? 'Hide Group' : 'Render Group'),
							action: () => {group.visible = !group.visible}
						},
						{
							label: 'Delete Group',
							action: () => {
								if (!rigObject) return;
								rigObject.groups.splice(rigObject.groups.findIndex(g => g.id === group.id), 1);
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
							label: (element.expanded ? 'Collapse Node' : 'Expand Node'),
							action: () => {element.expanded = !element.expanded;}
						},
						{
							label: (element.visible ? 'Hide Element' : 'Render Element'),
							action: () => {element.visible = !element.visible}
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
					if (rigObject) rigObject.expanded = !rigObject.expanded;
				}}
			>
				<img
					class="expand-arrow-icon {rigObject.expanded ? 'expanded' : ''}"
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
		<!--foreach loop here for all of the rig elements -> forloop in each of the elements for each of their paths-->
		{#if rigObject.expanded}
			<!--Loop through each group first, and then through all elements and check if they have the same group_id-->
			{#each rigObject.groups as group, groupIndex (group.id)}
				<div
					class="rig-node first-node group-node context-target {selectedNode?.type ===
						DNARig.SelectedNodeType.Group &&
					selectedNode?.name === group.id &&
					selectedNode?.index === groupIndex
						? 'selected'
						: ''}"
					id={group.id}
				>
					<!--Group Element-->
					<button
						class="expand-button"
						onclick={(e) => {
							e.stopPropagation();
							group.expanded = !group.expanded;
						}}
					>
						<img
							class="expand-arrow-icon {group.expanded ? 'expanded' : ''}"
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

				{#if group.expanded}
					{#each rigObject.elements as element, elementIndex (element.name)}
						{#if element.group_id === group.id}
							<div
								class="rig-node second-node element-node context-target {selectedNode?.type ===
									DNARig.SelectedNodeType.Element && selectedNode.name === element.name
									? 'selected'
									: ''}"
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
										target.classList.remove('dragging');
									}
								}}
							>
								<button
									class="expand-button"
									onclick={(e) => {
										e.stopPropagation();
										if (rigObject) element.expanded = !element.expanded;
									}}
								>
									<img
										class="expand-arrow-icon {element.expanded ? 'expanded' : ''}"
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
							{#if element.expanded}
								{#each element.points as point, pointIndex}
									<div
										class="rig-node third-node point-node context-target {selectedNode?.type ===
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
						{/if}
					{/each}
				{/if}
			{/each}
			<!--Elements not part of a group-->
			{#each rigObject.elements as element, elementIndex (element.name)}
				{#if element.group_id === ''}
					<div
						class="rig-node first-node element-node context-target {selectedNode?.type ===
							DNARig.SelectedNodeType.Element && selectedNode.name === element.name
							? 'selected'
							: ''}"
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
								target.classList.remove('dragging');
							}
						}}
					>
						<button
							class="expand-button"
							onclick={(e) => {
								e.stopPropagation();
								if (rigObject) element.expanded = !element.expanded;
							}}
						>
							<img
								class="expand-arrow-icon {element.expanded ? 'expanded' : ''}"
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
					{#if element.expanded}
						{#each element.points as point, pointIndex}
							<div
								class="rig-node second-node point-node context-target {selectedNode?.type ===
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
				{/if}
			{/each}
		{/if}
	</div>
{/if}

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
