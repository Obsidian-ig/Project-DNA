<script lang="ts">
	import { appState, VisualEditorModes, VisualEditorTools } from '../AppState.svelte';
	import {
		RigLayeringOrderNodeType,
		RigPointInterpolationType,
		SelectedNodeType,
		type RigElement,
		type RigVector2
	} from '../DNARig';
	import Boolean from './PropertiesExplorerComponents/Boolean.svelte';
	import Color from './PropertiesExplorerComponents/Color.svelte';
	import VectorTwo from './PropertiesExplorerComponents/VectorTwo.svelte';

	let canvas: HTMLCanvasElement;
	let displayWidth = $state(0);
	let displayHeight = $state(0);
	let { pageId }: { pageId: string } = $props();
	let pageState = $derived(appState.pageStates.find((ps) => ps.id === pageId));
	let rigObject = $derived(pageState?.loadedRig);
	let showSettingsPanel = $state(false);
	let gridOverlay = $derived(pageState?.showGridOverlay ?? false);
	let gridColumnsAndRows: RigVector2 = $derived(pageState?.gridColumnsAndRows ?? { x: 10, y: 10 });
	let gridStrokeColor: string = $derived(pageState?.gridStrokeColor ?? '#ffffff');
	let visualEditingEnabled = $derived(pageState?.visualEditorEnabled ?? false);

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
					let steps = point.steps;
					for (let i = 1; i <= steps; i++) {
						const timeStep = i / steps;
						let control = point.controls[0];
						let controlPoint = {
							x: point.point.x + control.x,
							y: point.point.y + control.y
						};
						let calculatedPathPointVirtual: RigVector2 = {
							x:
								Math.pow(1 - timeStep, 2) * point.point.x +
								2 * (1 - timeStep) * timeStep * controlPoint.x +
								Math.pow(timeStep, 2) * nextPoint.point.x,
							y:
								Math.pow(1 - timeStep, 2) * point.point.y +
								2 * (1 - timeStep) * timeStep * controlPoint.y +
								Math.pow(timeStep, 2) * nextPoint.point.y
						};
						let calculatedPathPointPhysical = CalculatePhysicalPositionFromPhysicalPosition(
							calculatedPathPointVirtual,
							elementCalculatedPosition,
							elementWorldX,
							elementWorldY
						);
						ctx.lineTo(calculatedPathPointPhysical.x, calculatedPathPointPhysical.y);
					}
				} else if (
					point.interpolation_type === RigPointInterpolationType.CubicBezierCurve &&
					point.controls.length === 2
				) {
					//cubic bezier curve interpolation to the next point
					let steps = point.steps;
					for (let i = 1; i <= steps; i++) {
						const timeStep = i / steps;
						let control = point.controls[0];
						let controlTwo = point.controls[1];
						let controlPoint = {
							x: point.point.x + control.x,
							y: point.point.y + control.y
						};
						let controlPointTwo = {
							x: point.point.x + controlTwo.x,
							y: point.point.y + controlTwo.y
						};
						let calculatedPathPointVirtual: RigVector2 = {
							x:
								Math.pow(1 - timeStep, 3) * point.point.x +
								3 * Math.pow(1 - timeStep, 2) * timeStep * controlPoint.x +
								3 * (1 - timeStep) * Math.pow(timeStep, 2) * controlPointTwo.x +
								Math.pow(timeStep, 3) * nextPoint.point.x,
							y:
								Math.pow(1 - timeStep, 3) * point.point.y +
								3 * Math.pow(1 - timeStep, 2) * timeStep * controlPoint.y +
								3 * (1 - timeStep) * Math.pow(timeStep, 2) * controlPointTwo.y +
								Math.pow(timeStep, 3) * nextPoint.point.y
						};
						let calculatedPathPointPhysical = CalculatePhysicalPositionFromPhysicalPosition(
							calculatedPathPointVirtual,
							elementCalculatedPosition,
							elementWorldX,
							elementWorldY
						);
						ctx.lineTo(calculatedPathPointPhysical.x, calculatedPathPointPhysical.y);
					}
				}
			});
			ctx.closePath();
			ctx.strokeStyle = element.stroke_color;
			ctx.fillStyle = element.fill_color;
			ctx.stroke();
			if (element.filled) ctx.fill();

			element.points.forEach((point) => {
				if (element.show_points) {
					ctx.beginPath();
					let calculatedPointPosition = CalculatePhysicalPositionFromPhysicalPosition(
						point.point,
						elementCalculatedPosition,
						elementWorldX,
						elementWorldY
					);
					ctx.arc(
						calculatedPointPosition.x,
						calculatedPointPosition.y,
						element.points_radius * scaleUnit,
						0,
						360
					);
					ctx.closePath();
					ctx.fillStyle = element.points_color;
					ctx.fill();
				}

				if (
					pageState &&
					point.controls &&
					point.controls.length > 0 &&
					point.show_control_points &&
					!pageState.disableAllDebugOptions &&
					!pageState.hideAllElements
				) {
					point.controls.forEach((control) => {
						ctx.beginPath();
						let controlPoint = {
							x: point.point.x + control.x,
							y: point.point.y + control.y
						};
						let calculatedControlPointPhysical = CalculatePhysicalPositionFromPhysicalPosition(
							controlPoint,
							elementCalculatedPosition,
							elementWorldX,
							elementWorldY
						);
						ctx.arc(
							calculatedControlPointPhysical.x,
							calculatedControlPointPhysical.y,
							point.control_point_radius * scaleUnit,
							0,
							360
						);
						ctx.closePath();
						ctx.fillStyle = point.control_point_color;
						ctx.fill();
					});
				}
			});

			if (pageState && !pageState.disableAllDebugOptions) {
				if (element.show_position_point) {
					ctx.beginPath();
					ctx.arc(
						elementCalculatedOrigin.x,
						elementCalculatedOrigin.y,
						element.position_point_radius * scaleUnit,
						0,
						360
					);
					ctx.closePath();
					ctx.fillStyle = element.position_point_color;
					ctx.fill();
				}
				if (element.show_origin_point) {
					ctx.beginPath();
					ctx.arc(
						elementCalculatedOrigin.x,
						elementCalculatedOrigin.y,
						element.origin_point_radius * scaleUnit,
						0,
						360
					);
					ctx.closePath();
					ctx.fillStyle = element.origin_point_color;
					ctx.fill();
				}
			}
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
					if (!group || !pageState) return;
					if (!group.visible || pageState.hideAllGroups || pageState.hideAllElements) return;

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

		/*
		TODO:
		-Start working on visual editor
		-Make it so if you have visual editing turned on and you have a node selected, it displays Movement Arrows, A Rotation Circle, and Scale Arrows
			-Depending on the editor mode. Make it so users can choose between All, Movement, Rotation, or Scale in order to make it less cluttered if wanted.
		-Add an option inside the display settings to make it so you can override any debug settings and make all points/controls visible for easier editing.
		-Possibly make it so that if a user has an element selected, they don't have to individually select the points in the RigTree and can just select them in the display.
		-Maybe make it so there are two different visual editing modes.
			-The normal one with all the visual indicators
			-The minimalist one were you can only drag position points, origin points, element points, and control points around to move them. Maybe you can still select between the editor modes 
				-Which makes it change what happens when you drag and move a point.
					-Movement Mode/All: Dragging a point moves it
					-Scale Mode: You can only mess with position points, dragging left/right changes the scale of the rig/group/element on the X axis, Up/Down modifies the Y axis.
					-Rotate Mode: Again, only position points. Dragging left rotates the rig/group/element counter clockwise, dragging right does clockwise.
		*/
		if (visualEditingEnabled) {
			if (
				pageState?.selectedNode?.type === SelectedNodeType.Point ||
				pageState?.selectedNode?.type === SelectedNodeType.ControlPoint
			) {
				//these are the only two that can't use rotate or scale transform tools.
				
			} else {
			}
		}
	});

	$effect(() => {
		appState.UpdatePageStateShowGridOverlay(pageId, gridOverlay);
		appState.UpdatePageStateGridColumnsAndRows(pageId, gridColumnsAndRows);
		appState.UpdatePageStateGridStrokeColor(pageId, gridStrokeColor);
		appState.UpdatePageStateVisualEditingEnabled(pageId, visualEditingEnabled);
	});
</script>

<div class="display-container">
	<div class="header-container">
		{#if visualEditingEnabled}
			<div class="display-toolbar-container">
				<div class="toolbar-transform-tools">
					<button
						class="toolbar-button {pageState?.currentVisualEditorTool === VisualEditorTools.ALL
							? 'selected'
							: ''}"
						title="Transform Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.ALL);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-scale-3d preview-icon"
							><path d="M5 7v11a1 1 0 0 0 1 1h11" /><path d="M5.293 18.707 11 13" /><circle
								cx="19"
								cy="19"
								r="2"
							/><circle cx="5" cy="5" r="2" /></svg
						>
					</button>
					<button
						class="toolbar-button {pageState?.currentVisualEditorTool === VisualEditorTools.MOVE
							? 'selected'
							: ''}"
						title="Move Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.MOVE);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-move preview-icon"
							><path d="M12 2v20" /><path d="m15 19-3 3-3-3" /><path d="m19 9 3 3-3 3" /><path
								d="M2 12h20"
							/><path d="m5 9-3 3 3 3" /><path d="m9 5 3-3 3 3" /></svg
						>
					</button>
					<button
						class="toolbar-button {pageState?.currentVisualEditorTool === VisualEditorTools.ROTATE
							? 'selected'
							: ''}"
						title="Rotate Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.ROTATE);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-refresh-cw preview-icon"
							><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path
								d="M21 3v5h-5"
							/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path
								d="M8 16H3v5"
							/></svg
						>
					</button>
					<button
						class="toolbar-button {pageState?.currentVisualEditorTool === VisualEditorTools.SCALE
							? 'selected'
							: ''}"
						title="Scale Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.SCALE);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-scaling preview-icon"
							><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path
								d="M14 15H9v-5"
							/><path d="M16 3h5v5" /><path d="M21 3 9 15" /></svg
						>
					</button>
				</div>
				<div class="toolbar-divider"></div>
				<div class="toolbar-edit-modes">
					<button
						class="toolbar-button {pageState?.currentVisualEditorMode === VisualEditorModes.VISUAL
							? 'selected'
							: ''}"
						title="Visual Mode"
						onclick={() => {
							appState.UpdatePageStateVisualEditorMode(pageId, VisualEditorModes.VISUAL);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-vector-polygon preview-icon"
							><path d="m12.828 4.813 5.344 2.375" /><path d="m15.769 18.153 3.461-8.306" /><path
								d="m5.687 14.074 7.625 4.852"
							/><path d="M9.772 5.579 5.228 11.42" /><circle cx="11" cy="4" r="2" /><circle
								cx="15"
								cy="20"
								r="2"
							/><circle cx="20" cy="8" r="2" /><circle cx="4" cy="13" r="2" /></svg
						>
					</button>
					<button
						class="toolbar-button {pageState?.currentVisualEditorMode === VisualEditorModes.MINIMAL
							? 'selected'
							: ''}"
						title="Minimal Mode"
						onclick={() => {
							appState.UpdatePageStateVisualEditorMode(pageId, VisualEditorModes.MINIMAL);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#ffffff"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-squares-unite preview-icon"
							><path
								d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3a1 1 0 0 0-1-1z"
							/></svg
						>
					</button>
				</div>
			</div>
		{/if}
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
	</div>

	<div class="screen-container">
		<div class="display-background"></div>
		<canvas
			id="rig-display"
			bind:this={canvas}
			bind:clientWidth={displayWidth}
			bind:clientHeight={displayHeight}
			width={displayWidth}
			height={displayHeight}
		></canvas>
	</div>

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
				<Boolean label="Visual Editing" bind:value={visualEditingEnabled} />
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
		flex-direction: column;
		background-image:
			linear-gradient(45deg, #9c9b9b 25%, transparent 25%),
			linear-gradient(-45deg, #9c9b9b 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #9c9b9b 75%),
			linear-gradient(-45deg, transparent 75%, #9c9b9b 75%);
		background-size: 40px 40px;
		position: relative;
		box-sizing: border-box;
		padding-top: 5px;
	}

	.header-container {
		display: flex;
		align-items: center;
		padding-left: 5px;
	}

	.display-toolbar-container {
		width: fit-content;
		height: 35px;
		background-color: var(--bg);
		border-radius: 8px;
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
		flex-wrap: nowrap;
		padding: 10px;

		.toolbar-divider {
			width: 1px;
			height: 75%;
			background-color: var(--text-muted);
			margin-left: 8px;
		}

		.toolbar-button {
			height: 100%;
			display: flex;

			svg {
				stroke: var(--text);
			}

			&.selected svg {
				stroke: var(--primary);
			}
		}

		.toolbar-transform-tools,
		.toolbar-edit-modes {
			display: flex;
			gap: 8px;
		}
		.toolbar-edit-modes {
			margin-left: 8px;
		}
	}

	.display-settings-button {
		margin-left: auto;
		margin-right: 5px;
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

	.screen-container {
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.display-background {
		background-color: black;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 50%;
	}

	#rig-display {
		width: 100%;
		aspect-ratio: 1;
		z-index: 1;
		position: absolute;
		padding: inherit;
	}
</style>
