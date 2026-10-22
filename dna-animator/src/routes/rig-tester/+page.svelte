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
					let cleanedRigObject: RigObject = RemoveKeysFromObject(rigObject, ['transforms']);
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
					let cleanedRigObject: RigObject = RemoveKeysFromObject(rigObject, ['transforms']);
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
</div>

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
</style>
