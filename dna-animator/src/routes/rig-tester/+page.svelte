<!--RIG PLAYGROUND/TESTER-->
<script lang="ts">
	import { onDestroy } from 'svelte';
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

	registerHeaderActions({
		file: [
			{
				id: 'importRig',
				action: () => {console.log("Import Rig!");}
			},
			{
				id: 'newRig',
				action: () => {console.log("New Rig!");}
			},
			{
				id: 'saveRig',
				action: () => {console.log("Save Rig!");}
			},
			{
				id: 'saveRigAs',
				action: () => {console.log("Save Rig As!");}
			},
			{
				id: 'openInFileExplorer',
				action: () => {console.log("Open File Explorer!");}
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
				id: 'togglePropertiesExplorer',
				action: () => {console.log("Toggle Props Explorer!");}
			},
			{
				id: 'toggleDraggableIndicators',
				action: () => {console.log("Toggle Drag Indicators!");}
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
            }
        ]
	});
	onDestroy(() => registerHeaderActions({})); //clears the registered actions obviously
</script>

<svelte:head>
	<title>Rig Playground</title>
</svelte:head>

<h1>Helix Rig Tester And Playground</h1>
<p>Current Theme: {Theme[appState.config.theme]}</p>
<button
	onclick={() => {
		let themeToChangeTo = appState.config.theme;
		if (themeToChangeTo >= 2) {
			themeToChangeTo = 0;
		} else {
			themeToChangeTo++;
		}
		appState.ChangeTheme(themeToChangeTo);
	}}>Change Theme</button
>
