<!--RIG PLAYGROUND/TESTER-->
<script lang="ts">
    import { appState, Theme } from "../../AppState.svelte.ts";
    
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