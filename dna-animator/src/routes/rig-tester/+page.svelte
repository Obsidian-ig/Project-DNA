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
	import { onDestroy, onMount, mount, unmount, type ComponentProps } from 'svelte';
	import { appState, Theme } from '../../AppState.svelte.ts';
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
	import type { File } from 'node:buffer';

	registerHeaderActions({
		file: [
			{
				id: 'importRig',
				action: async () => {
					console.log('Import Rig!');
					const options = {
						types: [
							{
								description: 'Rig File',
								accept: {
									'json/*': ['.dnar', '.jsonc', '.json']
								}
							}
						],
						excludeAcceptAllOption: true,
						multiple: false // Set to true to allow selecting multiple files
					};
					const [fileHandle] = await window.showOpenFilePicker(options);
                    const file = await fileHandle.getFile();
                    console.log("Chose Rig File: " + file.name);
                    currentRigFile = file;
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
				action: () => {
					console.log('Save Rig!');
				}
			},
			{
				id: 'saveRigAs',
				action: () => {
					console.log('Save Rig As!');
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

    let currentRigFile: File | null = null;
</script>

<svelte:head>
	<title>Rig Playground</title>
</svelte:head>

<div class="app" id="app">
	<Splitpanes style="height:100%; max-height: 100%; overflow: hidden;">
		<Pane snapSize={3}>
			<RigTree rigFile={currentRigFile} />
		</Pane>
		<Pane snapSize={3}>
			<!--Rig Item Properties Explorer-->
		</Pane>
		<Pane>
			<Splitpanes horizontal={true}>
				<Pane snapSize={3}>
					<!--Render Preview Screen-->
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
