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

	interface RigTreeNode {
		type: DNARig.RigLayeringOrderNodeType;
		id: string;
		elements: (DNARig.RigElement | null | undefined)[];
	}

	interface DraggedElement {
		type: 'element' | 'group';
		id: string;
	}

	let { rigFile }: { rigFile: File | null } = $props();
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let selectedNode = $derived(appState.rigPlaygroundState.selectedNode);
	let showContextMenu = $state(false);
	let currentContextMenuOptions: ContextMenuOptions | null = $state(null);
	let expandedNodes = $derived(appState.rigPlaygroundState.expandedNodes);
	let dragged: DraggedElement | null = $state(null);
	let rigTreeNodes = $derived(rigObject ? BuildTree(rigObject) : []);

	function RepairRigLayeringOrder() {
		if (!rigObject) return;
		for (const group of rigObject.groups) {
			let existsInLayeringOrder = rigObject.layering_order.find(
				(n) => n.type === DNARig.RigLayeringOrderNodeType.Group && n.id === group.id
			);
			if (!existsInLayeringOrder) {
				rigObject.layering_order.push({
					type: DNARig.RigLayeringOrderNodeType.Group,
					id: group.id
				});
			}
		}
		for (const element of rigObject.elements) {
			if (element.group_id) continue;
			let existsInLayeringOrder = rigObject.layering_order.find(
				(n) => n.type === DNARig.RigLayeringOrderNodeType.Element && n.id === element.name
			);
			if (!existsInLayeringOrder) {
				rigObject.layering_order.push({
					type: DNARig.RigLayeringOrderNodeType.Element,
					id: element.name
				});
			}
		}
	}

	function BuildTree(rig: DNARig.RigObject): RigTreeNode[] {
		const nodes: RigTreeNode[] = [];
		const placed = new Set<string>();

		for (const item of rig.layering_order) {
			if (item.type === DNARig.RigLayeringOrderNodeType.Group) {
				if (!rig.groups.some((g) => g.id === item.id)) continue;
				const elements = rig.elements.filter((e) => e.group_id === item.id);
				elements.forEach((e) => placed.add(e.name));
				nodes.push({
					type: item.type,
					id: item.id,
					elements: elements
				});
			} else {
				const element = rig.elements.find((e) => e.name === item.id);
				if (!element || element.group_id) continue;
				placed.add(element.name);
				nodes.push({
					type: item.type,
					id: item.id,
					elements: [element]
				});
			}
		}
		for (const element of rig.elements) {
			if (placed.has(element.name)) continue;
			placed.add(element.name);
			nodes.push({
				type: DNARig.RigLayeringOrderNodeType.Element,
				id: element.name,
				elements: [element]
			});
		}
		return nodes;
	}

	$effect(() => {
		if (!rigObject) return;
		RepairRigLayeringOrder();
	});

	$effect(() => {
		appState.UpdateRigPlaygroundStateSelectedNode(selectedNode);
	});

	function SaveLayerOrder(nodes: RigTreeNode[]) {
		if (!rigObject) return;
		const updatedLayeringOrder: { type: DNARig.RigLayeringOrderNodeType; id: string }[] = [];
		const elements: DNARig.RigElement[] = [];
		for (const node of nodes) {
			if (!node) continue;
			updatedLayeringOrder.push({
				type: node.type,
				id: node.id
			});
			for (const element of node.elements) {
				if (!element) continue;
				element.group_id = node.type === DNARig.RigLayeringOrderNodeType.Group ? node.id : '';
				elements.push(element);
			}
		}
		rigObject.elements = elements;
		rigObject.layering_order = updatedLayeringOrder;
	}

	const initSortableList = (e: any) => {
		e.preventDefault();
		if (!rigObject || !rigTreeNodes || !dragged) return;
		const draggingItem: HTMLElement = document.getElementById(dragged.id) as HTMLElement;
		let isGroup = dragged.type === 'group';
		//console.log(draggingItem);
		let siblings = isGroup
			? ([...document.querySelectorAll('.group-node:not(.dragging)')] as HTMLElement[])
			: draggingItem.classList.contains('element-node')
				? ([
						...document.querySelectorAll(
							'.element-node:not(.dragging), .group-node:not(.dragging), .group-divider-node'
						)
					] as HTMLElement[])
				: [];
		if (siblings.length <= 0) return;

		let nextTreeNode = siblings.find((sibling) => {
			const box = sibling.getBoundingClientRect();
			return e.clientY <= box.top + box.height / 2;
		});

		let draggedIndex: number = -1;
		if (isGroup)
			draggedIndex = rigTreeNodes.findIndex(
				(n) => n?.id === draggingItem.id && n.type === DNARig.RigLayeringOrderNodeType.Group
			);

		/*THIS HANDLES THE ELEMENTS*/
		if (!isGroup) {
			let updatedTreeNodes = [...rigTreeNodes];
			let elementGroup = updatedTreeNodes.find(
				(n) =>
					n?.type === DNARig.RigLayeringOrderNodeType.Group && n.id === draggingItem.dataset.group
			);
			let elementIndex = elementGroup
				? elementGroup.elements.findIndex((e) => e?.name === draggingItem.id)
				: updatedTreeNodes.findIndex(
						(n) => n?.type === DNARig.RigLayeringOrderNodeType.Element && n.id === draggingItem.id
					);

			if (!nextTreeNode) {
				//done?
				//element should be made an orphan and put at the bottom of the layering order
				if (elementGroup) {
					let element = elementGroup.elements.splice(elementIndex, 1)[0];
					if (!element) {
						console.error(
							'Failed to retrieve element from its specified group! ' + elementGroup.id
						);
						return;
					}
					let newElementTreeNode: RigTreeNode = {
						type: DNARig.RigLayeringOrderNodeType.Element,
						id: element.name,
						elements: [element]
					};
					updatedTreeNodes.push(newElementTreeNode);
					draggingItem.dataset.group = '';
					element.group_id = '';
					console.log(element.group_id);
				} else {
					//the element is not in a group and should be moved to the bottom of the rig tree nodes array
					if (elementIndex === updatedTreeNodes.length - 1) return; //element is already at the bottom of the array
					let elementNode = updatedTreeNodes.splice(elementIndex, 1)[0];
					if (elementNode) updatedTreeNodes.push(elementNode);
					draggingItem.dataset.group = '';
					if (elementNode?.elements[0]?.group_id) elementNode!.elements[0]!.group_id = '';
					if (!elementNode)
						console.error('Unable to find element orphan node in updatedTreeNodes!');
				}
				return updatedTreeNodes;
			}
			if (nextTreeNode?.classList.contains('group-divider-node')) {
				//done?
				//go into the group above the divider at the bottom
				let group_id = nextTreeNode.dataset.group;
				let group = updatedTreeNodes.find(
					(n) => n?.type === DNARig.RigLayeringOrderNodeType.Group && n.id === group_id
				);
				//find where the element is actually located (orphan or in a group node)
				if (elementGroup) {
					//element is in a group
					let element = elementGroup.elements.splice(elementIndex, 1)[0];
					if (element) {
						group?.elements.push(element);
						draggingItem.dataset.group = group?.id;
						element.group_id = group?.id;
					}
				} else {
					//element is not a group and needs to be unorphaned
					let element = updatedTreeNodes.splice(elementIndex, 1)[0]?.elements[0];
					if (!element) {
						console.error('Failed To Find Orphaned Element in updatedTreeNodes!');
						return;
					}
					group?.elements.push(element);
					draggingItem.dataset.group = group?.id;
					element.group_id = group?.id;
				}
				return updatedTreeNodes;
			}
			if (nextTreeNode?.classList.contains('group-node')) {
				//done?
				if (elementGroup) {
					let element = elementGroup.elements.splice(elementIndex, 1)[0];
					if (!element) {
						console.error('Failed to retrieve element from its specified group! : group-node');
						return;
					}
					let newElementTreeNode: RigTreeNode = {
						type: DNARig.RigLayeringOrderNodeType.Element,
						id: element.name,
						elements: [element]
					};
					updatedTreeNodes.splice(
						updatedTreeNodes.findIndex(
							(n) => n?.type === DNARig.RigLayeringOrderNodeType.Group && n.id === nextTreeNode.id
						),
						0,
						newElementTreeNode
					);
					draggingItem.dataset.group = '';
					element.group_id = '';
				} else {
					if (elementIndex === updatedTreeNodes.length - 1) return; //element is already at the bottom of the array
					let elementNode = updatedTreeNodes.splice(elementIndex, 1)[0];
					if (elementNode) {
						updatedTreeNodes.splice(
							updatedTreeNodes.findIndex(
								(n) => n?.type === DNARig.RigLayeringOrderNodeType.Group && n.id === nextTreeNode.id
							),
							0,
							elementNode
						);
						draggingItem.dataset.group = '';
						elementNode.elements[0]!.group_id = ''; //idc, im using the !
					}

					if (!elementNode) console.error('Unable to find element orphan node in rigTreeNodes!');
				}
				return updatedTreeNodes;
			}
			if (nextTreeNode?.classList.contains('element-node')) {
				//done?
				//could be an orphaned element or it could be an element in a group
				let nextTreeNodeGroup = updatedTreeNodes.find(
					(n) =>
						n?.type === DNARig.RigLayeringOrderNodeType.Group && n.id === nextTreeNode.dataset.group
				);
				let nextTreeNodeIndex = nextTreeNodeGroup
					? nextTreeNodeGroup.elements.findIndex((e) => e?.name === nextTreeNode.id)
					: updatedTreeNodes.findIndex(
							(n) => n?.type === DNARig.RigLayeringOrderNodeType.Element && n.id === nextTreeNode.id
						);

				if (elementGroup) {
					let element = elementGroup.elements.splice(elementIndex, 1)[0];
					if (!element) {
						console.error('Unable to get element from element group! : element-node');
						return;
					}
					if (nextTreeNodeGroup) {
						if (elementGroup.id === nextTreeNodeGroup.id && elementIndex < nextTreeNodeIndex) {
							nextTreeNodeIndex--;
						}
						nextTreeNodeGroup.elements.splice(nextTreeNodeIndex, 0, element);
						draggingItem.dataset.group = nextTreeNodeGroup.id;
					} else {
						let newElementTreeNode: RigTreeNode = {
							type: DNARig.RigLayeringOrderNodeType.Element,
							id: element.name,
							elements: [element]
						};
						updatedTreeNodes.splice(nextTreeNodeIndex, 0, newElementTreeNode);
						draggingItem.dataset.group = '';
					}
				} else {
					let element = updatedTreeNodes.splice(elementIndex, 1)[0];
					if (!element) {
						console.error('Unable to get element from element group! : element-node 2');
						return;
					}
					if (!element.elements || !element.elements[0]) {
						console.error(
							'Failed to get element from element node in updatedTreeNodes! : element-node 2'
						);
						return;
					}
					if (nextTreeNodeGroup) {
						nextTreeNodeGroup.elements.splice(nextTreeNodeIndex, 0, element.elements[0]);
						draggingItem.dataset.group = nextTreeNodeGroup.id;
					} else {
						let newElementTreeNode: RigTreeNode = {
							type: DNARig.RigLayeringOrderNodeType.Element,
							id: element.elements[0]!.name,
							elements: [element.elements[0]]
						};
						updatedTreeNodes.splice(nextTreeNodeIndex, 0, newElementTreeNode);
						draggingItem.dataset.group = '';
					}
				}
				return updatedTreeNodes;
			}
			return updatedTreeNodes;
		}

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
		return updatedTreeNodes;
	};

	$effect(() => {
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

			function CreateNewGroup() {
				let newGroups = rigObject?.groups.filter((g) => g.id.includes('New_Group_'));
				let numberToUse = 0;
				let highestNumberUsed = -1;
				newGroups?.forEach((group) => {
					let groupNumber = Number.parseInt(group.id.split('_')[2]);
					if (groupNumber > highestNumberUsed) highestNumberUsed = groupNumber;
				});
				if (highestNumberUsed >= 0) numberToUse = highestNumberUsed + 1;
				let newGroup = {
					id: 'New_Group_' + numberToUse.toString(),
					visible: true,
					offsets: {
						position: {
							x: 0,
							y: 0
						},
						rotation: 0,
						scale: {
							x: 1,
							y: 1
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
							x: 1,
							y: 1
						},
						rotation_two: 0
					}
				};

				rigObject?.layering_order.push({
					type: DNARig.RigLayeringOrderNodeType.Group,
					id: newGroup.id
				});
				return newGroup;
			}

			function CreateNewElement(groupId: string) {
				if (!rigObject) return;
				let newElements = rigObject.elements.filter((el) => el.name.includes('New_Element_'));
				let numberToUse = 0;
				let highestNumberUsed = -1;
				if (newElements && newElements.length > 0) {
					newElements.forEach((element) => {
						let elementNumber = Number.parseInt(element.name.split('_')[2]);
						if (elementNumber > highestNumberUsed) highestNumberUsed = elementNumber;
					});
					numberToUse = highestNumberUsed + 1;
				}
				let newElement = {
					name: 'New_Element_' + numberToUse.toString(),
					group_id: groupId,
					expanded: false,
					visible: true,
					show_position_point: false,
					position_point_color: '#00fc22',
					show_origin_point: false,
					origin_point_color: '#ed6f26',
					offsets: {
						position: {
							x: 0,
							y: 0
						},
						rotation: 0,
						scale: {
							x: 1,
							y: 1
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
							x: 1,
							y: 1
						},
						rotation_two: 0
					},
					points: [
						{
							point: {
								x: 0,
								y: 0
							},
							interpolation_type: DNARig.RigPointInterpolationType.Linear,
							controls: [],
							steps: 20,
							show_control_points: false,
							control_point_color: '#ed263a'
						}
					],
					fill_color: '#FFFFFF',
					stroke_color: '#FFFFFF',
					closed: true,
					filled: true
				};
				if (!groupId) {
					rigObject.layering_order.push({
						type: DNARig.RigLayeringOrderNodeType.Element,
						id: newElement.name
					});
				}
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
					interpolation_type: 'Linear',
					controls: [],
					steps: 20,
					show_control_points: false,
					control_point_color: '#ed263a'
				});
			}

			if (target.classList.contains('root-node')) {
				currentContextMenuOptions = {
					options: [
						{
							label: 'Create New Group',
							action: () => {
								let newGroup = CreateNewGroup();
								rigObject?.groups.push(newGroup);
							}
						},
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
								rigObject.elements.push(newElement);
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
							label: 'Duplicate Group',
							action: () => {
								let clone: DNARig.RigGroup = JSON.parse(JSON.stringify(group));
								clone.id = clone.id + '_Clone';
								rigObject.groups.push(clone);
								rigObject.elements.forEach((e) => {
									if (e.group_id !== group.id) return;
									let elementClone: DNARig.RigElement = JSON.parse(JSON.stringify(e));
									elementClone.group_id = clone.id;
									elementClone.name = clone.id + '_' + elementClone.name;
									rigObject.elements.push(elementClone);
								});
								rigObject.layering_order.push({
									type: DNARig.RigLayeringOrderNodeType.Group,
									id: clone.id
								});
							}
						},
						{
							label: 'Delete Group',
							action: () => {
								if (!rigObject) return;
								let layerIndex = rigObject.layering_order.findIndex(
									(n) => n.type === DNARig.RigLayeringOrderNodeType.Group && n.id === group.id
								);
								rigObject.layering_order.splice(layerIndex, 1);
								let expandedIndex =
									appState.rigPlaygroundState.expandedNodes?.findIndex(
										(n) => n.type === DNARig.SelectedNodeType.Group && n.name === group.id
									) ?? -1;
								if (expandedIndex && expandedIndex !== -1) {
									console.log('deleted expanded node at index: ' + expandedIndex.toString());
									appState.rigPlaygroundState.expandedNodes?.splice(expandedIndex, 1);
								}
								rigObject.elements.slice().forEach((e) => {
									if (e.group_id !== group.id) return;
									rigObject.elements.splice(
										rigObject.elements.findIndex(
											(e2) => e2.name === e.name && e2.group_id === e.group_id
										),
										1
									);
								});
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
								let clone = JSON.parse(JSON.stringify(element));
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
								appState.rigPlaygroundState.expandedNodes?.slice().forEach((node, nodeIndex) => {
									if (
										node.name === element.name &&
										(node.type === DNARig.SelectedNodeType.Element ||
											node.type === DNARig.SelectedNodeType.Point)
									) {
										appState.rigPlaygroundState.expandedNodes?.splice(nodeIndex, 1);
									}
								});

								if (element.group_id === '') {
									rigObject.layering_order.splice(
										rigObject.layering_order.findIndex(
											(n) =>
												n.type === DNARig.RigLayeringOrderNodeType.Element && n.id === element.name
										),
										1
									);
								} else {
									let group = rigTreeNodes.find(
										(n) =>
											n.type === DNARig.RigLayeringOrderNodeType.Group && n.id === element.group_id
									);
									group?.elements.splice(
										group.elements.findIndex((e) => e?.name === element.name),
										1
									);
								}
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
				let pointIndex = Number.parseInt(target.id.split('-point-')[1]);
				let point = parentElement?.points?.[pointIndex];
				if (!point) return;
				currentContextMenuOptions = {
					options: [
						{
							label: 'Duplicate Point',
							action: () => {
								let clone = JSON.parse(JSON.stringify(point));
								parentElement?.points.push(clone);
							}
						},
						...(point.controls && point.controls.length < 2
							? [
									{
										label: 'Add Control Point',
										action: () => {
											point.controls?.push({
												x: 0,
												y: 0
											});
										}
									}
								]
							: []),
						{
							label: 'Delete Point',
							action: () => {
								parentElement?.points.splice(
									parentElement?.points.findIndex((p) => p === point),
									1
								);
								appState.rigPlaygroundState.expandedNodes?.slice().forEach((node, nodeIndex) => {
									if (
										node.name === parentElement?.name &&
										node.type === DNARig.SelectedNodeType.Point &&
										node.index === pointIndex
									) {
										appState.rigPlaygroundState.expandedNodes?.splice(nodeIndex, 1);
									}
								});
							}
						}
					]
				};
			} else if (target.classList.contains('point-control-node')) {
				let parentElement = rigObject.elements.find((e) => e.name === target.dataset.elementName);
				if (!parentElement) return;
				let parentPoint = parentElement.points[parseInt(target.dataset?.pointIndex ?? '')];
				if (!parentPoint) return;
				let controlPoint = parentPoint?.controls?.[parseInt(target.dataset?.controlIndex ?? '')];
				if (!controlPoint) return;
				currentContextMenuOptions = {
					options: [
						...(parentPoint.controls && parentPoint.controls.length === 1
							? [
									{
										label: 'Duplicate Control Point',
										action: () => {
											if (!parentPoint.controls) return;
											parentPoint.controls.push(JSON.parse(JSON.stringify(controlPoint)));
										}
									}
								]
							: []),
						...(parentPoint.controls &&
						((parentPoint.interpolation_type ===
							DNARig.RigPointInterpolationType.QuadraticBezierCurve &&
							parentPoint.controls.length > 1) ||
							(parentPoint.interpolation_type ===
								DNARig.RigPointInterpolationType.CubicBezierCurve &&
								parentPoint.controls.length > 2) ||
							parentPoint.interpolation_type === DNARig.RigPointInterpolationType.Linear)
							? [
									{
										label: 'Delete Control Point',
										action: () => {
											if (!parentPoint.controls) return;
											parentPoint.controls.splice(parseInt(target.dataset.controlIndex ?? ''), 1);
										}
									}
								]
							: [])
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
		ondragover={(e) => e.preventDefault()}
		ondragenter={(e) => {
			e.preventDefault();
		}}
		ondrop={(e) => {
			const nodes = initSortableList(e);
			if (nodes) {
				SaveLayerOrder(nodes);
			}
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
									: ''} {group.id === dragged?.id ? 'dragging' : ''}"
								id={group.id}
								draggable="true"
								ondragstart={(e) => {
									let target = e.currentTarget;
									setTimeout(() => {
										if (target instanceof HTMLElement) {
											target.classList.add('dragging');
										}
									}, 0);
									dragged = {
										type: 'group',
										id: group.id
									};
								}}
								ondragend={(e) => {
									let target = e.currentTarget;
									if (target instanceof HTMLElement) {
										console.log('dragended');
										target.classList.remove('dragging');
										dragged = null;
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
										element?.group_id ?? '',
										element,
										rigObject.elements.findIndex((e) => e.name === element.name)
									)}
								{/if}
							{/each}
						{/if}
						<div
							class="rig-node first-node group-divider-node context-target"
							data-group={group?.id}
						></div>
					{:else if node.type === DNARig.RigLayeringOrderNodeType.Element}
						{let element = node.elements[0]}
						{#if element}
							{@render ElementNode(
								false,
								'',
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

{#snippet ElementNode(
	inGroup: boolean,
	group_id: string,
	element: DNARig.RigElement,
	elementIndex: number
)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="rig-node {inGroup
			? 'second-node'
			: 'first-node'} element-node context-target {selectedNode?.type ===
			DNARig.SelectedNodeType.Element && selectedNode.name === element.name
			? 'selected'
			: ''} {element.name === dragged?.id ? 'dragging' : ''}"
		id={element.name}
		data-group={group_id}
		draggable="true"
		ondragstart={(e) => {
			let target = e.currentTarget;
			setTimeout(() => {
				if (target instanceof HTMLElement) {
					target.classList.add('dragging');
				}
			}, 0);
			dragged = {
				type: 'element',
				id: element.name
			};
		}}
		ondragend={(e) => {
			let target = e.currentTarget;
			if (target instanceof HTMLElement) {
				console.log('dragended');
				target.classList.remove('dragging');
				dragged = null;
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
			}}
		>
			{element.name}
		</button>
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
				id={element.name + '-' + 'point-' + pointIndex.toString()}
				data-element-name={element.name}
				data-point-index={pointIndex.toString()}
			>
				{#if point.controls && point.controls.length > 0}
					<button
						class="expand-button"
						onclick={(e) => {
							e.stopPropagation();
							let exists = expandedNodes?.find(
								(n) =>
									n.type === DNARig.SelectedNodeType.Point &&
									n.name === element.name &&
									n.index === pointIndex
							);
							if (exists) {
								expandedNodes?.slice().forEach((n, index) => {
									if (
										n.type === DNARig.SelectedNodeType.Point &&
										n.name === element.name &&
										n.index === pointIndex
									) {
										expandedNodes?.splice(index, 1);
									}
								});
							} else {
								expandedNodes?.push({
									name: element.name,
									type: DNARig.SelectedNodeType.Point,
									index: pointIndex
								});
							}
						}}
					>
						<img
							class="expand-arrow-icon {expandedNodes?.find(
								(n) =>
									n.type === DNARig.SelectedNodeType.Point &&
									n.name === element.name &&
									n.index === pointIndex
							)
								? 'expanded'
								: ''}"
							src={downArrowIcon}
							alt="Expand/Collapse Arrow"
						/>
					</button>
				{/if}
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
			{#if expandedNodes?.find((n) => n.type === DNARig.SelectedNodeType.Point && n.name === element.name && n.index === pointIndex) && point.controls && point.controls.length > 0}
				{#each point.controls as control, controlIndex}
					<div
						class="rig-node
						{inGroup ? 'fourth-node' : 'third-node'} 
						point-control-node context-target
						{selectedNode?.type === DNARig.SelectedNodeType.ControlPoint &&
						selectedNode.index === controlIndex &&
						selectedNode.name === element.name + '_' + 'Point_' + pointIndex.toString()
							? 'selected'
							: ''}"
						id={element.name + '-point-' + pointIndex + '-controlpoint-' + controlIndex.toString()}
						data-element-name={element.name}
						data-point-index={pointIndex.toString()}
						data-control-index={controlIndex.toString()}
					>
						<button
							class="rig-node-select-button"
							onclick={(e) => {
								e.stopPropagation();
								if (rigObject)
									selectedNode = {
										name: element.name + '_' + 'Point_' + pointIndex.toString(),
										type: DNARig.SelectedNodeType.ControlPoint,
										index: controlIndex
									};
							}}
						>
							Control: {controlIndex}
						</button>
					</div>
				{/each}
			{/if}
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

	.fourth-node {
		margin-left: 155px;
		margin-top: 3px;
	}

	.group-node {
		height: 23px;
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
