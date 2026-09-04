<script lang="ts">
    import { appState } from "../AppState.svelte.ts";
</script>

<svelte:head>
    <title>Home | DNA Animator</title>
</svelte:head>

<h1>Home</h1>
<p>Current Theme: {appState.config.theme}</p>
<button onclick={() => {
    let themeToChangeTo = appState.config.theme;
    if (themeToChangeTo >= 2) {
        themeToChangeTo = 0;
    } else {
        themeToChangeTo++;
    }
    appState.ChangeTheme(themeToChangeTo);
}}>Change Theme</button>
<a href="/rig-tester">Go To Rig Tester</a>