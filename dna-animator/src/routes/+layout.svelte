<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { appState, HeaderType, type PageConfig } from '../AppState.svelte';
	import Header from './header.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	$effect(() => {
		console.log('Saved pageStates to local storage!');
		localStorage.setItem('pageStates', JSON.stringify(appState.pageStates));
		localStorage.setItem('appConfig', JSON.stringify(appState.config));
		appState.UpdateTheme();
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
