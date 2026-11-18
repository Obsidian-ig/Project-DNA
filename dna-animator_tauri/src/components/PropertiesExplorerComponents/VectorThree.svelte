<script lang="ts">
	import type { RigVector3 } from "../../DNARig";

	let { label, value = $bindable() }: { label: string; value: RigVector3 } = $props();
</script>

<div class="vectorthree-property">
	<span class="header">
		<p class="label">{label}</p>
	</span>
	<div class="xy-inputs-container">
        <div class="input-container">
            <p class="input-label">X:</p>
            <input type="number" class="vectorthree-input" bind:value={value.x} title="X Value" />
        </div>
        <div class="input-container">
            <p class="input-label">Y:</p>
            <input type="number" class="vectorthree-input" bind:value={value.y} title="Y Value" />
        </div>
        <div class="input-container">
            <p class="input-label">Z:</p>
            <input type="number" class="vectorthree-input" bind:value={value.z} title="Z Value" />
        </div>
    </div>
</div>

<style>
	.vectorthree-property {
		background-color: var(--bg-light);
		padding: 5px;
		border-radius: 5px;
		border: solid 1px var(--border);
		position: relative;
		width: 100%;
        min-width: fit-content;
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
            min-width: fit-content;

		}
	}

    .xy-inputs-container {
        display: flex;
        gap: 15px;
        min-width: 0;
        width: 100%;
    }

    .input-container {
        display: flex;
        align-items: center;
        min-width: 0;
        width: 100%;

        .input-label {
            border: solid 1px var(--border);
            height: 80%;
            border-right: none;
            margin-top: 5px;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            padding-left: 5px;
            padding-right: 5px;
            border-right: solid 1px var(--border-muted);
        }
    }

    .vectorthree-input {
        min-width: 0;
        width: 60px;
        flex: 1 1 0px;
        height: 80%;
        margin-top: 5px;
        padding: 2px;
        padding-left: 5px;
        border-radius: 8px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
        border-color: var(--border);
        box-shadow: none;
        background-color: transparent;

        &:active,
        &:focus {
            border-color: var(--secondary);
        }
    }
</style>
