<script lang="ts">
	let { label, valueToShow, onValueChanged, currentErrors }: { label: string; valueToShow: string, onValueChanged: (value: string) => void, currentErrors: string[] } = $props();

	function WaitUntilUserDoneTyping<T extends (...args: any[]) => void>(func: T, delay = 500) {
		let timer: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(timer);
			timer = setTimeout(() => func(...args), delay);
		};
	}

	const HandleTextInput = WaitUntilUserDoneTyping((e) => {
		onValueChanged(e.target.value);
	}, 500);
</script>

<label class="text-property">
	<span class="header">
		<p class="label">{label}</p>
	</span>
	<input type="text" class="text-input" oninput={HandleTextInput} value={valueToShow} />
	<ul class="errors-list">
		{#each currentErrors as error}
			{console.log(error)}
			<li class="error-item">
				{error}
			</li>
		{/each}
	</ul>
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

	.errors-list {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding-left: 40px;
		list-style: circle;

		.error-item {
			color: red;
		}
	}
</style>
