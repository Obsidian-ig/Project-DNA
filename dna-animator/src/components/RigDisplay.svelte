<script lang="ts">
	import gridPattern from '$lib/assets/grid-pattern.jpg';
	import { appState } from '../AppState.svelte';
	import type { RigElement, RigPathPoint, RigVector2 } from '../DNARig';

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

		function CalculatePhysicalPositionFromRigCenter(point: RigVector2): RigVector2 {
			return {
				x: physicalRigCenter.x + point.x * scaleUnit,
				y: physicalRigCenter.y + point.y * scaleUnit
			};
		}
		function CalculatePhysicalPositionFromPhysicalPosition(
			elementPosition: RigVector2,
			pointToCalc: RigVector2,
			physicalPoint: RigVector2,
			rHat: RigVector2,
			uHat: RigVector2
		): RigVector2 {
			let temp = {
				x: rHat.x * pointToCalc.x + uHat.x * pointToCalc.y,
				y: rHat.y * pointToCalc.x + uHat.y * pointToCalc.y
			};
			pointToCalc = temp;
			return {
				x: physicalPoint.x + pointToCalc.x * scaleUnit,
				y: physicalPoint.y + pointToCalc.y * scaleUnit
			};
		}

		function CalculateTotalPhysicalPositionForPoint(
			element: RigElement,
			pointPosition: RigVector2
		): RigVector2 | null {
			if (!rigObject) return null;
			return {
				x:
					(rigObject.base.starting_position.x +
						rigObject.position.x +
						element.offsets.position.x +
						element.position.x +
						pointPosition.x) *
					scaleUnit,
				y:
					(rigObject.base.starting_position.y +
						rigObject.position.y +
						element.offsets.position.y +
						element.position.y +
						pointPosition.y) *
					scaleUnit
			};
		}

		function RotatePhysicalPoint(physicalPoint: RigVector2, degrees: number): RigVector2 {
			let radians = degrees * (Math.PI / 180);
			let tempX = physicalPoint.x;
			let tempY = physicalPoint.y;
			physicalPoint.x = tempX * Math.cos(radians) - tempY * Math.sin(radians);
			physicalPoint.y = tempX * Math.sin(radians) + tempY * Math.cos(radians);

			return physicalPoint;
		}
		function ScalePhysicalPoint(
			physicalPoint: RigVector2,
			scaleMultiplier: RigVector2
		): RigVector2 {
			if (!rigObject) return { x: 0, y: 0 };
			physicalPoint.x = physicalPoint.x * scaleMultiplier.x;
			physicalPoint.y = physicalPoint.y * scaleMultiplier.y;
			return physicalPoint;
		}
		function CalculatePointPositionWithParams(
			physicalOrigin: RigVector2,
			physicalPoint: RigVector2,
			degreesOfRotation: number,
			scaleMultiplier: RigVector2,
			degreesOfRotationTwo: number
		) {
			physicalPoint.x -= physicalOrigin.x;
			physicalPoint.y -= physicalOrigin.y;
			physicalPoint = RotatePhysicalPoint(physicalPoint, degreesOfRotation); //rotate
			physicalPoint = ScalePhysicalPoint(physicalPoint, scaleMultiplier); //scale
			physicalPoint = RotatePhysicalPoint(physicalPoint, degreesOfRotationTwo); //rotate after scaling
			physicalPoint.x += physicalOrigin.x;
			physicalPoint.y += physicalOrigin.y;
			return physicalPoint;
		}

		function DrawElement(element: RigElement) {
			if (!ctx || !rigObject || !element.visible || rigObject.hide_all_elements || rigObject.groups.find(g => g.id === element.group_id)?.visible === false) return;
			ctx.beginPath();
			if (element.points.length <= 2) return;
			let elementCalculatedPosition = CalculatePhysicalPositionFromRigCenter({
				x:
					rigObject.base.starting_position.x +
					rigObject.position.x +
					element.position.x +
					element.offsets.position.x,
				y:
					rigObject.base.starting_position.y +
					rigObject.position.y +
					element.position.y +
					element.offsets.position.y
			});
			let totalElementPositionRotation = rigObject.base.starting_rotation + rigObject.rotation;
			//subtract the pivot
			elementCalculatedPosition.x -= physicalRigCenter.x;
			elementCalculatedPosition.y -= physicalRigCenter.y;
			elementCalculatedPosition = RotatePhysicalPoint(
				elementCalculatedPosition,
				totalElementPositionRotation
			);
			//add the pivot back
			elementCalculatedPosition.x += physicalRigCenter.x;
			elementCalculatedPosition.y += physicalRigCenter.y;
			let positionUHat = {
				x: -Math.sin(totalElementPositionRotation * (Math.PI / 180)), //+ when +Y = up
				y: Math.cos(totalElementPositionRotation * (Math.PI / 180))
			};
			let positionRHat = {
				x: Math.cos(totalElementPositionRotation * (Math.PI / 180)),
				y: Math.sin(totalElementPositionRotation * (Math.PI / 180)) //- when +Y = up
			};

			let calculatedOrigin = CalculatePhysicalPositionFromPhysicalPosition(
				elementCalculatedPosition,
				element.transform_origin,
				elementCalculatedPosition,
				positionRHat,
				positionUHat
			);

			let calculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
				elementCalculatedPosition,
				element.points[0].point,
				elementCalculatedPosition,
				positionRHat,
				positionUHat
			);

			let scaleMultiplier = {
				x:
					rigObject.base.starting_scale.x +
					rigObject.scale.x +
					element.offsets.scale.x +
					element.scale.x,
				y:
					rigObject.base.starting_scale.y +
					rigObject.scale.y +
					element.offsets.scale.y +
					element.scale.y
			};
			let totalRotation = element.offsets.rotation + element.rotation;
			let totalRotationTwo = element.offsets.rotation_two + element.rotation_two;

			calculatedPosition = CalculatePointPositionWithParams(
				elementCalculatedPosition,
				calculatedPosition,
				totalRotation,
				scaleMultiplier,
				totalRotationTwo
			);

			ctx.moveTo(calculatedPosition.x, calculatedPosition.y);
			for (let i = 1; i < element.points.length; i++) {
				calculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
					elementCalculatedPosition,
					element.points[i].point,
					elementCalculatedPosition,
					positionRHat,
					positionUHat
				);
				calculatedPosition = CalculatePointPositionWithParams(
					elementCalculatedPosition,
					calculatedPosition,
					totalRotation,
					scaleMultiplier,
					totalRotationTwo
				);
				ctx.lineTo(calculatedPosition.x, calculatedPosition.y);
			}
			ctx.closePath();
			ctx.fillStyle = element.fill_color;
			ctx.strokeStyle = element.stroke_color;
			ctx.stroke();
			ctx.fill();
			if (!rigObject.disable_all_debug_options) {
				if (element.show_origin_point) {
					ctx.beginPath();
					ctx.moveTo(calculatedOrigin.x, calculatedOrigin.y);
					ctx.arc(calculatedOrigin.x, calculatedOrigin.y, 1 * scaleUnit, 0, 2 * Math.PI);
					ctx.closePath();
					ctx.fillStyle = '#de5100';
					ctx.strokeStyle = '#de5100';
					ctx.fill();
					ctx.stroke();
				}
				if (element.show_position_point) {
					ctx.beginPath();
					ctx.moveTo(elementCalculatedPosition.x, elementCalculatedPosition.y);
					ctx.arc(
						elementCalculatedPosition.x,
						elementCalculatedPosition.y,
						1 * scaleUnit,
						0,
						2 * Math.PI
					);
					ctx.closePath();
					ctx.fillStyle = '#03ff1c';
					ctx.strokeStyle = '#03ff1c';
					ctx.fill();
					ctx.stroke();
				}
			}
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
