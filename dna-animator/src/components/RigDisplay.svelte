<script lang="ts">
	import gridPattern from '$lib/assets/grid-pattern.jpg';
	import { groupCollapsed } from 'node:console';
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
		ctx.clearRect(0, 0, displayWidth, displayHeight);

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

		function DrawElement(element: RigElement) {
			if (
				!ctx ||
				!rigObject ||
				!element.visible ||
				appState.rigPlaygroundState.hideAllElements ||
				rigObject.groups.find((g) => g.id === element.group_id)?.visible === false
			)
				return;
			ctx.beginPath();
			if (element.points.length <= 2) return;
			let elementGroup = rigObject.groups.find((g) => g.id === element.group_id);

			let elementCalculatedPosition = CalculatePhysicalPositionFromRigCenter({
				x:
					rigObject.offsets.position.x +
					rigObject.transforms.position.x +
					(elementGroup ? elementGroup.offsets.position.x : 0) +
					(elementGroup ? elementGroup.transforms.position.x : 0) +
					element.transforms.position.x +
					element.offsets.position.x,
				y:
					rigObject.offsets.position.y +
					rigObject.transforms.position.y +
					(elementGroup ? elementGroup.offsets.position.y : 0) +
					(elementGroup ? elementGroup.transforms.position.y : 0) +
					element.transforms.position.y +
					element.offsets.position.y
			});
			let totalElementPositionRotation =
				rigObject.offsets.rotation +
				rigObject.transforms.rotation +
				(elementGroup ? elementGroup.offsets.rotation + elementGroup.transforms.rotation : 0);
			//subtract the pivot
			elementCalculatedPosition.x -=
				physicalRigCenter.x + (elementGroup ? elementGroup.transforms.position.x * scaleUnit : 0);
			elementCalculatedPosition.y -=
				physicalRigCenter.y + (elementGroup ? elementGroup.transforms.position.y * scaleUnit : 0);
			elementCalculatedPosition = RotatePhysicalPoint(
				elementCalculatedPosition,
				totalElementPositionRotation
			);
			//add the pivot back
			elementCalculatedPosition.x +=
				physicalRigCenter.x + (elementGroup ? elementGroup.transforms.position.x * scaleUnit : 0);
			elementCalculatedPosition.y +=
				physicalRigCenter.y + (elementGroup ? elementGroup.transforms.position.y * scaleUnit : 0);
			let positionUHat = {
				x: -Math.sin(totalElementPositionRotation * (Math.PI / 180)), //+ when +Y = up
				y: Math.cos(totalElementPositionRotation * (Math.PI / 180))
			};
			let positionRHat = {
				x: Math.cos(totalElementPositionRotation * (Math.PI / 180)),
				y: Math.sin(totalElementPositionRotation * (Math.PI / 180)) //- when +Y = up
			};

			let calculatedOrigin = CalculatePhysicalPositionFromPhysicalPosition(
				element.offsets.transform_origin,
				elementCalculatedPosition,
				positionRHat,
				positionUHat
			);

			let calculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
				element.points[0].point,
				elementCalculatedPosition,
				positionRHat,
				positionUHat
			);

			let scaleMultiplier = {
				x:
					rigObject.offsets.scale.x *
					rigObject.transforms.scale.x *
					(elementGroup ? elementGroup.offsets.scale.x : 1) *
					(elementGroup ? elementGroup.transforms.scale.x : 1) *
					element.offsets.scale.x *
					element.transforms.scale.x,
				y:
					rigObject.offsets.scale.y *
					rigObject.transforms.scale.y *
					(elementGroup ? elementGroup.offsets.scale.y : 1) *
					(elementGroup ? elementGroup.transforms.scale.y : 1) *
					element.offsets.scale.y *
					element.transforms.scale.y
			};
			let totalRotation = element.offsets.rotation + element.transforms.rotation;
			let totalRotationTwo = element.offsets.rotation_two + element.transforms.rotation_two;

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
			if (!appState.rigPlaygroundState.disabledAllDebugOptions) {
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

		function Draw() {
			if (!rigObject) return;
			let totalRigRotation = rigObject.offsets.rotation + rigObject.transforms.rotation;
			let rigScale: RigVector2 = {
				x: rigObject.offsets.scale.x * rigObject.transforms.scale.x,
				y: rigObject.offsets.scale.y * rigObject.transforms.scale.y
			};
			let totalRigRotationTwo = rigObject.offsets.rotation_two + rigObject.transforms.rotation_two;
			rigObject.layering_order.slice().forEach((item) => {
				if (item.type === RigLayeringOrderNodeType.Group) {
					//calculate the physical position of the group from the rig origin
					//subtract the rig origin/pivot
					//rotate the group physical position
					//scale the group physical position
					//rotate the group physical position again
					//add the rig origin/pivot back
					//calculate the group origin physical position from the group physical position
					let group = rigObject.groups.find((g) => g.id === item.id);
					if (!group) return;

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
					//apply all of the rig total values to axies
					//(don't need to remove/add the pivot because they are directions)
					groupXAxis = RotatePhysicalPoint(groupXAxis, totalRigRotation);
					groupYAxis = RotatePhysicalPoint(groupYAxis, totalRigRotation);
					groupXAxis = ScalePhysicalPoint(groupXAxis, rigScale);
					groupYAxis = ScalePhysicalPoint(groupYAxis, rigScale);
					groupXAxis = RotatePhysicalPoint(groupXAxis, totalRigRotationTwo);
					groupYAxis = RotatePhysicalPoint(groupYAxis, totalRigRotationTwo);

					//loop through each element in the group
					//calculate the physical element position from the physical group position
					//rotate the element physical position
					//scale the element physical position
					//rotate the element physical position again
					//calculate the physical element transform_origin from the physical element position
					//calculate the element's uhat and rhat to rotate the points correctly.
					rigObject.elements
						.filter((e) => e.group_id === group.id)
						.slice()
						.forEach((element) => {
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
							let elementRotationTwo =
								element.offsets.rotation_two + element.transforms.rotation_two;
							//calculate the elements position from the group's position and apply the groups rotation/direction with its axies
							let elementCalculatedPosition = CalculatePhysicalPositionFromPhysicalPosition(
								elementVirtualTotalPosition,
								groupCalculatedPosition,
								groupXAxis,
								groupYAxis
							);
							let elementCalculatedOrigin = CalculatePhysicalPositionFromPhysicalPosition(
								elementVirtualOrigin,
								groupCalculatedPosition,
								groupXAxis,
								groupYAxis
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
								x: groupXAxis.x * elementXAxis.x + groupYAxis.x * elementXAxis.y,
								y: groupXAxis.y * elementXAxis.x + groupYAxis.y * elementXAxis.y
							};
							const elementWorldY = {
								x: groupXAxis.x * elementYAxis.x + groupYAxis.x * elementYAxis.y,
								y: groupXAxis.y * elementYAxis.x + groupYAxis.y * elementYAxis.y
							};
							const o = element.offsets.transform_origin;
							elementCalculatedPosition = {
								x: elementCalculatedOrigin.x - elementWorldX.x * o.x - elementWorldY.x * o.y,
								y: elementCalculatedOrigin.y - elementWorldX.y * o.x - elementWorldY.y * o.y
							};
						});
				} else if (item.type === RigLayeringOrderNodeType.Element) {
				} else {
					return;
				}
			});
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
