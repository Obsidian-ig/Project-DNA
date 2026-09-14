<script lang="ts">
	let { label, value = $bindable() }: { label: string; value: number } = $props();
</script>

<label class="number-property">
	<p class="label">{label}</p>
	<input type="number" class="number-input" bind:value />
</label>

<style>
	.number-property {
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

		&:hover {
			background-color: var(--highlight);
		}
	}

	.label {
		color: var(--text);
		user-select: none;
	}

	.number-input {
		border-radius: 8px;
		padding: 2px;
        padding-left: 5px;
		box-shadow: none;
        margin-left: auto;
        width: 80px;

		&:active,
		&:focus {
			border-color: var(--secondary);
		}
	}
</style>
