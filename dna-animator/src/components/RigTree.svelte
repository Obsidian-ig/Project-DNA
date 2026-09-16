<script lang="ts">
	import downArrowIcon from '$lib/assets/down-arrow-icon-white.png';
    import * as DNARig from '../DNARig';
	import { appState } from '../AppState.svelte';
	

	let { rigFile }: { rigFile: File | null } = $props();
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let selectedNode = $derived(appState.rigPlaygroundState.selectedNode);
	$effect(() => {
		if (rigFile) {
			console.log('Rig Tree => Received new rig!');
			async function GetFileTextAndUpdateRigObject() {
				const rigFileContent = await rigFile?.text();
				if (!rigFileContent) return;
				function ConvertRigDataIntoObject<T extends object>(data: T): DNARig.RigObject & T {
					let finishedObject: DNARig.RigObject = {
						name: (data as any)?.name ?? 'null',
						expanded: (data as any)?.expanded,
						rig_version: (data as any)?.rig_version ?? 0,
						rig_structure_version: (data as any)?.rig_structure_version ?? 0,
						base: (data as any)?.base ?? {
							starting_position: { x: 0.0, y: 0.0 },
							starting_rotation: { x: 0.0, y: 0.0 },
							starting_scale: { x: 0.0, y: 0.0 }
						},
						position: (data as any)?.position ?? { x: 0.0, y: 0.0 },
						rotation: (data as any)?.rotation ?? { x: 0.0, y: 0.0 },
						scale: (data as any)?.scale ?? { x: 0.0, y: 0.0 },
						elements: (data as any)?.elements ?? [],
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
        let nodesContainer = document.querySelector(".rig-tree-container");
        let elementNodes = document.querySelectorAll(".element-node");
        elementNodes.forEach((elementNode) => {
            elementNode.addEventListener("dragstart", () => {
                setTimeout(() => elementNode.classList.add("dragging"), 0);
            });
            elementNode.addEventListener("dragend", () => {
                elementNode.classList.remove("dragging");
            })
        });
        const initSortableList = (e: any) => {
            e.preventDefault();
            const draggingItem: HTMLElement = document.querySelector(".dragging") as HTMLElement;
            let siblings = [...document.querySelectorAll(".element-node:not(.dragging)")] as HTMLElement[];
            let nextSibling = siblings.find(sibling => {
                return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
            });
            if (!nextSibling) return;
            
            let draggedElementIndex = rigObject?.elements.findIndex(el => el.name === draggingItem.id);
            if (draggedElementIndex === undefined || draggedElementIndex === -1) return;
            let draggedElement = rigObject?.elements.splice(draggedElementIndex, 1)
            if (!draggedElement) return;
            let nextSiblingElementIndex = rigObject?.elements.findIndex(el => el.name === nextSibling.id);
            if (nextSiblingElementIndex === undefined || nextSiblingElementIndex === -1) return;
            if (draggedElementIndex < nextSiblingElementIndex) nextSiblingElementIndex--;
            rigObject?.elements.splice(nextSiblingElementIndex, 0, draggedElement[0]);
        };
        nodesContainer?.addEventListener("dragover", initSortableList);
        nodesContainer?.addEventListener("dragenter", (e) => e.preventDefault());
        /*End Dragging Element Nodes Logic*/

        /*Context Menu Logic*/
        let showContextMenu = false;
        
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
		<div class="rig-node root-node {selectedNode?.type === DNARig.SelectedNodeType.Root ? 'selected' : ''}">
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
			{#each rigObject.elements as element, elementIndex (element.name)}
				<div
					class="rig-node element-node {selectedNode?.type === DNARig.SelectedNodeType.Element &&
					selectedNode.name === element.name
						? 'selected'
						: ''}"
                    id={element.name}
                    draggable="true"
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
					{#each element.points as point, pathIndex}
						<div
							class="rig-node path-node {selectedNode?.type === DNARig.SelectedNodeType.Point &&
							selectedNode.index === pathIndex &&
							selectedNode.name === element.name
								? 'selected'
								: ''}"
						>
							<button
								class="rig-node-select-button"
								onclick={(e) => {
									e.stopPropagation();
									if (rigObject)
										selectedNode = {
											name: element.name,
											type: DNARig.SelectedNodeType.Point,
											index: pathIndex
										};
								}}>Point: {pathIndex}</button
							>
						</div>
					{/each}
				{/if}
			{/each}
		{/if}
	</div>
{/if}

<ul class="context-menu">
    <li class="context-item">

    </li>
</ul>

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

	.element-node {
		margin-left: 20px;
        margin-top: 3px;
	}

	.path-node {
		margin-left: 70px;
        margin-top: 3px;
	}
</style>
