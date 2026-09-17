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
		function CalculatePhysicalPositionFromPhysicalPosition(pointToCalc: RigVector2, physicalPoint: RigVector2): RigVector2 {
			return {
				x: physicalPoint.x + pointToCalc.x * scaleUnit,
				y: physicalPoint.y + pointToCalc.y * scaleUnit
			};
		}

        function CalculateTotalPhysicalPositionForPoint(element: RigElement, pointPosition: RigVector2): RigVector2 | null {
            if (!rigObject) return null;
            return {
                x: (rigObject.base.starting_position.x + rigObject.position.x + element.offsets.position.x + element.position.x + pointPosition.x) * scaleUnit,
                y: (rigObject.base.starting_position.y + rigObject.position.y + element.offsets.position.y + element.position.y + pointPosition.y) * scaleUnit
            };
        }

		function RotatePhysicalPointFromPhysicalOrigin(physicalPoint: RigVector2, degrees: number): RigVector2 {
			let radians = degrees * (Math.PI / 180);
			physicalPoint.x =
				physicalPoint.x * Math.cos(radians) -
				physicalPoint.y * Math.sin(radians);
			physicalPoint.y =
				physicalPoint.x * Math.sin(radians) +
				physicalPoint.y * Math.cos(radians);

			return physicalPoint;
		}
		function ScalePhysicalPointFromPhysicalOrigin(physicalPoint: RigVector2, scaleMultiplier: RigVector2): RigVector2 {
			if (!rigObject) return { x: 0, y: 0};
			physicalPoint.x = physicalPoint.x * scaleMultiplier.x;
			physicalPoint.y = physicalPoint.y * scaleMultiplier.y;
			return physicalPoint;
		}
		function CalculatePointPositionWithParams(physicalOrigin: RigVector2, physicalPoint: RigVector2, degreesOfRotation: number, scaleMultiplier: RigVector2) {
			physicalPoint.x -= physicalOrigin.x;
			physicalPoint.y -= physicalOrigin.y;
			physicalPoint = RotatePhysicalPointFromPhysicalOrigin(physicalPoint, degreesOfRotation); //rotate
			physicalPoint = ScalePhysicalPointFromPhysicalOrigin(physicalPoint, scaleMultiplier); //scale
			physicalPoint.x += physicalOrigin.x;
			physicalPoint.y += physicalOrigin.y;
			return physicalPoint;
		}

		function DrawElement(element: RigElement) {
			if (!ctx || !rigObject) return;
			ctx.beginPath();
			if (element.points.length <= 2) return;
			let elementCalculatedPosition = CalculatePhysicalPositionFromRigCenter({
				x: rigObject.base.starting_position.x + rigObject.position.x + element.position.x + element.offsets.position.x,
				y: rigObject.base.starting_position.y + rigObject.position.y + element.position.y + element.offsets.position.y
			});
			let calculatedOrigin = CalculatePhysicalPositionFromPhysicalPosition(
				element.transform_origin,
				elementCalculatedPosition
			);
			let totalOriginRotation = rigObject.base.starting_rotation.z + rigObject.rotation.z;
			calculatedOrigin = RotatePhysicalPointFromPhysicalOrigin(calculatedOrigin, totalOriginRotation);
			let originUHat = {
				x: Math.sin(totalOriginRotation * (Math.PI / 180)),
				y: Math.cos(totalOriginRotation * (Math.PI / 180))
			};
			let originRHat = {
				x: Math.cos(totalOriginRotation * (Math.PI / 180)),
				y: -(Math.sin(totalOriginRotation * (Math.PI / 180)))
			};
			//LEFT OFF HERE 9/17/2026: Use the UHat and RHat to rotate the individual points based on the "direction" the origin is facing from rig rotation:
			// Global Position/Physical Position = Origin + (Xlocal * rHat) + (Ylocal * uHat);
			
			let calculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
				element.points[0].point,
				elementCalculatedPosition
			);

			
			let scaleMultiplier = {
				x: rigObject.base.starting_scale.x + rigObject.scale.x + element.offsets.scale.x + element.scale.x,
				y: rigObject.base.starting_scale.y + rigObject.scale.y + element.offsets.scale.y + element.scale.y
			};
			let totalRotation =  element.offsets.rotation.z + element.rotation.z;
            
			calculatedPosition = CalculatePointPositionWithParams(calculatedOrigin, calculatedPosition, totalRotation, scaleMultiplier);

			ctx.moveTo(calculatedPosition.x, calculatedPosition.y);
			for (let i = 1; i < element.points.length; i++) {
				calculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
					element.points[i].point,
					elementCalculatedPosition
				);
                calculatedPosition = CalculatePointPositionWithParams(calculatedOrigin, calculatedPosition, totalRotation, scaleMultiplier);
				ctx.lineTo(calculatedPosition.x, calculatedPosition.y);
			}
			ctx.closePath();
			ctx.fillStyle = element.fill_color;
			ctx.fill();
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
