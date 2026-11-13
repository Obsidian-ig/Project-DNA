<script lang="ts">
	import type { Snippet } from "svelte";

    let {children, label}:{children: Snippet; label: string} = $props();
</script>

<div class="section-container">
    <div class="section-header">
        <p class="section-label">{label}</p>
    </div>
    <div class="section-body">
        {@render children()}
    </div>
</div>

<style>
    .section-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: fit-content;
        padding-bottom: 10px;
    }

    .section-header {
        border-bottom: solid 1px var(--border-muted);
    }

    .section-body {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>