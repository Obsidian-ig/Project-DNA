<script lang="ts">
	import gridPattern from '$lib/assets/grid-pattern.jpg';
	import { appState } from '../AppState.svelte';
	import type { RigElement, RigVector2 } from '../DNARig';

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
			x: displayOrigin.x + virtualRigCenter.x * scaleUnit,
			y: displayOrigin.y + virtualRigCenter.y * scaleUnit
		};

		function DrawElement(element: RigElement) {
			if (!ctx) return;
			ctx.beginPath();
			if (element.points.length <= 2) return;
			let elementCalculatedPosition = CalculatePhysicalPositionFromRigCenter({
				x: element.position.x + element.offsets.position.x,
				y: element.position.y + element.offsets.position.y
			});
			let calculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
				element.points[0].point,
				elementCalculatedPosition
			);

			ctx.moveTo(calculatedPosition.x, calculatedPosition.y);
			for (let i = 1; i < element.points.length; i++) {
				calculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(element.points[i].point, elementCalculatedPosition);
				ctx.lineTo(calculatedPosition.x, calculatedPosition.y);
			}
			ctx.closePath();
			ctx.fillStyle = element.fill_color;
			ctx.fill();
		}

		function CalculatePhysicalPositionFromRigCenter(point: RigVector2): RigVector2 {
			return {
				x: physicalRigCenter.x + point.x * scaleUnit,
				y: physicalRigCenter.y + point.y * scaleUnit
			};
		}
		function CalculatePhysicalPositionFromPhysicalPosition(
			pointToCalc: RigVector2,
			physicalPoint: RigVector2
		): RigVector2 {
			return {
				x: physicalPoint.x + pointToCalc.x * scaleUnit,
				y: physicalPoint.y + pointToCalc.y * scaleUnit
			};
		}

		rigObject?.elements.forEach((element) => {
			DrawElement(element);
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
