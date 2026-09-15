<script lang="ts">
	import type { RigEnum } from '../../DNARig';
	import trashIcon from '$lib/assets/trash-icon-white.png';

	let { label, value = $bindable() }: { label: string; value: RigEnum } = $props();
</script>

<div class="enumeditor-property">
	<span class="header">
		<input type="text" class="text-input" bind:value={value.id} spellcheck="false" />
	</span>
	{#each value.allowed_values as allowedValue, valueIndex}
		<div class="enum-option-container">
			<input type="text" class="text-input" bind:value={value.allowed_values[valueIndex]} />
			<button
				class="enum-option-delete-button"
				onclick={() => {
					value.allowed_values.splice(valueIndex, 1);
				}}
			>
				<img class="trash-icon" src={trashIcon} alt="Delete" />
			</button>
		</div>
	{/each}
	<button
		class="add-enum-option-button"
		onclick={() => {
			value.allowed_values.push('');
		}}>+</button
	>
</div>

<style>
	.enumeditor-property {
		background-color: var(--bg-light);
		padding: 5px;
		border-radius: 5px;
		border: solid 1px var(--border);
		position: relative;
		min-width: fit-content;
		width: 100%;
		text-wrap: nowrap;
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		align-items: center;
	}

	.header {
		display: flex;
		width: 95%;
		border-bottom: solid 1px var(--border-muted);
		border-radius: 1px;
        padding-bottom: 5px;

        input {
            border: none;
        }
	}

	.enum-option-container {
		display: flex;
		width: 97%;
        margin-top: 5px;

		.enum-option-delete-button {
			margin-top: 3px;
			height: 30px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;

			.trash-icon {
				height: 25px;
				filter: var(--img-filter);
			}
		}
	}
	.text-input {
		margin-top: 5px;
		width: 96%;
		height: 30px;
		border-radius: 8px;
		padding: 2px;
		box-shadow: none;
		background-color: transparent;

		&:active,
		&:focus {
			border-color: var(--secondary);
		}
	}

	.add-enum-option-button {
		width: 97%;
		border: solid 1px var(--border);
		border-radius: 8px;
		margin-top: 10px;
		cursor: pointer;
		transition: ease-in-out 0.2s;

		&:hover {
			background-color: var(--bg-light);
		}
		&:active {
			transform: scale(0.9);
		}
	}
</style>
