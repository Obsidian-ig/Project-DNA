<!--The global header for DNA Animator-->
<script lang="ts">
	import logo from '$lib/assets/DNA Animator Logo.svg';
	import { resolve } from '$app/paths';
    import { appState, Theme, Page } from '../AppState.svelte';

	let showDropdownMenu = false;
	let selectedOption: string | null = $state(null); // "file", "edit", "view", "options"
    const fileOptions = [
        {
            name: "Open File",
            onclick: () => {
                //open the file select prompt/file explorer
            }
        },
        {
            name: "Open File",
            onclick: () => {
                //open the file select prompt/file explorer
            }
        }
    ];

	function HandleSelected(option: string) {
		selectedOption = option;
		/*
        let element = document.getElementById("navbar-" + selectedOption);
        if (element) {
            element.className = "navbar-button selected";
        }*/
	}
	function HandleHovered(option: string) {
		if (showDropdownMenu) {
			selectedOption = option;
		}
	}

    //selected navbar option has changed
	$effect(() => {
		let element = document.getElementById('navbar-' + selectedOption);
		if (element) {
			element.className = 'navbar-button selected';
		} else {
			console.log('Unable to find navbar button element! ' + selectedOption);
		}
	});
</script>

<nav class="navbar">
	<a href={resolve('/')}><img class="logo-icon" src={logo} alt="logo" /></a>
	<div class="navbar-buttons-container">
		<button
			class="navbar-button"
			id="navbar-file"
			onclick={() => HandleSelected('file')}
			onmouseenter={() => HandleHovered('file')}><span>File</span></button
		>
		<button
			class="navbar-button"
			id="navbar-edit"
			onclick={() => HandleSelected('edit')}
			onmouseenter={() => HandleHovered('edit')}><span>Edit</span></button
		>
		<button
			class="navbar-button"
			id="navbar-view"
			onclick={() => HandleSelected('view')}
			onmouseenter={() => HandleHovered('view')}><span>View</span></button
		>
		<button
			class="navbar-button"
			id="navbar-options"
			onclick={() => HandleSelected('options')}
			onmouseenter={() => HandleHovered('options')}><span>Options</span></button
		>
	</div>
</nav>
{#if showDropdownMenu}
	<div class="navbar-option-dropdown"></div>
{/if}

{#snippet FileOptions}
    <ul class="option-dropdown-list">
        
    </ul>
{/snippet}

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

		.logo-icon {
			width: 30px;
			height: 30px;
		}
	}

	.navbar-buttons-container {
		margin-left: 10px;

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

			&.selected {
				anchor-name: --navbar-selected-option;
			}
		}
	}

	.navbar-option-dropdown {
		position-anchor: --navbar-selected-option;
	}
</style>
