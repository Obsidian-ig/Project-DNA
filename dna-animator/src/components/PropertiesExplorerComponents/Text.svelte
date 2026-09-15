<script lang="ts">
	let { label, value = $bindable() }: { label: string; value: string } = $props();
</script>

<label class="text-property">
	<span class="header">
		<p class="label">{label}</p>
	</span>
	<input type="text" class="text-input" bind:value />
</label>

<style>
	.text-property {
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

    .text-input {
        margin-top: 5px;
        width: 96%;
        border-radius: 8px;
        padding: 2px;
        box-shadow: none;
		background-color: transparent;

        &:active,
        &:focus {
            border-color: var(--secondary);
        }
    }
</style>
