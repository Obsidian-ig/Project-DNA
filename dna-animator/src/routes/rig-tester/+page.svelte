<!--RIG PLAYGROUND/TESTER-->
<script lang="ts">
	import { onDestroy } from "svelte";
    import { appState, Theme } from "../../AppState.svelte.ts";
    import { registerHeaderActions } from "../header-actions-svelte.js";

    registerHeaderActions({
        importRig () {},
        newRig() {},
        saveRig() {},
        saveRigAs() {},
        openInFileExplorer() {},
        togglePropertiesExplorer() {},
        toggleDraggableIndicators() {}
    });
    onDestroy(() => registerHeaderActions({})); //clears the registered actions obviously
</script>

<svelte:head>
    <title>Rig Playground | DNA Animator</title>
</svelte:head>

<h1>Helix Rig Tester And Playground</h1>
<p>Current Theme: {Theme[appState.config.theme]}</p>
<button onclick={() => {
    let themeToChangeTo = appState.config.theme;
    if (themeToChangeTo >= 2) {
        themeToChangeTo = 0;
    } else {
        themeToChangeTo++;
    }
    appState.ChangeTheme(themeToChangeTo);
}}>Change Theme</button>