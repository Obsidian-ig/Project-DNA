<script lang="ts">
	let { label, value = $bindable() }: { label: string; value: boolean } = $props();

	$effect(() => {
		console.log('Changed Value: ' + value);
	});
</script>

<label class="boolean-property">
	<p class="label">{label}</p>
	<span class="checkbox-container">
		<input type="checkbox" class="checkbox-toggle" bind:checked={value} />
	</span>
</label>

<style>
	.boolean-property {
		display: flex;
		background-color: var(--bg-light);
		padding: 5px;
		border-radius: 5px;
		border: solid 1px var(--border);
		position: relative;
		min-width: 100%;
		width: fit-content;
		gap: 20px;
	}

	.label {
		color: var(--text);
		user-select: none;
	}

	.checkbox-container {
		margin-left: auto;
		background-color: var(--bg-dark);
		width: 50px;
		height: 95%;
		border-radius: 5px;
		position: relative;

		&:has(.checkbox-toggle:checked) {
			background-color: var(--primary);
			transition: ease-in-out 0.1s;
		}

		&::after {
			content: '';
			width: 18px;
			height: 18px;
			background-color: var(--text);
			border-radius: 50%;
			z-index: 2;
			position: absolute;
			margin-top: 2.5px;
			left: 5px;
			transition: ease-in-out 0.1s;
		}

		&:has(.checkbox-toggle:checked)::after {
			left: calc(100% - (18px + 5px));
			filter: invert(1);
		}

		.checkbox-toggle {
			opacity: 0;
		}
	}
</style>
