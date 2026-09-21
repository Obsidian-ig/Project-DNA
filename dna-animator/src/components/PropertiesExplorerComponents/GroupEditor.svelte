<script lang="ts">
	import trashIcon from '$lib/assets/trash-icon-white.png';
	import type { RigGroup } from '../../DNARig';

	let { value = $bindable() }: { value: RigGroup[] } = $props();
</script>

<div class="groupeditor-property">
	<span class="header">
		<p>Rig Groups</p>
	</span>
	{#each value as group, valueIndex}
		<div class="group-option-container">
			<input type="text" class="text-input" bind:value={group.id} />
			<button
				class="group-option-delete-button"
				onclick={() => {
					value.splice(valueIndex, 1);
				}}
			>
				<img class="trash-icon" src={trashIcon} alt="Delete" />
			</button>
		</div>
	{/each}
	<button
		class="add-group-option-button"
		onclick={() => {
			let numberToUse = 0;
			value.forEach((group) => {
				if (group.id.includes('Group ')) {
					let splitGroup = group.id.split(' ');
					if (splitGroup.length > 1) {
                        let parsedNumber = Number.parseInt(splitGroup[splitGroup.length - 1]);
                        if (parsedNumber != null && parsedNumber != undefined) { numberToUse = parsedNumber + 1; }
					}
				}
			});
			value.push({
				id: ('Group ' + numberToUse.toString()),
				expanded: false
			});
		}}>+</button
	>
</div>

<style>
	.groupeditor-property {
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
	}

	.group-option-container {
		display: flex;
		width: 97%;
		margin-top: 5px;

		.group-option-delete-button {
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

	.add-group-option-button {
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
