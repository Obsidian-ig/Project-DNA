<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { appState, HeaderType, type PageConfig } from '../AppState.svelte';
	import Header from './header.svelte';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
    import { platformApi } from '../PlatformApi';
    import { appDataDir, join } from '@tauri-apps/api/path';

	let { children } = $props();
	let debounce = false;
	let debounceTimer: any;

	$effect(() => {
		const states = $state.snapshot(appState.pageStates);
		const config = $state.snapshot(appState.config);
		untrack(() => {
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(async () => {
				if (!debounce) {
					debounce = true;
					console.log('Started debounce!');
				} else {
					if (!await platformApi.saveOrCreateFile(await join(await appDataDir(), "page_states.json"), JSON.stringify(states))) {
						console.error("Failed to save page states to file!");
					}
					if (!platformApi.saveOrCreateFile(await join(await appDataDir(), "app_config.json"), JSON.stringify(config))) {
						console.error("Failed to save app config to file!");
					}
					appState.UpdateTheme();
					debounce = false;
					console.log('Ended debounce!');
					console.log('Saved pageStates to local storage!');
				}
			}, 100);
		});
		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#if !appState.loading}
	<Header pageConfig={page.data as PageConfig} />
	<div class="content">
		{@render children()}
	</div>
{:else}
	<div class="loading-screen">
		<h1>Loading</h1>
		<h2 class="loading-error-message">{appState.loadingErrorMessage ?? ''}</h2>
	</div>
{/if}

<style>
	.loading-screen {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.loading-error-message {
			color: red;
			max-width: 45ch;
			text-align: center;
		}
	}
</style>
