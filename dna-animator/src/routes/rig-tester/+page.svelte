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
	import { onDestroy, onMount } from 'svelte';
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
	import 'dockview/dist/styles/dockview.css';
	import {
		createDockview,
		type IContentRenderer,
		type GroupPanelPartInitParameters,
		themeAbyss
	} from 'dockview';

	registerHeaderActions({
		file: [
			{
				id: 'importRig',
				action: () => {
					console.log('Import Rig!');
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

	class MyPanel implements IContentRenderer {
		private readonly _element: HTMLElement;

		get element() {
			return this._element;
		}

		constructor() {
			this._element = document.createElement('div');
		}

		init(params: GroupPanelPartInitParameters) {
			this._element.textContent = params.params?.title ?? 'Panel';
		}
	}

	let appContainer: HTMLDivElement | undefined = $state();
	let dockViewAPI = null;
	$effect(() => {
        if (!appContainer) return;
		dockViewAPI = createDockview(document.getElementById('app')!, {
			theme: themeAbyss,
			createComponent: (options) => new MyPanel()
		});
		dockViewAPI.addPanel({
			id: 'rig-tree',
			component: 'default',
			title: 'Rig Tree',
            renderer: "onlyWhenVisible"
		});
		dockViewAPI.addPanel({
			id: 'props-explorer',
			component: 'default',
			title: 'Properties Explorer',
			position: {
				referencePanel: 'rig-tree',
				direction: 'right'
			},
            renderer: "onlyWhenVisible"
		});
	});
</script>

<svelte:head>
	<title>Rig Playground</title>
</svelte:head>

<div class="app" id="app" bind:this={appContainer}></div>
