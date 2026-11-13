<script lang="ts">
	let { label, value = $bindable() }: { label: string; value: string } = $props();
</script>

<label class="color-property">
	<p class="label">{label}</p>
	<input type="color" class="color-input" bind:value />
</label>

<style>
	.color-property {
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
		align-items: center;
        gap: 20px;
	}

	.label {
		color: var(--text);
		user-select: none;
	}

	.color-input {
		border-radius: 8px;
		padding: 2px;
        padding-left: 5px;
		box-shadow: none;
        margin-left: auto;
        width: 80px;
		background-color: transparent;

		&:active,
		&:focus {
			border-color: var(--secondary);
		}
	}
</style>
