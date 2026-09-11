<script lang="ts">
	import type { File } from 'node:buffer';

	interface RigVector2 {
		x: number;
		y: number;
	}
    const RigPath2InterpolationType = {
        Linear: "Linear",
        QuadraticBezierCurve: "QuadraticBezierCurve",
        CubicBezierCurve: "CubicBezierCurve"
    } as const;
    type RigPath2InterpolationType = typeof RigPath2InterpolationType[keyof typeof RigPath2InterpolationType];
    interface RigPath2 {
        point_one: RigVector2;
        point_two: RigVector2;
        interpolation_type: RigPath2InterpolationType
    }
	interface RigElement {
		name: string;
		offsets: {
			position: RigVector2;
			rotation: RigVector2;
			scale: RigVector2;
		};
		position: RigVector2;
		rotation: RigVector2;
		scale: RigVector2;
        transform_origin: RigVector2; // the origin point in which modifications happen. idk how this works/how to implement it tho
        paths: RigPath2[];
        fill_color: string;
        
	}
	interface RigObject {
		name: string;
        rig_version: number, //the version of the rig itself
        rig_structure_version: number, //the version of the rig data structure it uses.
		base: {
			// essentially the initial "offsets" of the rig. The initial values everything else is based off of.
			starting_position: RigVector2;
			starting_rotation: RigVector2;
			starting_scale: RigVector2;
		};
		position: RigVector2;
		rotation: RigVector2;
		scale: RigVector2;
		elements: RigElement[];
        //add animations field/data types later
	}

	let { rigFile }: { rigFile: File | null } = $props();
    let rigObject: RigObject | null | undefined = null;
	$effect(() => {
		if (rigFile !== null) {
			console.log('Rig Tree => Received new rig!');
			async function GetFileTextAndUpdateRigObject() {
                const rigFileContent = await rigFile?.text();
                if (!rigFileContent) return;
                function ConvertRigDataIntoObject<T extends object>(data: T): RigObject & T {
                    let finishedObject: RigObject = {
                        name: (data as any)?.name ?? "null",
                        rig_version: (data as any)?.rig_version ?? 0,
                        rig_structure_version: (data as any)?.rig_structure_version ?? 0,
                        base: (data as any)?.base ?? {starting_position: {x: 0.0, y: 0.0}, starting_rotation: {x: 0.0, y: 0.0}, starting_scale: {x: 0.0, y: 0.0}},
                        position: (data as any)?.position ?? {x: 0.0, y: 0.0},
                        rotation: (data as any)?.rotation ?? {x: 0.0, y: 0.0},
                        scale: (data as any)?.scale ?? {x: 0.0, y: 0.0},
                        elements: (data as any)?.elements ?? [],
                    };
                    return {
                        ...data,
                        ...finishedObject
                    };
                }
                const rawData = JSON.parse(rigFileContent);
				rigObject = ConvertRigDataIntoObject(rawData);
                console.log(rigObject);
			}
			GetFileTextAndUpdateRigObject();
		}
	});
</script>

<div class="header">
	<h1>Rig Tree</h1>
</div>

<style>
	.header {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--bg-dark);
	}
</style>
