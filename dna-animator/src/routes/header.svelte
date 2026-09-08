<!--The global header for DNA Animator-->
<script lang="ts">
	import logo from '$lib/assets/DNA Animator Logo.svg';
	import windowIcon from '$lib/assets/square-icon-white.png';
	import { resolve } from '$app/paths';
	import { appState, Theme, Page, HeaderType } from '../AppState.svelte';
	import { headerActions } from './header-actions.svelte.ts';
	import type { HeaderActionsPanels } from './header-actions.svelte.ts';
	import type { PageConfig } from '../AppState.svelte';

	let showDropdownMenu = $state(false);
	let selectedOption: string | null = $state(null); // "file", "edit", "view", "options"
	let { pageConfig } : { pageConfig: PageConfig } = $props();

	function HandleSelected(option: string) {
		selectedOption = option;
		showDropdownMenu = true;
	}
	function HandleHovered(option: string) {
		if (showDropdownMenu) {
			selectedOption = option;
		}
	}

	$effect(() => {
		let placeholder = pageConfig;
		//page config changed -> is new page!
		showDropdownMenu = false;
		selectedOption = null;
	})
</script>

<nav class="navbar">
	<a href={resolve('/')}><img class="logo-icon" src={logo} alt="logo" /></a>
	<div class="navbar-buttons-container" id="navbar-buttons-container">
		{#if pageConfig.header.menu.type === HeaderType.File}
			{#each pageConfig.header.menu.panels as panel (panel.name)}
				<button
					class="navbar-button"
					class:option-selected={selectedOption === panel.name}
					id="navbar-{panel.name}"
					onclick={() => HandleSelected(panel.name)}
					onmouseenter={() => HandleHovered(panel.name)}><span>{panel.name}</span>
				</button>
			{/each}
		{/if}
	</div>
	<p class="navbar-title">{pageConfig.title}</p>
	<div class="navbar-window-buttons-container">
		<button class="navbar-window-button" onclick={() => {
			window.electronAPI?.minimizeWindow();
		}}>_</button>
		<button class="navbar-window-button" aria-label="Restore or Maximize" onclick={async () => {
			let isFullscreen = await window.electronAPI.isFullscreen();
			let isMaximized = await window.electronAPI.isMaximized();
			if (isFullscreen || isMaximized) {
				window.electronAPI.restoreWindow();
				console.log("Was fullscreen!");
			} else {
				window.electronAPI.maximizeWindow();
				console.log("Was not fullscreen!");
			}
		}}>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
	</button>
		<button class="navbar-window-button" onclick={() => {
			window.electronAPI.closeWindow();
		}}>X</button>
	</div>
</nav>
{#if showDropdownMenu}
	<button
		class="click-off-container"
		aria-label="Close Dialogue"
		onclick={() => {
			showDropdownMenu = false;
			selectedOption = null;
		}}
	>
	</button>
	<div class="navbar-option-dropdown">
		<ul class="dropdown-options-list">
			{#each pageConfig.header.menu.panels.find(p => p.name === selectedOption)?.options as option (option.id)}
				<li class="option-item">
					<button class="option-button" onclick={() => {
						//find da action
						const currentPanel = headerActions?.current?.[selectedOption?.toLowerCase() as keyof HeaderActionsPanels]; //(?.[index]?.action) ?? (() => {})
						const panelAction = currentPanel?.find(a => a.id === option.id);
						panelAction?.action();
					}}>{option.label}</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.navbar {
		display: flex;
		align-items: center;
		position: fixed;
		top: 0;
		width: 100%;
		height: 35px;
		background-color: var(--bg-light);
		padding-left: 10px;
		box-shadow: black 0px -5px 10px;
		z-index: 3;
		-webkit-app-region: drag;

		.logo-icon {
			width: 30px;
			height: 30px;
		}
		* {
			-webkit-app-region: no-drag;
		}
	}

	.navbar-buttons-container {
		margin-left: 15px;

		.navbar-button {
			padding: 2px;
			padding-left: 15px;
			padding-right: 15px;
			height: fit-content;
			border-radius: 4px;

			&:hover {
				background-color: var(--primary);

				span {
					filter: invert(1);
				}
			}
			&.option-selected {
				anchor-name: --navbar-selected-option;
				background-color: var(--primary);
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
			}
		}
	}

	.navbar-option-dropdown {
		position: absolute;
		position-anchor: --navbar-selected-option;
		top: anchor(bottom);
		left: anchor(left);
		width: 200px;
		height: 400px;
		background-color: var(--highlight);
		z-index: 3;
	}

	.navbar-title {
		position: absolute;
		left: 50%;
		transform: translateX(calc(-50% - 2ch));
		padding: 0;
		margin: 0;
		user-select: none;
		-webkit-app-region: drag;
	}
	.navbar-window-buttons-container {
		display: flex;
		margin-left: auto;
		gap: 5px;
		position: relative;

		button {
			cursor: pointer;
			width: 35px;
			min-height: 100%;
			padding: 5px;
			display: flex;
			justify-content: center;

			&:hover {
				backdrop-filter: brightness(3);
			}

			svg {
				stroke-width: 2px;
				width: 15px;
				height: 15px;
				stroke: var(--text);
				margin-top: 5px;
			}
		}
	}
</style>
