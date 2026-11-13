<script lang="ts">
	import type { RigGroup } from '../../DNARig';
	import downArrowIcon from '$lib/assets/down-arrow-icon-white.png';

	let {
		label,
		value = $bindable(),
		rigGroups
	}: { label: string; value: string; rigGroups: RigGroup[] } = $props();
	let expanded = $state(false);
</script>

<label class="group-property">
	<span class="header">
		<p class="label">{label}</p>
	</span>
	<button class="group-button {expanded?"expanded":""}" onclick={() => {
        expanded = !expanded;
    }}>
		<p>{value}</p>
		<img class="expand-arrow-icon {expanded?"expanded":""}" src={downArrowIcon} alt="expand/collapse arrow" />
	</button>
	{#if expanded}
		<div class="group-dropdown-menu">
			{#each rigGroups as group}
				<button class="group-option-button" onclick={() => {
                    value = group.id;
                    expanded = false;
                }}>{group.id}</button>
			{/each}
            <button class="group-option-button" onclick={() => {
                value = "";
                expanded = false;
            }}>None</button>
		</div>
	{/if}
</label>

<style>
	.group-property {
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

		.label {
			color: var(--text);
			user-select: none;
		}
	}

    .group-button {
        display: flex;
        align-items: center;
        border: solid 1px var(--border);
        border-radius: 12px;
        padding: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
        gap: 10px;
        width: 97%;
        margin-top: 5px;

        &.expanded {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-bottom: none;
        }

        .expand-arrow-icon {
            width: 15px;
            height: 10px;
            margin-left: auto;
            filter: var(--img-filter);
            transform: rotate(-90deg);

            &.expanded {
                transform: none;
            }
        }
    }

    .group-dropdown-menu {
        width: 97%;
        border: solid 1px var(--border);
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        border-top: none;
        display: flex;
        flex-direction: column;
        

        .group-option-button {
            border-top: solid 1px var(--border);
        }
    }
</style>
