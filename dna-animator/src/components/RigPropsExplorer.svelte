<script lang="ts">
	import { appState } from '../AppState.svelte';
	import type { RigObject, RigEnum, RigVector2 } from '../DNARig';
	import Boolean from './PropertiesExplorerComponents/Boolean.svelte';
	import Enum from './PropertiesExplorerComponents/Enum.svelte';
	import Number from './PropertiesExplorerComponents/Number.svelte';
	import Text from './PropertiesExplorerComponents/Text.svelte';
	import VectorTwo from './PropertiesExplorerComponents/VectorTwo.svelte';
    import type { File } from 'node:buffer';

	let { rigFile }: { rigFile: File | null } = $props();
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let selectedNode = $derived(appState.rigPlaygroundState.selectedNode);
	$effect(() => {
		if (rigFile) {
			console.log('Rig Tree => Received new rig!');
			async function GetFileTextAndUpdateRigObject() {
				const rigFileContent = await rigFile?.text();
				if (!rigFileContent) return;
				function ConvertRigDataIntoObject<T extends object>(data: T): RigObject & T {
					let finishedObject: RigObject = {
						name: (data as any)?.name ?? 'null',
						expanded: (data as any)?.expanded,
						rig_version: (data as any)?.rig_version ?? 0,
						rig_structure_version: (data as any)?.rig_structure_version ?? 0,
						base: (data as any)?.base ?? {
							starting_position: { x: 0.0, y: 0.0 },
							starting_rotation: { x: 0.0, y: 0.0 },
							starting_scale: { x: 0.0, y: 0.0 }
						},
						position: (data as any)?.position ?? { x: 0.0, y: 0.0 },
						rotation: (data as any)?.rotation ?? { x: 0.0, y: 0.0 },
						scale: (data as any)?.scale ?? { x: 0.0, y: 0.0 },
						elements: (data as any)?.elements ?? [],
						enums: (data as any)?.enums ?? []
					};
					return {
						...data,
						...finishedObject
					};
				}
				const rawData = JSON.parse(rigFileContent);
				rigObject = ConvertRigDataIntoObject(rawData);
				console.log(rigObject);
				appState.UpdateRigPlaygroundStateLoadedRig(rigObject);
			}
			GetFileTextAndUpdateRigObject();
		}
	});
</script>

<div class="header">
	<h1>Properties Explorer</h1>
</div>
<div class="props-container"></div>

<style>
	.header {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--bg-dark);
		text-overflow: ellipsis;
		text-wrap: nowrap;
		user-select: none;
	}
	.props-container {
		display: flex;
		flex-direction: column;
		padding: 15px;
		padding-bottom: 100px;
		gap: 10px;
		overflow-y: auto;
		overflow-x: hidden;
		height: 100%;
	}
</style>
