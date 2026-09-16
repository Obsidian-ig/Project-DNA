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
	import { onDestroy } from 'svelte';
	import { appState } from '../../AppState.svelte.ts';
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

	registerHeaderActions({
		file: [
            {
                id: 'closePlayground',
                action: () => {
                    navigation.navigate("/");
                }
            },
            {
                id: 'closeRig',
                action: () => {
                    currentRigFile = null;
                    appState.UpdateRigPlaygroundStateLoadedRig(null);
					appState.UpdateRigPlaygroundStateRigFilePath("");
                    appState.UpdateRigPlaygroundStateSelectedNode(null);
                }
            },
			{
				id: 'importRig',
				action: async () => {
					console.log('Import Rig!');
					let selectedFilePaths = await window.electronAPI.openFile("Select a Rig File", "DNA Rig Files", ["dnar", "json"]);
					let rigFilePath = selectedFilePaths?.[0];
					console.log("Rig File Path: " + rigFilePath);
					if (!rigFilePath) {console.log("Failed to get rig file path!"); return;}
					let fileData = await window.electronAPI.readFile(rigFilePath);
					let rigObject: RigObject | null = JSON.parse(fileData) as RigObject;
					appState.UpdateRigPlaygroundStateLoadedRig(rigObject);
					appState.UpdateRigPlaygroundStateRigFilePath(rigFilePath);
				}
			},
			{
				id: 'newRig',
				action: () => {
					console.log('New Rig!');
				}
			},
			{
				id: 'saveRig',
				action: async () => {
					console.log('Save Rig!');
					if (!appState.rigPlaygroundState.loadedRigFilePath) {
						console.log("Unable to save rig as the file path is invalid!");
						return;
					}
					let result = await window.electronAPI.saveOrCreateFile(appState.rigPlaygroundState.loadedRigFilePath, JSON.stringify(appState.rigPlaygroundState.loadedRig, null, 2));
					console.log((result ? "Saved Rig Successfully!" : "Failed to save rig :("));
				}
			},
			{
				id: 'saveRigAs',
				action: async () => {
					console.log('Save Rig As!');
					let result = await window.electronAPI.saveNewFile("Save New Rig", "DNA Rig Files", ["dnar", "json"], JSON.stringify(appState.rigPlaygroundState.loadedRig, null, 2));
					if (result.success) {
						console.log("Successfully saved new rig!");
						appState.UpdateRigPlaygroundStateRigFilePath(result.filePath);
					} else {
						console.log("Failed to save new rig :(");
					}
				}
			},
			{
				id: 'openInFileExplorer',
				action: () => {
					console.log('Open File Explorer!');
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

    let currentRigFile: File | null = $state(null);
</script>

<svelte:head>
	<title>Rig Playground</title>
</svelte:head>

<div class="app" id="app">
	<Splitpanes style="height:100%; max-height: 100%; overflow: hidden;">
		<Pane snapSize={5}>
			<RigTree rigFile={currentRigFile} />
		</Pane>
		<Pane snapSize={5}>
			<!--Rig Item Properties Explorer-->
            <RigPropsExplorer />
		</Pane>
		<Pane>
			<Splitpanes horizontal={true}>
				<Pane snapSize={3}>
					<!--Render Preview Screen-->
                    <RigDisplay />
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
