<script lang="ts">
	import gridPattern from '$lib/assets/grid-pattern.jpg';
	import { appState } from '../AppState.svelte';
	import { RigLayeringOrderNodeType, type RigElement, type RigVector2 } from '../DNARig';

	let canvas: HTMLCanvasElement;
	let displayWidth = $state(0);
	let displayHeight = $state(0);
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	$effect(() => {
		if (!canvas || !rigObject) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let displayOrigin: RigVector2 = {
			x: displayWidth / 2,
			y: displayHeight / 2
		};
		let displayShortestSide = Math.min(displayWidth, displayHeight);
		const scaleUnit = displayShortestSide / 200; //fixed "grid" of 200x200 "pixels" -100 <-> +100

		let virtualRigCenter: RigVector2 = {
			x: rigObject.offsets.position.x + rigObject.transforms.position.x,
			y: rigObject.offsets.position.y + rigObject.transforms.position.y
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
					(rigObject.offsets.position.x +
						rigObject.transforms.position.x +
						element.offsets.position.x +
						element.transforms.position.x +
						pointPosition.x) *
					scaleUnit,
				y:
					(rigObject.offsets.position.y +
						rigObject.transforms.position.y +
						element.offsets.position.y +
						element.transforms.position.y +
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

		function DrawElement(
			element: RigElement,
			parentPosition: RigVector2,
			xAxis: RigVector2,
			yAxis: RigVector2
		) {
			if (!rigObject || !ctx) return;

			if (!element || !ctx) return;
			let elementVirtualTotalPosition: RigVector2 = {
				x: element.offsets.position.x + element.transforms.position.x,
				y: element.offsets.position.y + element.transforms.position.y
			};
			let elementVirtualOrigin: RigVector2 = {
				x: elementVirtualTotalPosition.x + element.offsets.transform_origin.x,
				y: elementVirtualTotalPosition.y + element.offsets.transform_origin.y
			};
			let elementRotation = element.offsets.rotation + element.transforms.rotation;
			let elementScale: RigVector2 = {
				x: element.offsets.scale.x * element.transforms.scale.x,
				y: element.offsets.scale.y * element.transforms.scale.y
			};
			let elementRotationTwo = element.offsets.rotation_two + element.transforms.rotation_two;

			//calculate the elements position from the group's position and apply the groups rotation/direction with its axies
			let elementCalculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
				elementVirtualTotalPosition,
				parentPosition,
				xAxis,
				yAxis
			);
			let elementCalculatedOrigin = CalculatePhysicalPositionFromPhysicalPosition(
				elementVirtualOrigin,
				parentPosition,
				xAxis,
				yAxis
			);

			let elementXAxis = { x: 1, y: 0 };
			let elementYAxis = { x: 0, y: 1 };

			elementXAxis = RotatePhysicalPoint(elementXAxis, elementRotation);
			elementYAxis = RotatePhysicalPoint(elementYAxis, elementRotation);
			elementXAxis = ScalePhysicalPoint(elementXAxis, elementScale);
			elementYAxis = ScalePhysicalPoint(elementYAxis, elementScale);
			elementXAxis = RotatePhysicalPoint(elementXAxis, elementRotationTwo);
			elementYAxis = RotatePhysicalPoint(elementYAxis, elementRotationTwo);
			const elementWorldX = {
				x: xAxis.x * elementXAxis.x + yAxis.x * elementXAxis.y,
				y: xAxis.y * elementXAxis.x + yAxis.y * elementXAxis.y
			};
			const elementWorldY = {
				x: xAxis.x * elementYAxis.x + yAxis.x * elementYAxis.y,
				y: xAxis.y * elementYAxis.x + yAxis.y * elementYAxis.y
			};
			
			const o = element.offsets.transform_origin;
			elementCalculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
				{ x: -o.x, y: -o.y },
				elementCalculatedOrigin,
				elementWorldX,
				elementWorldY
			);

			let calculatedPointsPositions: RigVector2[] = [];
			element.points.slice().forEach((point, index) => {
				let calculatedPointPosition = CalculatePhysicalPositionFromPhysicalPosition(
					point.point,
					elementCalculatedPosition,
					elementWorldX,
					elementWorldY
				);
				calculatedPointsPositions.push(calculatedPointPosition);
			});
			ctx.beginPath();
			ctx.moveTo(calculatedPointsPositions?.[0].x, calculatedPointsPositions?.[0].y);
			for (let i = 1; i < calculatedPointsPositions.length; i++) {
				ctx?.lineTo(calculatedPointsPositions[i].x, calculatedPointsPositions[i].y);
			}
			ctx.closePath();
			ctx.fillStyle = element.fill_color;
			ctx.strokeStyle = element.stroke_color;
			ctx.fill();
			ctx.stroke();
		}
		function Draw() {
			if (!rigObject || !ctx) return;
			ctx.clearRect(0, 0, displayWidth, displayHeight);
			let totalRigRotation = rigObject.offsets.rotation + rigObject.transforms.rotation;
			let rigScale: RigVector2 = {
				x: rigObject.offsets.scale.x * rigObject.transforms.scale.x,
				y: rigObject.offsets.scale.y * rigObject.transforms.scale.y
			};
			let totalRigRotationTwo = rigObject.offsets.rotation_two + rigObject.transforms.rotation_two;
			let rigXAxis: RigVector2 = { x: 1, y: 0 };
			let rigYAxis: RigVector2 = { x: 0, y: 1 };
			rigXAxis = RotatePhysicalPoint(rigXAxis, totalRigRotation);
			rigYAxis = RotatePhysicalPoint(rigYAxis, totalRigRotation);
			rigXAxis = ScalePhysicalPoint(rigXAxis, rigScale);
			rigYAxis = ScalePhysicalPoint(rigYAxis, rigScale);
			rigXAxis = RotatePhysicalPoint(rigXAxis, totalRigRotationTwo);
			rigYAxis = RotatePhysicalPoint(rigYAxis, totalRigRotationTwo);

			rigObject.layering_order.slice().forEach((item) => {
				if (item.type === RigLayeringOrderNodeType.Group) {
					let group = rigObject.groups.find((g) => g.id === item.id);
					if (!group) return;
					if (
						!group.visible ||
						appState.rigPlaygroundState.hideAllGroups ||
						appState.rigPlaygroundState.hideAllElements
					)
						return;

					let groupRotation = group.offsets.rotation + group.transforms.rotation;
					let groupScale: RigVector2 = {
						x: group.offsets.scale.x * group.transforms.scale.x,
						y: group.offsets.scale.y * group.transforms.scale.y
					};
					let groupRotationTwo = group.offsets.rotation_two + group.transforms.rotation_two;

					let groupCalculatedPosition = CalculatePhysicalPositionFromRigCenter({
						x: group.offsets.position.x + group.transforms.position.x,
						y: group.offsets.position.y + group.transforms.position.y
					});

					let groupXAxis = { x: 1, y: 0 };
					let groupYAxis = { x: 0, y: 1 };
					groupXAxis = RotatePhysicalPoint(groupXAxis, groupRotation);
					groupYAxis = RotatePhysicalPoint(groupYAxis, groupRotation);
					groupXAxis = ScalePhysicalPoint(groupXAxis, groupScale);
					groupYAxis = ScalePhysicalPoint(groupYAxis, groupScale);
					groupXAxis = RotatePhysicalPoint(groupXAxis, groupRotationTwo);
					groupYAxis = RotatePhysicalPoint(groupYAxis, groupRotationTwo);

					//calculate the group transform_origin separately
					let calculatedGroupOrigin = CalculatePhysicalPositionFromRigCenter({
						x:
							group.offsets.position.x +
							group.transforms.position.x +
							group.offsets.transform_origin.x,
						y:
							group.offsets.position.y +
							group.transforms.position.y +
							group.offsets.transform_origin.y
					});

					//final group position calculated
					groupCalculatedPosition = CalculatePointPositionWithParams(
						calculatedGroupOrigin,
						groupCalculatedPosition,
						groupRotation,
						groupScale,
						groupRotationTwo
					);

					//apply rig transforms to origin
					calculatedGroupOrigin.x -= physicalRigCenter.x;
					calculatedGroupOrigin.y -= physicalRigCenter.y;
					calculatedGroupOrigin = RotatePhysicalPoint(calculatedGroupOrigin, totalRigRotation);
					calculatedGroupOrigin = ScalePhysicalPoint(calculatedGroupOrigin, rigScale);
					calculatedGroupOrigin = RotatePhysicalPoint(calculatedGroupOrigin, totalRigRotationTwo);
					calculatedGroupOrigin.x += physicalRigCenter.x;
					calculatedGroupOrigin.y += physicalRigCenter.y;
					//Apply all of the rig "total" values to the group
					groupCalculatedPosition.x -= physicalRigCenter.x;
					groupCalculatedPosition.y -= physicalRigCenter.y;
					groupCalculatedPosition = RotatePhysicalPoint(groupCalculatedPosition, totalRigRotation); //rotate the groups physical position with the rigs total rotation
					groupCalculatedPosition = ScalePhysicalPoint(groupCalculatedPosition, {
						x: rigObject.offsets.scale.x * rigObject.transforms.scale.x,
						y: rigObject.offsets.scale.y * rigObject.transforms.scale.y
					});
					groupCalculatedPosition = RotatePhysicalPoint(
						groupCalculatedPosition,
						totalRigRotationTwo
					);
					groupCalculatedPosition.x += physicalRigCenter.x;
					groupCalculatedPosition.y += physicalRigCenter.y;
					const groupWorldX = {
						x: rigXAxis.x * groupXAxis.x + rigYAxis.x * groupXAxis.y,
						y: rigXAxis.y * groupXAxis.x + rigYAxis.y * groupXAxis.y
					};
					const groupWorldY = {
						x: rigXAxis.x * groupYAxis.x + rigYAxis.x * groupYAxis.y,
						y: rigXAxis.y * groupYAxis.x + rigYAxis.y * groupYAxis.y
					};

					rigObject.elements
						.filter((e) => e.group_id === group.id)
						.slice()
						.forEach((element) => {
							DrawElement(element, groupCalculatedPosition, groupWorldX, groupWorldY);
						});
				} else if (item.type === RigLayeringOrderNodeType.Element) {
					let element = rigObject.elements.find((e) => e.name === item.id);
					if (!element) return;
					DrawElement(element, physicalRigCenter, rigXAxis, rigYAxis);
				} else {
					return;
				}
			});
		}

		Draw();
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
