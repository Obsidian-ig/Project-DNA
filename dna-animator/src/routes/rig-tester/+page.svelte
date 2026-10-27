<!--RIG PLAYGROUND/TESTER-->
<!--
Ideas/Plans:
-Rig Tree/Hierarchy Panel -> Shows all the components of the loaded rig in a hierarchy/tree style.
-Selected tree component props panel -> shows all the properties of the selected item (scale, position, toggles, rotation, etc.)
-Device Sensors Properties Panel -> Lets you simulate the devices sensors to make the rig behave a certain way
-Rig preview -> Shows a 466x466 circular "display" simulation of what the rig would look like on the actual device
-Live preview -> connects to the device via USB or Bluetooth and displays the rig on the device in real time.
-Support third party rigs -> Start reworking the current rig "system" to allow for other rigs that people can make themselves
-Rigs should have either .json, .jsonc, or .dna file types

-->

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import {
		appState,
		HeaderPanelOptionType,
		HeaderType,
		type PageConfig
	} from '../../AppState.svelte.ts';
	import {
		Colors,
		Copy,
		Cut,
		Find,
		Miscellaneous,
		Paste,
		Redo,
		registerHeaderActions,
		TextAndFont,
		Undo
	} from '../header-actions.svelte.js';
	import RigTree from '../../components/RigTree.svelte';
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import RigPropsExplorer from '../../components/RigPropsExplorer.svelte';
	import RigDisplay from '../../components/RigDisplay.svelte';
	import type { RigObject } from '../../DNARig.ts';
	import {
		createDefaultRigObject,
		RemoveKeysFromObject,
		RigLayeringOrderNodeType,
		SelectedNodeType
	} from '../../DNARig.ts';
	import trashIcon from '../../lib/assets/trash-icon-white.png';

	registerHeaderActions({
		file: [
			{
				id: 'closePlayground',
				action: () => {
					navigation.navigate('/');
				}
			},
			{
				id: 'closeRig',
				action: () => {
					if (!pageState) return;
					currentRigFile = null;
					appState.UpdatePageStateLoadedRig(pageId, null);
					appState.UpdatePageStateLoadedRigFilePath(pageId, null);
					appState.UpdatePageStateSelectedNode(pageId, null);
					appState.UpdatePageStateExpandedNodes(pageId, []);
					appState.ResetPageStateRestorePoints(pageId);
				}
			},
			{
				id: 'importRig',
				action: async () => {
					if (!pageState) return;
					console.log('Import Rig!');
					let selectedFilePaths = await window.electronAPI.openFile(
						'Select a Rig File',
						'DNA Rig Files',
						['dnar', 'json']
					);
					let rigFilePath = selectedFilePaths?.[0];
					console.log('Rig File Path: ' + rigFilePath);
					if (!rigFilePath) {
						console.log('Failed to get rig file path!');
						return;
					}
					let fileData = await window.electronAPI.readFile(rigFilePath);
					let rigObject: RigObject | null = JSON.parse(fileData) as RigObject;
					rigObject = createDefaultRigObject(rigObject);
					if (rigObject) {
						//create the runtime transforms in the object.
						rigObject.groups.forEach((group) => {
							group.transforms = {
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
							};
						});

						rigObject.elements.forEach((element) => {
							element.transforms = {
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
							};
						});
					}
					appState.UpdatePageStateExpandedNodes(pageId, []);
					appState.UpdatePageStateLoadedRig(pageId, rigObject);
					appState.UpdatePageStateLoadedRigFilePath(pageId, rigFilePath);
					appState.ResetPageStateRestorePoints(pageId);
					pageState.rigRestorePoints.push(rigObject);
				}
			},
			{
				id: 'newRig',
				action: () => {
					if (!pageState) return;
					appState.UpdatePageStateExpandedNodes(pageId, []);
					appState.UpdatePageStateLoadedRig(pageId, createDefaultRigObject());
					appState.UpdatePageStateLoadedRigFilePath(pageId, null);
					appState.UpdatePageStateSelectedNode(pageId, null);
					appState.ResetPageStateRestorePoints(pageId);
					console.log('New Rig!');
				}
			},
			{
				id: 'saveRig',
				action: async () => {
					if (!pageState) return;
					console.log('Save Rig!');
					if (!pageState.loadedRig) {
						console.log('Failed to save rig as it is null in the appstate!');
						return;
					}
					//cut the runtime properties out of the rig object.
					let cleanedRigObject: RigObject = RemoveKeysFromObject(rigObject, ['transforms', 'previewRender']);
					if (!pageState.loadedRigFilePath) {
						console.log('Unable to save rig as the file path is invalid!');
						console.log('Save Rig As!');
						if (!pageState.loadedRig) {
							console.log('Failed to save rig as it is null in the appstate!');
							return;
						}
						let result = await window.electronAPI.saveNewFile(
							'Save New Rig',
							'DNA Rig Files',
							['dnar', 'json'],
							JSON.stringify(cleanedRigObject, null, 2)
						);
						if (result.success) {
							console.log('Successfully saved new rig!');
							appState.UpdatePageStateLoadedRigFilePath(pageId, result.filePath);
						} else {
							console.log('Failed to save new rig :(');
						}
						savedChanges = true;
						appState.UpdatePageStatePartial(pageId, { title: 'Rig Playground' });
						return;
					}
					let result = await window.electronAPI.saveOrCreateFile(
						pageState.loadedRigFilePath,
						JSON.stringify(cleanedRigObject, null, 2)
					);
					console.log(result ? 'Saved Rig Successfully!' : 'Failed to save rig :(');
					savedChanges = true;
					appState.UpdatePageStatePartial(pageId, { title: 'Rig Playground' });
				}
			},
			{
				id: 'saveRigAs',
				action: async () => {
					if (!pageState) return;
					console.log('Save Rig As!');
					if (!pageState.loadedRig) {
						console.log('Failed to save rig as it is null in the appstate!');
						return;
					}
					//cut the runtime properties out of the rig object.
					let cleanedRigObject: RigObject = RemoveKeysFromObject(rigObject, ['transforms', 'previewRender']);
					let result = await window.electronAPI.saveNewFile(
						'Save New Rig',
						'DNA Rig Files',
						['dnar', 'json'],
						JSON.stringify(cleanedRigObject, null, 2)
					);
					if (result.success) {
						console.log('Successfully saved new rig!');
						appState.UpdatePageStateLoadedRigFilePath(pageId, result.filePath);
					} else {
						console.log('Failed to save new rig :(');
					}
					savedChanges = true;
					appState.UpdatePageStatePartial(pageId, { title: 'Rig Playground' });
				}
			},
			{
				id: 'openInFileExplorer',
				action: () => {
					if (!pageState) return;
					console.log('Open File Explorer!');
					if (!pageState.loadedRigFilePath) {
						console.log('Failed to get rig file path from appstate!');
						return;
					}
					let splicedPath = pageState.loadedRigFilePath.split('\\');
					let splicedFolderPath = splicedPath.splice(splicedPath.length - 2, 1);
					let joinedFolderPath = splicedFolderPath.join('');
					console.log(joinedFolderPath);
					window.electronAPI.openFileExplorer(joinedFolderPath);
				}
			},
			{
				id: 'createRigRestorePoint',
				action: () => {
					if (!rigObject || !pageState) {
						//popup notification saying restore point failed
						return;
					}
					pageState.rigRestorePoints.push($state.snapshot(rigObject));
					//popup notification saying restore point created
				}
			},
			{
				id: 'loadRigRestorePoint',
				action: () => {
					showRigRestorePoints = true;
				}
			},
			{
				id: 'exportPreviewAsImage',
				action: () => {
					let canvas = document.getElementById("rig-display") as HTMLCanvasElement;
					if (!canvas) {
						console.error("Unable to get canvas element!");
						return;
					}
					canvas.toBlob((blob) => {
						if (!blob) return;
						const url = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.download = url;
						link.href = url;
						link.click();
						URL.revokeObjectURL(url);
					}, "image/png");
				}
			}
		],
		edit: [
			{
				id: 'undo',
				action: Undo
			},
			{
				id: 'redo',
				action: Redo
			},
			{
				id: 'cut',
				action: Cut
			},
			{
				id: 'copy',
				action: Copy
			},
			{
				id: 'paste',
				action: Paste
			},
			{
				id: 'find',
				action: Find
			}
		],
		view: [
			{
				id: 'toggleRigTree',
				action: () => {}
			},
			{
				id: 'togglePropertiesExplorer',
				action: () => {
					console.log('Toggle Props Explorer!');
				}
			},
			{
				id: 'toggleDraggableIndicators',
				action: () => {
					console.log('Toggle Drag Indicators!');
				}
			},
			{
				id: 'toggleSensorsSimulation',
				action: () => {}
			}
		],
		options: [
			{
				id: 'colors',
				action: Colors
			},
			{
				id: 'textAndFont',
				action: TextAndFont
			},
			{
				id: 'miscellaneous',
				action: Miscellaneous
			},
			{
				id: 'changeTheme',
				action: () => {
					let themeToChangeTo = appState.config.theme;
					if (themeToChangeTo >= 2) {
						themeToChangeTo = 0;
					} else {
						themeToChangeTo++;
					}
					appState.ChangeTheme(themeToChangeTo);
				}
			}
		],
		device: [
			{
				id: 'toggleDeviceLivePreview',
				action: () => {}
			}
		]
	});
	onDestroy(() => registerHeaderActions({})); //clears the registered actions obviously

	const pageId = 'rig_playground';
	let currentRigFile: File | null = $state(null);
	let savedChanges = $state(true);
	let pageState = $derived(appState.pageStates.find((ps) => ps.id === pageId));
	let rigObject: RigObject | null | undefined = $derived(pageState?.loadedRig);
	let showRigRestorePoints = $state(false);

	$effect(() => {
		let config = {
			title: 'Rig Playground'
		};
		config.title = config.title + (savedChanges ? '' : ' *');
		appState.UpdatePageStatePartial(pageId, config);
	});

	$effect(() => {
		if (pageState && rigObject) {
			JSON.stringify(rigObject);
			savedChanges = false;
			appState.UpdatePageStatePartial(pageId, { title: 'Rig Playground *' });

			//remove elements/groups inside the expanded nodes that don't exist in the rig elements/groups.
			pageState.expandedNodes?.slice().forEach((n) => {
				if (n.type === SelectedNodeType.Element) {
					let elementExists = false;
					rigObject.elements.forEach((e) => {
						if (e.name === n.name && n.type === SelectedNodeType.Element) elementExists = true;
					});
					if (!elementExists) {
						pageState.expandedNodes?.splice(
							pageState.expandedNodes.findIndex((n1) => n1.name === n.name && n1.type === n.type),
							1
						);
						console.log('Removed unused element node from expandedElements');
					}
				} else if (n.type === SelectedNodeType.Group) {
					let groupExists = false;
					rigObject.groups.forEach((g) => {
						if (g.id === n.name && n.type === SelectedNodeType.Group) groupExists = true;
					});
					if (!groupExists) {
						pageState.expandedNodes?.splice(
							pageState.expandedNodes.findIndex((n1) => n1.name === n.name && n1.type === n.type),
							1
						);
						console.log('Removed unused group node from expandedElements');
					}
				} else if (n.type === SelectedNodeType.Root) {
					if (rigObject.name != n.name) {
						pageState.expandedNodes?.splice(
							pageState.expandedNodes.findIndex(
								(n1) => n1.type === SelectedNodeType.Root && n1.name === n.name
							),
							1
						);
						console.log('Removed unused root node from expandedElements');
					}
				}
			});
		}
	});
</script>

<svelte:head>
	<title>{pageState?.title}{savedChanges ? '' : ' *'}</title>
</svelte:head>

<div class="app" id="app">
	<Splitpanes style="height:100%; max-height: 100%; overflow: hidden;">
		<Pane snapSize={5}>
			<RigTree {pageId} />
		</Pane>
		<Pane snapSize={5}>
			<!--Rig Item Properties Explorer-->
			<RigPropsExplorer {pageId} showLiveTransforms={false} />
		</Pane>
		<Pane>
			<Splitpanes horizontal={true}>
				<Pane snapSize={3}>
					<!--Render Preview Screen-->
					<RigDisplay {pageId} />
				</Pane>
				<Pane snapSize={3}>
					<!--Device Sensor Settings/Simulation-->
				</Pane>
			</Splitpanes>
		</Pane>
	</Splitpanes>

	{#if showRigRestorePoints}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="rig-restore-point-container" onclick={() => {}}>
			<div class="rrp-header">
				<p>Rig Restore Points</p>
				<button
					class="rrp-close-button"
					onclick={() => {
						showRigRestorePoints = false;
					}}
				>
					X
				</button>
			</div>
			<div class="rrp-divider"></div>
			<div class="rrp-body">
				<!--All rig restore points should be listed here-->
				{#each pageState?.rigRestorePoints as restorePoint, restorePointIndex}
					{@render RigRestorePoint(restorePoint, restorePointIndex)}
				{/each}
			</div>
		</div>
	{/if}
</div>

{#snippet RigRestorePoint(restorePoint: RigObject, index: number)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="restore-point-item"
		title="Load Restore Point"
		onclick={() => {
			appState.UpdatePageStateLoadedRigFromRestorePoint(pageId, $state.snapshot(restorePoint));
			showRigRestorePoints = false;
		}}
	>
		<div class="rpi-preview-image-container">
			<img class="rpi-preview-image" src={restorePoint.previewRender} alt="Preview" />
		</div>
		<div class="rpi-info-container">
			<p>
				<strong style="font-size: 17px; text-decoration: underline;">{restorePoint.name}</strong>
			</p>
			<p><strong>Last Updated:</strong> {restorePoint.last_updated_utc}</p>
			<p><strong>Total Groups:</strong> {restorePoint.groups.length}</p>
			<p><strong>Total Elements:</strong> {restorePoint.elements.length}</p>
			<p><strong>Total States:</strong> {restorePoint.state_enum.allowed_values.length}</p>
		</div>
		<button
			class="rpi-delete-button"
			onclick={(e) => {
				e.stopPropagation();
				pageState?.rigRestorePoints.splice(index, 1);
			}}
			title="Delete Restore Point"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#ffffff"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-trash preview-icon"
				><path d="M10 11v6" /><path d="M14 11v6" /><path
					d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
				/><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg
			>
		</button>
	</div>
{/snippet}

<style>
	.app {
		width: 100vw;
		max-width: 100%;
		height: calc(100vh - 35px); /*The viewport height - header height*/
	}

	:global(.splitpanes.default-theme) {
		&.splitpanes--vertical .splitpanes__splitter {
			width: 2px !important;
		}
		&.splitpanes--horizontal .splitpanes__splitter {
			height: 2px !important;
			width: 100% !important; /*fixes issue with width being set to 2px cause of vertical style above*/
		}

		& .splitpanes__pane {
			background-color: var(--bg) !important;
		}

		& .splitpanes__splitter {
			background-color: var(--primary) !important;
			border: none !important;
		}
	}

	.rig-restore-point-container {
		display: flex;
		flex-direction: column;
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		min-width: 60%;
		width: max-content;
		max-width: 400px;
		height: 70%;
		z-index: 2;
		background-color: var(--bg-dark);
		border-color: var(--border);
		border-width: 1px;
		box-shadow: rgba(0, 0, 0, 0.3) 0px 3px 10px 5px;

		.rrp-header {
			display: flex;
			align-items: center;
			justify-content: center;
			padding-bottom: 3px;

			p {
				margin-left: auto;
			}

			.rrp-close-button {
				margin-left: auto;
				margin-right: 5px;
			}
		}

		.rrp-divider {
			width: 100%;
			height: 1px;
			background-color: var(--border-muted);
		}

		.rrp-body {
			padding: 20px;
			display: flex;
			flex-direction: column;
			gap: 15px;
			overflow-y: auto;
			scrollbar-color: var(--primary) transparent;
		}
	}

	.restore-point-item {
		width: 100%;
		height: 150px;
		background-color: var(--bg);
		display: flex;
		gap: 20px;
		padding: 10px;
		border-radius: 12px;
		border-color: var(--border-muted);
		border-width: 1px;
		position: relative;
		transition: ease-in-out 0.2s;
		will-change: transform;

		&:hover {
			cursor: pointer;
			scale: 1.02;
		}

		.rpi-preview-image-container {
			background-color: #d9d9d9;
			background-image:
				linear-gradient(45deg, #9c9b9b 25%, transparent 25%),
				linear-gradient(-45deg, #9c9b9b 25%, transparent 25%),
				linear-gradient(45deg, transparent 75%, #9c9b9b 75%),
				linear-gradient(-45deg, transparent 75%, #9c9b9b 75%);
			background-size: 10px 10px;
			padding: 5px;
			border-radius: 12px;
			aspect-ratio: 1;
		}

		.rpi-preview-image {
			background-color: black;
			border-radius: 50%;
			width: 100%;
			height: 100%;
			aspect-ratio: 1;
		}

		.rpi-info-container {
			display: flex;
			flex-direction: column;

			p {
				font-size: clamp(0.7rem, 1vw, 3rem);
			}
		}

		.rpi-delete-button {
			width: 20px;
			height: 20px;
			position: absolute;
			left: calc(100% - 30px);
			display: flex;
			justify-content: center;
			align-items: center;

			svg {
				filter: var(--img-filter);
			}

			&:hover {
				svg {
					stroke: red;
					filter: drop-shadow(0px 0px 10px orangered);
				}
			}
		}
	}
</style>
