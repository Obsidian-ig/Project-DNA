<!--The global header for DNA Animator-->
<script lang="ts">
	import logo from '$lib/assets/DNA Animator Logo.svg';
	import { resolve } from '$app/paths';
	import { appState, Theme, Page } from '../AppState.svelte';


    appState.GetCurrentPage();
	let showDropdownMenu = $state(false);
	let selectedOption: string | null = $state(null); // "file", "edit", "view", "options"
    let currentOptions: {name: string, onclick: () => void}[] = $state([]);
	const fileOptions = [
		{
			name: 'Open File',
			onclick: () => {
				console.log("Open File");
			}
		}
	];
    const editOptions = [
		{
			name: 'Open File',
			onclick: () => {
				//open the file select prompt/file explorer
			}
		}
	];
    const viewOptions = [
		{
			name: 'Open File',
			onclick: () => {
				//open the file select prompt/file explorer
			}
		}
	];
    const optionsOptions = [
		{
			name: 'Open File',
			onclick: () => {
				//open the file select prompt/file explorer
			}
		}
	];

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
        //selectedOption changed
        switch (selectedOption) {
            case "file":
                currentOptions = fileOptions;
                break;
            case "edit":
                currentOptions = editOptions;
                break;
            case "view":
                currentOptions = viewOptions;
                break;
            case "options":
                currentOptions = optionsOptions;
                break;
        }
    });
</script>

<nav class="navbar">
	<a href={resolve('/')}><img class="logo-icon" src={logo} alt="logo" /></a>
	<div class="navbar-buttons-container" id="navbar-buttons-container">
		<button
			class="navbar-button"
			class:option-selected={selectedOption === 'file'}
			id="navbar-file"
			onclick={() => HandleSelected('file')}
			onmouseenter={() => HandleHovered('file')}><span>File</span></button
		>
		<button
			class="navbar-button"
			class:option-selected={selectedOption === 'edit'}
			id="navbar-edit"
			onclick={() => HandleSelected('edit')}
			onmouseenter={() => HandleHovered('edit')}><span>Edit</span></button
		>
		<button
			class="navbar-button"
			class:option-selected={selectedOption === 'view'}
			id="navbar-view"
			onclick={() => HandleSelected('view')}
			onmouseenter={() => HandleHovered('view')}><span>View</span></button
		>
		<button
			class="navbar-button"
			class:option-selected={selectedOption === 'options'}
			id="navbar-options"
			onclick={() => HandleSelected('options')}
			onmouseenter={() => HandleHovered('options')}><span>Options</span></button
		>
	</div>
</nav>
{#if showDropdownMenu}
    <button class="click-off-container" aria-label="Close Dialogue" onclick={() => {
        showDropdownMenu = false;
        selectedOption = null;
    }}>
    </button>
    <div class="navbar-option-dropdown">
        <ul class="dropdown-options-list">
            {#each currentOptions as option (option.name) }
                <li class="option-item">
                    <button class="option-button" onclick={option.onclick}>{option.name}</button>
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
</style>
