<script lang="ts">
	import gridPattern from '$lib/assets/grid-pattern.jpg';
	import { onMount } from 'svelte';
	import { appState } from '../AppState.svelte';
	import type { RigVector2 } from '../DNARig';
	import { scale } from 'svelte/transition';

	let canvas: HTMLCanvasElement;
	let displayWidth = $state(0);
	let displayHeight = $state(0);
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	$effect(() => {
		if (!canvas || !rigObject) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, displayWidth, displayHeight);

        let displayOrigin: RigVector2 = {
            x: displayWidth / 2,
            y: displayHeight / 2
        };
        let displayShortestSide = Math.min(displayWidth, displayHeight);
        const scaleUnit = displayShortestSide / 200; //fixed "grid" of 200x200 "pixels" -100 <-> +100

		let virtualRigCenter: RigVector2 = {
			x: rigObject.base.starting_position.x + rigObject.position.x,
			y: rigObject.base.starting_position.y + rigObject.position.y
		};
        let physicalRigCenter: RigVector2 = {
            x: displayOrigin.x + (virtualRigCenter.x * scaleUnit),
            y: displayOrigin.y + (virtualRigCenter.y * scaleUnit)
        };

        function CalculatePhysicalPositionFromRigCenter(point: RigVector2): RigVector2 {
            return {
                x: physicalRigCenter.x + point.x * scaleUnit,
                y: physicalRigCenter.y + point.y * scaleUnit
            }
        }

		rigObject?.elements.forEach((element) => {
			element.points.forEach((point, index) => {
                ctx.beginPath();
                let calculatedPosition = CalculatePhysicalPositionFromRigCenter(point.point);
				ctx.arc(calculatedPosition.x, calculatedPosition.y, 1.5 * scaleUnit, 0, 2 * Math.PI);
                ctx.fillStyle = element.fill_color;
                ctx.fill();
                ctx.moveTo(calculatedPosition.x, calculatedPosition.y);
                if (index === element.points.length - 1) {
                    if (element.closed) {
                        let endPointCalculatedPosition = CalculatePhysicalPositionFromRigCenter(element.points[0].point);
                        ctx.lineTo(endPointCalculatedPosition.x, endPointCalculatedPosition.y);
                    }
                } else {
                    let nextPointCalculatedPosition = CalculatePhysicalPositionFromRigCenter(element.points[index + 1].point);
                    ctx.lineTo(nextPointCalculatedPosition.x, nextPointCalculatedPosition.y);
                }
                ctx.strokeStyle = "rgb(255, 255, 255)";
                ctx.stroke();
			});
		});
	});
</script>

<div class="display-container" style="background-image: url({gridPattern});">
	<canvas
		id="rig-display"
		bind:this={canvas}
		bind:clientWidth={displayWidth}
		bind:clientHeight={displayHeight}
		width={displayWidth}
		height={displayHeight}
	></canvas>
</div>

<style>
	.display-container {
		width: 100%;
		height: 100%;
		background-color: var(--bg-dark);
		background-size: cover;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#rig-display {
		background-color: black;
		width: 75%;
		aspect-ratio: 1;
		border-radius: 50%;
	}
</style>
