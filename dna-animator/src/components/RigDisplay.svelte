<script lang="ts">
	import { appState } from '../AppState.svelte';
	import {
		RigLayeringOrderNodeType,
		RigPointInterpolationType,
		type RigElement,
		type RigVector2
	} from '../DNARig';
	import Boolean from './PropertiesExplorerComponents/Boolean.svelte';
	import Color from './PropertiesExplorerComponents/Color.svelte';
	import VectorTwo from './PropertiesExplorerComponents/VectorTwo.svelte';

	let canvas: HTMLCanvasElement;
	let displayWidth = $state(0);
	let displayHeight = $state(0);
	let rigObject = $derived(appState.rigPlaygroundState.loadedRig);
	let showSettingsPanel = $state(false);
	let gridOverlay = $derived(appState.rigDisplayState.showGridOverlay);
	let gridColumnsAndRows: RigVector2 = $derived(appState.rigDisplayState.gridColumnsAndRows);
	let gridStrokeColor: string = $derived(appState.rigDisplayState.gridStrokeColor);

	$effect(() => {
		appState.UpdateRigDisplayStateShowGridOverlay(gridOverlay);
		appState.UpdateRigDisplayStateGridColumnsAndRows(gridColumnsAndRows);
		appState.UpdateRigDisplayStateGridStrokeColor(gridStrokeColor);
	});

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
			if (!rigObject || !ctx || !element.visible) return;
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

			//all calculations are from the current point to the next point, never backwards.
			ctx.beginPath();
			element.points.slice().forEach((point, index) => {
				let calculatedPointPosition = CalculatePhysicalPositionFromPhysicalPosition(
					point.point,
					elementCalculatedPosition,
					elementWorldX,
					elementWorldY
				);
				let nextPointIndex = index >= element.points.length - 1 ? 0 : index + 1;
				let nextPoint = element.points[nextPointIndex];
				if (!nextPoint) return;
				let calculatedNextPointPosition = CalculatePhysicalPositionFromPhysicalPosition(
					nextPoint.point,
					elementCalculatedPosition,
					elementWorldX,
					elementWorldY
				);
				if (index === 0) ctx.moveTo(calculatedPointPosition.x, calculatedPointPosition.y); //move to first point's position
				if (
					!point.controls ||
					point.controls.length < 1 ||
					point.interpolation_type === RigPointInterpolationType.Linear
				) {
					//linear interpolation to the next point
					ctx.lineTo(calculatedNextPointPosition.x, calculatedNextPointPosition.y);
				} else if (
					point.interpolation_type === RigPointInterpolationType.QuadraticBezierCurve ||
					(point.interpolation_type === RigPointInterpolationType.CubicBezierCurve &&
						point.controls.length < 2)
				) {
					//quadratic bezier curve interpolation to the next point
					console.log("Quadratic Bezier Curve!");
					let timeStep = 0.1;
					let calculatedPathPoints: RigVector2[] = [];
					for (let t = 0; t < 1; t += timeStep) {
						//time, for now just step 0.1, i will calculate the step later.
						let controlPoint = point.controls[0];
						let calculatedPathPointVirtual: RigVector2 = {
							x:
								Math.pow(1 - t, 2) * point.point.x +
								2 * (1 - t) * t * controlPoint.x +
								Math.pow(t, 2) * nextPoint.point.x,
							y:
								Math.pow(1 - t, 2) * point.point.y +
								2 * (1 - t) * t * controlPoint.y +
								Math.pow(t, 2) * nextPoint.point.y
						};
						console.log("Calculated Path Point Virtual " + t + ":", calculatedPathPointVirtual);
						let calculatedPathPointPhysical = CalculatePhysicalPositionFromPhysicalPosition(
							calculatedPathPointVirtual,
							calculatedPointPosition,
							elementWorldX,
							elementWorldY
						);
						calculatedPathPoints.push(calculatedPathPointPhysical);
						console.log("Calculated Path Point Physical " + t + ":", calculatedPathPointPhysical);
					}
					console.log(calculatedPathPoints);
					calculatedPathPoints.forEach((point, pointIndex) => {
						if (pointIndex === 0) ctx.moveTo(point.x, point.y);
						let nextIndex = pointIndex >= calculatedPathPoints.length - 1 ? 0 : index + 1;
						let nextPoint = calculatedPathPoints[nextIndex];
						if (!nextPoint) return;
						ctx.lineTo(nextPoint.x, nextPoint.y);
					});
				} else if (
					point.interpolation_type === RigPointInterpolationType.CubicBezierCurve &&
					point.controls.length === 2
				) {
					//cubic bezier curve interpolation to the next point
				}
			});
			ctx.closePath();
			ctx.strokeStyle = element.stroke_color;
			ctx.fillStyle = element.fill_color;
			ctx.stroke();
			if (element.filled) ctx.fill();

			/*
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
			ctx.stroke();*/
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

			//grid overlay
			if (gridOverlay) {
				ctx.beginPath();
				//columns
				let columnCount = displayWidth / (gridColumnsAndRows.x * scaleUnit);
				for (let i = 0; i < columnCount; i++) {
					ctx.moveTo(i * (displayWidth / columnCount), 0);
					ctx.lineTo(i * (displayWidth / columnCount), displayHeight);
					ctx.moveTo(i * (displayWidth / columnCount), 0);
				}

				//rows
				let rowCount = displayHeight / (gridColumnsAndRows.y * scaleUnit);
				for (let i = 0; i < rowCount; i++) {
					ctx.moveTo(0, i * (displayHeight / rowCount));
					ctx.lineTo(displayWidth, i * (displayHeight / rowCount));
					ctx.moveTo(0, i * (displayHeight / rowCount));
				}
				ctx.closePath();
				ctx.strokeStyle = gridStrokeColor;
				ctx.stroke();
			}
		}

		Draw();
	});
</script>

<div class="display-container">
	<canvas
		id="rig-display"
		bind:this={canvas}
		bind:clientWidth={displayWidth}
		bind:clientHeight={displayHeight}
		width={displayWidth}
		height={displayHeight}
	></canvas>

	<button
		class="display-settings-button"
		aria-label="display preview settings"
		onclick={() => {
			showSettingsPanel = !showSettingsPanel;
		}}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#000000"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-settings preview-icon"
			><path
				d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
			/><circle cx="12" cy="12" r="3" /></svg
		>
	</button>
	{#if showSettingsPanel}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="display-settings-container"
			onclick={() => {
				showSettingsPanel = false;
			}}
		>
			<div class="display-settings-inner-panel" onclick={(e) => e.stopPropagation()}>
				<div class="inner-panel-header">
					<p class="header-label">Display Settings</p>
					<button class="settings-close-button" onclick={() => (showSettingsPanel = false)}>
						X
					</button>
				</div>
				<Boolean label="Grid Overlay" bind:value={gridOverlay} />
				<VectorTwo
					label="Grid ColumnsxRows"
					bind:value={gridColumnsAndRows}
					tooltip="How much the columns or rows are repeated every X units."
				/>
				<Color label="Grid Stroke Color" bind:value={gridStrokeColor} />
			</div>
		</div>
	{/if}
</div>

<style>
	.display-container {
		width: 100%;
		height: 100%;
		background-color: #d9d9d9;
		background-size: cover;
		display: flex;
		align-items: center;
		justify-content: center;
		background-image:
			linear-gradient(45deg, #9c9b9b 25%, transparent 25%),
			linear-gradient(-45deg, #9c9b9b 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #9c9b9b 75%),
			linear-gradient(-45deg, transparent 75%, #9c9b9b 75%);
		background-size: 40px 40px;
		position: relative;
	}

	#rig-display {
		background-color: black;
		width: 75%;
		aspect-ratio: 1;
		border-radius: 50%;
	}

	.display-settings-button {
		position: absolute;
		left: calc(100% - 30px);
		top: 5px;
		cursor: pointer;
		z-index: 3;
	}
	.display-settings-container {
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;

		.display-settings-inner-panel {
			width: 70%;
			height: 80%;
			border-radius: 12px;
			background-color: var(--bg-light);
			z-index: 3;
			min-width: 250px;

			.inner-panel-header {
				display: flex;
				justify-content: center;
				position: relative;

				.settings-close-button {
					position: absolute;
					left: calc(100% - 2ch);
					cursor: pointer;
				}
			}
		}
	}
</style>
