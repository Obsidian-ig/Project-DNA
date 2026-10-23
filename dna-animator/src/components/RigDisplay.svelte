<script lang="ts">
	import { appState, VisualEditorModes, VisualEditorTools } from '../AppState.svelte';
	import {
		GetNameIdForElementPoint,
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
	let currentVisualEditorTool = $derived(pageState?.currentVisualEditorTool);
	let isDragging = $state(false);
	let grabOffset: RigVector2 = $state({ x: 0, y: 0 });
	let lockHorizontal = $state(false); //whether or not the position can only be changed on the x axis.
	let lockVertical = $state(false); //whether or not the position can only be changed on the y axis.
	let cursorStartPosition: RigVector2 = $state({ x: 0, y: 0 });
	let isRotating = $state(false);
	let rotationCircle = $state('One'); //'One' or 'Two'
	let isScaling = $state(false);
	let scalingAxis = $state('X'); //'X' or 'Y'
	let scaleStep = $state(0.001);
	let lastScaleDistance: number | null = $state(null);

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
		let absoluteBoxStep = 5 * scaleUnit;
		let absoluteLineLength = 25 * scaleUnit;
		let absoluteArrowSideLength = 3 * scaleUnit;

		let absoluteRotationCircleRadius = 30 * scaleUnit;
		let absoluteRotationTwoCircleRadius = 35 * scaleUnit;

		let absoluteScaleArrowDistance = 40 * scaleUnit;
		let absoluteScaleArrowSideLength = 4 * scaleUnit;

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
		function CalculateNewPhysicalPositionWithParamsInversed(
			physicalOrigin: RigVector2,
			physicalPoint: RigVector2,
			degreesOfRotation: number,
			scaleMultiplier: RigVector2,
			degreesOfRotationTwo: number
		) {
			if (scaleMultiplier.x === 0 || scaleMultiplier.y === 0) return physicalPoint;
			physicalPoint.x -= physicalOrigin.x;
			physicalPoint.y -= physicalOrigin.y;
			physicalPoint = RotatePhysicalPoint(physicalPoint, -degreesOfRotationTwo);
			physicalPoint = ScalePhysicalPoint(physicalPoint, {
				x: 1 / scaleMultiplier.x,
				y: 1 / scaleMultiplier.y
			});
			physicalPoint = RotatePhysicalPoint(physicalPoint, -degreesOfRotation);
			physicalPoint.x += physicalOrigin.x;
			physicalPoint.y += physicalOrigin.y;
			return physicalPoint;
		}

		/*VISUAL EDITOR TOOLS*/
		function DrawMoveTool(physicalPosition: RigVector2, compact: boolean = false) {
			if (!ctx) return;
			if (compact) {
				absoluteLineLength = absoluteLineLength / 2;
			}
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.moveTo(physicalPosition.x - absoluteBoxStep, physicalPosition.y - absoluteBoxStep); //top left
			ctx.lineTo(physicalPosition.x + absoluteBoxStep, physicalPosition.y - absoluteBoxStep); //top right
			ctx.lineTo(physicalPosition.x + absoluteBoxStep, physicalPosition.y + absoluteBoxStep); //bottom right
			ctx.lineTo(physicalPosition.x - absoluteBoxStep, physicalPosition.y + absoluteBoxStep); //bottom left
			ctx.closePath();
			ctx.strokeStyle = '#fcba03'; //yellow box outline
			ctx.stroke();
			//draw the y axis arrow
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(physicalPosition.x, physicalPosition.y - absoluteBoxStep); //move to center top of box
			ctx.lineTo(physicalPosition.x, physicalPosition.y - (absoluteLineLength + absoluteBoxStep)); //move up
			ctx.closePath();
			ctx.strokeStyle = '#156307';
			ctx.fillStyle = '#156307';
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(
				physicalPosition.x - absoluteArrowSideLength,
				physicalPosition.y - (absoluteLineLength + absoluteBoxStep)
			);
			ctx.lineTo(
				physicalPosition.x,
				physicalPosition.y - (absoluteArrowSideLength + absoluteLineLength + absoluteBoxStep)
			);
			ctx.lineTo(
				physicalPosition.x + absoluteArrowSideLength,
				physicalPosition.y - (absoluteLineLength + absoluteBoxStep)
			);
			ctx.stroke();
			ctx.fill();
			//draw the x axis arrow
			ctx.beginPath();
			ctx.moveTo(physicalPosition.x + absoluteBoxStep, physicalPosition.y);
			ctx.lineTo(physicalPosition.x + absoluteBoxStep + absoluteLineLength, physicalPosition.y);
			ctx.closePath();
			ctx.strokeStyle = '#9c0606';
			ctx.fillStyle = '#9c0606';
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(
				physicalPosition.x + absoluteBoxStep + absoluteLineLength,
				physicalPosition.y - absoluteArrowSideLength
			);
			ctx.lineTo(
				physicalPosition.x + absoluteBoxStep + absoluteLineLength + absoluteArrowSideLength,
				physicalPosition.y
			);
			ctx.lineTo(
				physicalPosition.x + absoluteBoxStep + absoluteLineLength,
				physicalPosition.y + absoluteArrowSideLength
			);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
		function DrawRotateTool(physicalPosition: RigVector2, compact: boolean = true) {
			if (!ctx) return;
			if (compact) {
				absoluteRotationCircleRadius = absoluteRotationCircleRadius / 3;
				absoluteRotationTwoCircleRadius = absoluteRotationTwoCircleRadius / 2;
				ctx.lineWidth = 3;
			}
			ctx.beginPath();
			ctx.arc(physicalPosition.x, physicalPosition.y, absoluteRotationCircleRadius, 0, 360);
			ctx.strokeStyle = '#21a698';
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(physicalPosition.x, physicalPosition.y, absoluteRotationTwoCircleRadius, 0, 360);
			ctx.strokeStyle = '#9b22a3';
			ctx.stroke();
			ctx.closePath();
		}
		function DrawScaleTool(physicalPosition: RigVector2, compact: boolean = true) {
			if (!ctx) return;
			let arrowDistance = compact ? absoluteScaleArrowDistance / 3 : absoluteScaleArrowDistance;
			ctx.lineWidth = 1.5 * scaleUnit;
			//y axis arrow
			ctx.beginPath();
			ctx.moveTo(
				physicalPosition.x - absoluteScaleArrowSideLength,
				physicalPosition.y - arrowDistance
			);
			ctx.lineTo(
				physicalPosition.x,
				physicalPosition.y - arrowDistance - absoluteScaleArrowSideLength
			);
			ctx.lineTo(
				physicalPosition.x + absoluteScaleArrowSideLength,
				physicalPosition.y - arrowDistance
			);
			ctx.strokeStyle = '#d19a04';
			ctx.stroke();
			//x axis arrow
			ctx.beginPath();
			ctx.moveTo(
				physicalPosition.x + arrowDistance,
				physicalPosition.y - absoluteScaleArrowSideLength
			);
			ctx.lineTo(
				physicalPosition.x + arrowDistance + absoluteScaleArrowSideLength,
				physicalPosition.y
			);
			ctx.lineTo(
				physicalPosition.x + arrowDistance,
				physicalPosition.y + absoluteScaleArrowSideLength
			);
			ctx.strokeStyle = '#0551a3';
			ctx.stroke();
		}

		function DrawElement(
			element: RigElement,
			parentPosition: RigVector2,
			xAxis: RigVector2,
			yAxis: RigVector2,
			elementIndex: number
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

			let pointFrame = pageState?.nodeFrames.find(
				(n) => n.nodeType === SelectedNodeType.Element && n.nodeId === element.name
			);
			if (
				!pointFrame ||
				pointFrame.physicalPosition.x !== elementCalculatedPosition.x ||
				pointFrame.physicalPosition.y !== elementCalculatedPosition.y
			) {
				appState.AddOrUpdatePageStateNodeFrame(pageId, {
					nodeId: element.name,
					nodeType: SelectedNodeType.Element,
					physicalPosition: elementCalculatedPosition,
					physicalTransformOrigin: { x: 0, y: 0 },
					worldX: elementWorldX,
					worldY: elementWorldY
				});
			}

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

				let id = GetNameIdForElementPoint(element.name, index);
				let pointFrame = pageState?.nodeFrames.find(
					(n) => n.nodeType === SelectedNodeType.Point && n.nodeId === id
				);
				if (
					!pointFrame ||
					pointFrame.physicalPosition.x !== calculatedPointPosition.x ||
					pointFrame.physicalPosition.y !== calculatedPointPosition.y
				) {
					appState.AddOrUpdatePageStateNodeFrame(pageId, {
						nodeId: id,
						nodeType: SelectedNodeType.Point,
						physicalPosition: calculatedPointPosition,
						physicalTransformOrigin: { x: 0, y: 0 },
						worldX: elementWorldX,
						worldY: elementWorldY
					});
				}
			});
			ctx.closePath();
			ctx.strokeStyle = element.stroke_color;
			ctx.fillStyle = element.fill_color;
			ctx.stroke();
			if (element.filled) ctx.fill();

			let splitSelectedVisualEditorNodeName = pageState?.selectedNode?.name.split('_PIndex_');
			let isParentElement = element.name === splitSelectedVisualEditorNodeName?.[0];

			//debug/visual editor
			element.points.forEach((point, pointIndex) => {
				if (
					element.show_points ||
					(pageState?.visualEditorEnabled &&
						isParentElement &&
						pointIndex === pageState.selectedNode?.index &&
						pageState.selectedNode.type === SelectedNodeType.Point)
				) {
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

					if (
						pageState?.visualEditorEnabled &&
						isParentElement &&
						pointIndex === pageState.selectedNode?.index &&
						pageState.selectedNode.type === SelectedNodeType.Point
					) {
						if (
							calculatedPointPosition.x !== pageState.selectedNodePhysicalPosition?.x ||
							calculatedPointPosition.y !== pageState.selectedNodePhysicalPosition.y
						) {
							appState.UpdatePageStateSelectedNodePhysicalPosition(pageId, calculatedPointPosition);
						}
					}
				}

				let isParentPoint = pointIndex === parseInt(splitSelectedVisualEditorNodeName?.[1] ?? '');
				point.controls?.forEach((control, controlIndex) => {
					if (
						pageState &&
						((point.show_control_points &&
							!pageState.disableAllDebugOptions &&
							!pageState.hideAllElements) ||
							(pageState.visualEditorEnabled &&
								isParentElement &&
								isParentPoint &&
								controlIndex === pageState.selectedNode?.index &&
								pageState.selectedNode.type === SelectedNodeType.ControlPoint))
					) {
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

						if (
							controlIndex === pageState.selectedNode?.index &&
							pageState.visualEditorEnabled &&
							isParentElement &&
							isParentPoint &&
							pageState.selectedNode.type === SelectedNodeType.ControlPoint
						) {
							if (
								pageState.selectedNodePhysicalPosition?.x !== calculatedControlPointPhysical.x ||
								pageState.selectedNodePhysicalPosition.y !== calculatedControlPointPhysical.y
							) {
								//if I don't check whether or not it is different, then it just updates forever and causes an update loop
								appState.UpdatePageStateSelectedNodePhysicalPosition(
									pageId,
									calculatedControlPointPhysical
								);
							}
						}
					}
				});
			});

			if (pageState && !pageState.disableAllDebugOptions) {
				if (
					element.show_position_point ||
					(pageState?.visualEditorEnabled &&
						pageState.selectedNode?.type === SelectedNodeType.Element &&
						element.name === pageState.selectedNode.name)
				) {
					ctx.beginPath();
					ctx.arc(
						elementCalculatedPosition.x,
						elementCalculatedPosition.y,
						element.position_point_radius * scaleUnit,
						0,
						360
					);
					ctx.closePath();
					ctx.fillStyle = element.position_point_color;
					ctx.fill();
					if (
						pageState?.visualEditorEnabled &&
						pageState.selectedNode?.type === SelectedNodeType.Element &&
						element.name === pageState.selectedNode.name
					) {
						if (
							elementCalculatedPosition.x !== pageState.selectedNodePhysicalPosition?.x ||
							elementCalculatedPosition.y !== pageState.selectedNodePhysicalPosition.y
						) {
							appState.UpdatePageStateSelectedNodePhysicalPosition(
								pageId,
								elementCalculatedPosition
							);
						}
					}
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
			ctx.lineWidth = 1;
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

			if (
				(!pageState?.disableAllDebugOptions && rigObject.show_position_point) ||
				(pageState?.visualEditorEnabled && pageState.selectedNode?.type === SelectedNodeType.Root)
			) {
				ctx.beginPath();
				ctx.arc(
					physicalRigCenter.x,
					physicalRigCenter.y,
					rigObject.position_point_radius * scaleUnit,
					0,
					360
				);
				ctx.closePath();
				ctx.fillStyle = rigObject.position_point_color;
				ctx.fill();
				if (
					pageState?.visualEditorEnabled &&
					pageState.selectedNode?.type === SelectedNodeType.Root
				) {
					if (
						physicalRigCenter.x !== pageState.selectedNodePhysicalPosition?.x ||
						physicalRigCenter.y !== pageState.selectedNodePhysicalPosition.y
					) {
						appState.UpdatePageStateSelectedNodePhysicalPosition(pageId, physicalRigCenter);
					}
				}
			}

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

					let pointFrame = pageState?.nodeFrames.find(
						(n) => n.nodeType === SelectedNodeType.Group && n.nodeId === group.id
					);
					if (
						!pointFrame ||
						pointFrame.physicalPosition.x !== groupCalculatedPosition.x ||
						pointFrame.physicalPosition.y !== groupCalculatedPosition.y
					) {
						appState.AddOrUpdatePageStateNodeFrame(pageId, {
							nodeId: group.id,
							nodeType: SelectedNodeType.Group,
							physicalPosition: groupCalculatedPosition,
							physicalTransformOrigin: physicalRigCenter,
							worldX: groupWorldX,
							worldY: groupWorldY
						});
					}

					rigObject.elements
						.filter((e) => e.group_id === group.id)
						.slice()
						.forEach((element, elementIndex) => {
							DrawElement(element, groupCalculatedPosition, groupWorldX, groupWorldY, elementIndex);
						});

					if (!pageState.disableAllDebugOptions && group.visible && !pageState.hideAllGroups) {
						if (
							group.show_position_point ||
							(pageState?.visualEditorEnabled &&
								pageState.selectedNode?.type === SelectedNodeType.Group &&
								group.id === pageState.selectedNode.name)
						) {
							ctx.beginPath();
							ctx.arc(
								groupCalculatedPosition.x,
								groupCalculatedPosition.y,
								group.position_point_radius * scaleUnit,
								0,
								360
							);
							ctx.closePath();
							ctx.fillStyle = group.position_point_color;
							ctx.fill();
							if (
								pageState?.visualEditorEnabled &&
								pageState.selectedNode?.type === SelectedNodeType.Group &&
								group.id === pageState.selectedNode.name
							) {
								if (
									groupCalculatedPosition.x !== pageState.selectedNodePhysicalPosition?.x ||
									groupCalculatedPosition.y !== pageState.selectedNodePhysicalPosition.y
								) {
									appState.UpdatePageStateSelectedNodePhysicalPosition(
										pageId,
										groupCalculatedPosition
									);
								}
							}
						}
						if (group.show_origin_point) {
							ctx.beginPath();
							ctx.arc(
								calculatedGroupOrigin.x,
								calculatedGroupOrigin.y,
								group.origin_point_radius * scaleUnit,
								0,
								360
							);
							ctx.closePath();
							ctx.fillStyle = group.origin_point_color;
							ctx.fill();
						}
					}
				} else if (item.type === RigLayeringOrderNodeType.Element) {
					let elementIndex = rigObject.elements.findIndex((e) => e.name === item.id);
					let element = rigObject.elements[elementIndex];
					if (!element) return;
					DrawElement(element, physicalRigCenter, rigXAxis, rigYAxis, elementIndex);
				} else {
					return;
				}
			});

			//grid overlay
			if (gridOverlay) {
				ctx.lineWidth = 1;
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

			//visual editor tools & stuff
			if (pageState?.visualEditorEnabled) {
				if (
					pageState.selectedNode?.type === SelectedNodeType.Point ||
					pageState.selectedNode?.type === SelectedNodeType.ControlPoint ||
					currentVisualEditorTool === VisualEditorTools.MOVE
				) {
					if (!pageState.selectedNodePhysicalPosition) return;
					DrawMoveTool(pageState.selectedNodePhysicalPosition);
				}

				if (!pageState.selectedNodePhysicalPosition) return;
				switch (currentVisualEditorTool) {
					case VisualEditorTools.ALL:
						DrawMoveTool(pageState.selectedNodePhysicalPosition, true);
						DrawRotateTool(pageState.selectedNodePhysicalPosition, false);
						DrawScaleTool(pageState.selectedNodePhysicalPosition, false);
						break;
					case VisualEditorTools.MOVE:
						DrawMoveTool(pageState.selectedNodePhysicalPosition);
						break;
					case VisualEditorTools.ROTATE:
						DrawRotateTool(pageState.selectedNodePhysicalPosition);
						break;
					case VisualEditorTools.SCALE:
						DrawScaleTool(pageState.selectedNodePhysicalPosition);
						break;
					case VisualEditorTools.SELECT:
						break;
				}
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

		let VisualEditorDragStarted = function (e: MouseEvent) {
			e.preventDefault();
			if (isDragging) return;
			let canvasBoundingRect = canvas.getBoundingClientRect();
			let cursorPhysicalPosition: RigVector2 = {
				x: e.clientX - canvasBoundingRect.left,
				y: e.clientY - canvasBoundingRect.top
			};
			cursorStartPosition = cursorPhysicalPosition;
			if (!pageState?.selectedNodePhysicalPosition) return;
			let isCursorInFreeMoveSquare =
				cursorPhysicalPosition.x >= pageState.selectedNodePhysicalPosition.x - absoluteBoxStep && //cursor.x >= box_left
				cursorPhysicalPosition.x <= pageState.selectedNodePhysicalPosition.x + absoluteBoxStep && //cursor.x <= box_right
				cursorPhysicalPosition.y >= pageState.selectedNodePhysicalPosition.y - absoluteBoxStep && //cursor.y >= box_top
				cursorPhysicalPosition.y <= pageState.selectedNodePhysicalPosition.y + absoluteBoxStep; //cursor.y <= box_bottom

			let isCursorInXAxisArrow =
				cursorPhysicalPosition.x > pageState.selectedNodePhysicalPosition.x + absoluteBoxStep && //on right side of free move box (> to prevent overlapping)
				cursorPhysicalPosition.x <=
					pageState.selectedNodePhysicalPosition.x +
						absoluteBoxStep +
						absoluteLineLength +
						absoluteArrowSideLength && //left of the very tip of the arrow
				cursorPhysicalPosition.y >= pageState.selectedNodePhysicalPosition.y - absoluteBoxStep && // below the top of the free move box
				cursorPhysicalPosition.y <= pageState.selectedNodePhysicalPosition.y + absoluteBoxStep; // above the bottom of the free move box

			let isCursorInYAxisArrow =
				cursorPhysicalPosition.x >= pageState.selectedNodePhysicalPosition.x - absoluteBoxStep && //cursor.x > left of free move box
				cursorPhysicalPosition.x <= pageState.selectedNodePhysicalPosition.x + absoluteBoxStep && // cursor.x < right of free move box
				cursorPhysicalPosition.y < pageState.selectedNodePhysicalPosition.y - absoluteBoxStep && // cursor.y above top of free move box
				cursorPhysicalPosition.y >=
					pageState.selectedNodePhysicalPosition.y -
						absoluteBoxStep -
						absoluteLineLength -
						absoluteArrowSideLength; // cursor.y below tip of y axis arrow

			function getDistanceBetweenTwoPoints(point: RigVector2, point_two: RigVector2): number {
				return Math.sqrt(Math.pow(point_two.x - point.x, 2) + Math.pow(point_two.y - point.y, 2));
			}
			let distanceFromCenter = getDistanceBetweenTwoPoints(
				cursorPhysicalPosition,
				pageState.selectedNodePhysicalPosition
			);
			let rotationCircleRadius =
				currentVisualEditorTool === VisualEditorTools.ROTATE
					? absoluteRotationCircleRadius / 3
					: absoluteRotationCircleRadius;
			let rotationCircleMaxDistance =
				(currentVisualEditorTool === VisualEditorTools.ROTATE ? 7 : 0.5) * scaleUnit;
			let rotationCircleMinDistance =
				(currentVisualEditorTool === VisualEditorTools.ROTATE ? 3 : -3) * scaleUnit;
			let isCursorInRotationCircle = //pain in my fucking ass trying to hone in the distance values.
				distanceFromCenter <= rotationCircleRadius + rotationCircleMaxDistance &&
				distanceFromCenter > rotationCircleRadius + rotationCircleMinDistance;

			let rotationTwoCircleRadius =
				currentVisualEditorTool === VisualEditorTools.ROTATE
					? absoluteRotationTwoCircleRadius / 2
					: absoluteRotationTwoCircleRadius;

			let rotationTwoCircleMaxDistance =
				(currentVisualEditorTool === VisualEditorTools.ROTATE ? 11 : 3) * scaleUnit;
			let rotationTwoCircleMinDistance =
				rotationCircleRadius +
				(currentVisualEditorTool === VisualEditorTools.ROTATE ? 1.5 : -31) * scaleUnit;

			let isCursorInRotationTwoCircle =
				distanceFromCenter <= rotationTwoCircleRadius + rotationTwoCircleMaxDistance &&
				distanceFromCenter > rotationTwoCircleRadius + rotationTwoCircleMinDistance;


			let scaleArrowDistance = (pageState.currentVisualEditorTool === VisualEditorTools.SCALE ? absoluteScaleArrowDistance / 3 : absoluteScaleArrowDistance);
			let isCursorInScaleYAxisArrow =
				cursorPhysicalPosition.x >=
					pageState.selectedNodePhysicalPosition.x - absoluteScaleArrowSideLength &&
				cursorPhysicalPosition.x <=
					pageState.selectedNodePhysicalPosition.x + absoluteScaleArrowSideLength &&
				cursorPhysicalPosition.y >=
					pageState.selectedNodePhysicalPosition.y -
						scaleArrowDistance -
						absoluteScaleArrowSideLength &&
				cursorPhysicalPosition.y <=
					pageState.selectedNodePhysicalPosition.y -
						scaleArrowDistance +
						absoluteScaleArrowSideLength;

			let isCursorInScaleXAxisArrow =
				cursorPhysicalPosition.x <=
					pageState.selectedNodePhysicalPosition.x +
						scaleArrowDistance +
						absoluteScaleArrowSideLength &&
				cursorPhysicalPosition.x >=
					pageState.selectedNodePhysicalPosition.x +
						scaleArrowDistance -
						absoluteScaleArrowSideLength &&
				cursorPhysicalPosition.y <=
					pageState.selectedNodePhysicalPosition.y + absoluteScaleArrowSideLength &&
				cursorPhysicalPosition.y >=
					pageState.selectedNodePhysicalPosition.y - absoluteScaleArrowSideLength;

			function setGrabOffset() {
				grabOffset = {
					x: (pageState?.selectedNodePhysicalPosition?.x ?? 0) - cursorPhysicalPosition.x,
					y: (pageState?.selectedNodePhysicalPosition?.y ?? 0) - cursorPhysicalPosition.y
				};
			}

			/*MOVE TOOL STUFF/ALL TOOL*/
			if (
				(isCursorInFreeMoveSquare && currentVisualEditorTool === VisualEditorTools.MOVE) ||
				currentVisualEditorTool === VisualEditorTools.ALL
			) {
				//console.log('Drag Started');
				setGrabOffset();
				isDragging = true;
				isRotating = false;
				lockHorizontal = false;
				lockVertical = false;
			}

			if (
				(isCursorInXAxisArrow && currentVisualEditorTool === VisualEditorTools.MOVE) ||
				currentVisualEditorTool === VisualEditorTools.ALL
			) {
				setGrabOffset();
				isDragging = true;
				isRotating = false;
				lockHorizontal = true;
				lockVertical = false;
			}

			if (
				(isCursorInYAxisArrow && currentVisualEditorTool === VisualEditorTools.MOVE) ||
				currentVisualEditorTool === VisualEditorTools.ALL
			) {
				setGrabOffset();
				isDragging = true;
				isRotating = false;
				lockHorizontal = false;
				lockVertical = true;
			}

			if (
				((isCursorInRotationCircle || isCursorInRotationTwoCircle) &&
					currentVisualEditorTool === VisualEditorTools.ROTATE) ||
				currentVisualEditorTool === VisualEditorTools.ALL
			) {
				setGrabOffset();
				isDragging = true;
				isRotating = true;
				lockHorizontal = false;
				lockVertical = false;
				rotationCircle = isCursorInRotationCircle ? 'One' : 'Two';
			}

			if (
				((isCursorInScaleYAxisArrow || isCursorInScaleXAxisArrow) &&
					currentVisualEditorTool === VisualEditorTools.SCALE) ||
				currentVisualEditorTool === VisualEditorTools.ALL
			) {
				setGrabOffset();
				isDragging = true;
				isRotating = false;
				isScaling = true;
				lockHorizontal = false;
				lockVertical = false;
				scalingAxis = isCursorInScaleYAxisArrow ? "Y" : "X";
			}

			/*ROTATE TOOL STUFF/ALL TOOL*/
		};
		let handleVisualEditorDrag = function (e: MouseEvent) {
			e.preventDefault();
			if (!isDragging) return;
			//console.log('Dragging');
			let canvasBoundingRect = canvas.getBoundingClientRect();
			let cursorPhysicalPosition: RigVector2 = {
				x: e.clientX - canvasBoundingRect.left,
				y: e.clientY - canvasBoundingRect.top
			};
			let virtualCursorPosition: RigVector2 = {
				x: (cursorPhysicalPosition.x - displayWidth / 2) / scaleUnit,
				y: (cursorPhysicalPosition.y - displayHeight / 2) / scaleUnit
			};
			let fixedMouseVirtualPosition: RigVector2 = {
				x: 0,
				y: 0
			};
			if (!pageState) return;
			switch (currentVisualEditorTool) {
				case VisualEditorTools.MOVE:
					switch (pageState?.selectedNode?.type) {
						case SelectedNodeType.Root:
							if (lockHorizontal && !lockVertical) {
								rigObject.offsets.position.x = virtualCursorPosition.x + grabOffset.x / scaleUnit;
							} else if (!lockHorizontal && lockVertical) {
								rigObject.offsets.position.y = virtualCursorPosition.y + grabOffset.y / scaleUnit;
							} else {
								rigObject.offsets.position = {
									x: virtualCursorPosition.x + grabOffset.x / scaleUnit,
									y: virtualCursorPosition.y + grabOffset.y / scaleUnit
								};
							}
							break;
						case SelectedNodeType.Group:
							let selectedGroup = rigObject.groups.find(
								(g) => g.id === pageState.selectedNode?.name
							);
							if (!selectedGroup) return;
							cursorPhysicalPosition.x += grabOffset.x;
							cursorPhysicalPosition.y += grabOffset.y;
							cursorPhysicalPosition = CalculateNewPhysicalPositionWithParamsInversed(
								physicalRigCenter,
								cursorPhysicalPosition,
								rigObject.offsets.rotation + rigObject.transforms.rotation,
								{
									x: rigObject.offsets.scale.x * rigObject.transforms.scale.x,
									y: rigObject.offsets.scale.y * rigObject.transforms.scale.y
								},
								rigObject.offsets.rotation_two + rigObject.transforms.rotation_two
							);
							virtualCursorPosition = {
								x: (cursorPhysicalPosition.x - displayWidth / 2) / scaleUnit,
								y: (cursorPhysicalPosition.y - displayHeight / 2) / scaleUnit
							};
							fixedMouseVirtualPosition = {
								x: virtualCursorPosition.x - rigObject.offsets.position.x,
								y: virtualCursorPosition.y - rigObject.offsets.position.y
							};
							if (lockHorizontal && !lockVertical) {
								selectedGroup.offsets.position.x = fixedMouseVirtualPosition.x;
							} else if (!lockHorizontal && lockVertical) {
								selectedGroup.offsets.position.y = fixedMouseVirtualPosition.y;
							} else {
								selectedGroup.offsets.position = fixedMouseVirtualPosition;
							}
							break;
						case SelectedNodeType.Element:
							let selectedElement = rigObject.elements.find(
								(e) => e.name === pageState.selectedNode?.name
							);
							if (!selectedElement) return;
							let group = selectedElement.group_id
								? rigObject.groups.find((g) => g.id === selectedElement.group_id)
								: null;

							let groupNodeFrame = group
								? pageState.nodeFrames.find(
										(n) => n.nodeId === group.id && n.nodeType === SelectedNodeType.Group
									)
								: null;
							if (group && !groupNodeFrame) {
								console.error(
									"Element has group, but could not find group's NodeFrame inside of the pageState!"
								);
								return;
							}

							cursorPhysicalPosition.x += grabOffset.x;
							cursorPhysicalPosition.y += grabOffset.y;
							cursorPhysicalPosition = CalculateNewPhysicalPositionWithParamsInversed(
								/*WORKING HERE*/
								group ? groupNodeFrame!.physicalPosition : physicalRigCenter,
								cursorPhysicalPosition,
								group ? group.offsets.rotation + group.transforms.rotation : 0,
								{
									x: group ? group.offsets.scale.x * group.transforms.scale.x : 1,
									y: group ? group.offsets.scale.y * group.transforms.scale.y : 1
								},
								group ? group.offsets.rotation_two + group.transforms.rotation_two : 0
							);
							virtualCursorPosition = {
								x: (cursorPhysicalPosition.x - displayWidth / 2) / scaleUnit,
								y: (cursorPhysicalPosition.y - displayHeight / 2) / scaleUnit
							};
							fixedMouseVirtualPosition = {
								x:
									virtualCursorPosition.x -
									rigObject.offsets.position.x -
									rigObject.transforms.position.x -
									(group ? group.offsets.position.x + group.transforms.position.x : 0),
								y:
									virtualCursorPosition.y -
									rigObject.offsets.position.y -
									rigObject.transforms.position.y -
									(group ? group.offsets.position.y + group.transforms.position.y : 0)
							};
							if (lockHorizontal && !lockVertical) {
								selectedElement.offsets.position.x = fixedMouseVirtualPosition.x;
							} else if (!lockHorizontal && lockVertical) {
								selectedElement.offsets.position.y = fixedMouseVirtualPosition.y;
							} else {
								selectedElement.offsets.position = fixedMouseVirtualPosition;
							}

							break;
						case SelectedNodeType.Point:
							let parentElement = rigObject.elements.find(
								(e) => e.name === pageState.selectedNode?.name.split('_PIndex_')[0]
							);
							if (!parentElement) return;
							let parentElementGroup = parentElement.group_id
								? rigObject.groups.find((g) => g.id === parentElement!.group_id)
								: null;
							let point = parentElement.points[pageState.selectedNode.index];
							if (!point) return;

							let parentElementFrame = parentElement
								? pageState.nodeFrames.find(
										(n) =>
											n.nodeId === parentElement!.name && n.nodeType === SelectedNodeType.Element
									)
								: null;
							if (!parentElementFrame) return;

							cursorPhysicalPosition.x += grabOffset.x;
							cursorPhysicalPosition.y += grabOffset.y;
							cursorPhysicalPosition = CalculateNewPhysicalPositionWithParamsInversed(
								/*WORKING HERE*/
								parentElementFrame.physicalPosition,
								cursorPhysicalPosition,
								parentElement.offsets.rotation + parentElement.transforms.rotation,
								{
									x: parentElement.offsets.scale.x * parentElement.transforms.scale.x,
									y: parentElement.offsets.scale.y * parentElement.transforms.scale.y
								},
								parentElement.offsets.rotation_two + parentElement.transforms.rotation_two
							);
							virtualCursorPosition = {
								x: (cursorPhysicalPosition.x - displayWidth / 2) / scaleUnit,
								y: (cursorPhysicalPosition.y - displayHeight / 2) / scaleUnit
							};
							fixedMouseVirtualPosition = {
								x:
									virtualCursorPosition.x -
									parentElement.offsets.position.x -
									(parentElementGroup?.offsets.position.x ?? 0) -
									rigObject.offsets.position.x,
								y:
									virtualCursorPosition.y -
									parentElement.offsets.position.y -
									(parentElementGroup?.offsets.position.y ?? 0) -
									rigObject.offsets.position.y
							};
							if (lockHorizontal && !lockVertical) {
								point.point.x = fixedMouseVirtualPosition.x;
							} else if (!lockHorizontal && lockVertical) {
								point.point.y = fixedMouseVirtualPosition.y;
							} else {
								point.point = fixedMouseVirtualPosition;
							}
							break;
						case SelectedNodeType.ControlPoint:
							let splitSelectedNodeName = pageState.selectedNode?.name.split('_PIndex_');
							let parentElement2 = rigObject.elements.find(
								(e) => e.name === splitSelectedNodeName[0]
							);
							if (!parentElement2) {
								console.error('Unable to find parentElement of control point!');
								return;
							}
							let parentElementGroup2 = parentElement2.group_id
								? rigObject.groups.find((g) => g.id === parentElement2.group_id)
								: null;
							let point2 = parentElement2.points[parseInt(splitSelectedNodeName[1])];
							if (!point2) {
								console.error('Unable to find parent point for control point!');
								return;
							}

							let parentPointFrame = pageState.nodeFrames.find(
								(n) =>
									n.nodeId ===
										GetNameIdForElementPoint(
											parentElement2.name,
											parseInt(splitSelectedNodeName[1])
										) && n.nodeType === SelectedNodeType.Point
							);
							if (!parentPointFrame) {
								console.error('Unable to find parentPointFrame!');
								return;
							}

							let parentElement2Frame = pageState.nodeFrames.find(
								(n) => n.nodeId === parentElement2.name && n.nodeType === SelectedNodeType.Element
							);
							if (!parentElement2Frame) {
								console.error('Unable to find nodeFrame for parentElement2 for control point!');
								return;
							}

							let controlPoint = point2.controls?.[pageState.selectedNode.index];
							if (!controlPoint) {
								console.error('Unable to find control point in parentPoint!');
								return;
							}

							cursorPhysicalPosition.x += grabOffset.x;
							cursorPhysicalPosition.y += grabOffset.y;
							cursorPhysicalPosition = CalculateNewPhysicalPositionWithParamsInversed(
								parentElement2Frame.physicalPosition,
								cursorPhysicalPosition,
								parentElement2.offsets.rotation + parentElement2.transforms.rotation,
								{
									x: parentElement2.offsets.scale.x * parentElement2.transforms.scale.x,
									y: parentElement2.offsets.scale.y * parentElement2.transforms.scale.y
								},
								parentElement2.offsets.rotation_two + parentElement2.transforms.rotation_two
							);
							virtualCursorPosition = {
								x: (cursorPhysicalPosition.x - displayWidth / 2) / scaleUnit,
								y: (cursorPhysicalPosition.y - displayHeight / 2) / scaleUnit
							};
							fixedMouseVirtualPosition = {
								x:
									virtualCursorPosition.x -
									point2.point.x -
									parentElement2.offsets.position.x -
									(parentElementGroup2?.offsets.position.x ?? 0) -
									rigObject.offsets.position.x,
								y:
									virtualCursorPosition.y -
									point2.point.y -
									parentElement2.offsets.position.y -
									(parentElementGroup2?.offsets.position.y ?? 0) -
									rigObject.offsets.position.y
							};
							if (lockHorizontal && !lockVertical) {
								controlPoint.x = fixedMouseVirtualPosition.x;
							} else if (!lockHorizontal && lockVertical) {
								controlPoint.y = fixedMouseVirtualPosition.y;
							} else {
								controlPoint.x = fixedMouseVirtualPosition.x;
								controlPoint.y = fixedMouseVirtualPosition.y;
							}
							break;
						default:
							return;
					}
					break;
				case VisualEditorTools.ROTATE:
					if (!isRotating || !pageState.selectedNodePhysicalPosition || !pageState.selectedNode)
						return;
					let startVector: RigVector2 = {
						x: cursorStartPosition.x - pageState.selectedNodePhysicalPosition.x,
						y: cursorStartPosition.y - pageState.selectedNodePhysicalPosition.y
					};
					let currentVector: RigVector2 = {
						x: cursorPhysicalPosition.x - pageState.selectedNodePhysicalPosition.x,
						y: cursorPhysicalPosition.y - pageState.selectedNodePhysicalPosition.y
					};
					let startAngle = Math.atan2(startVector.x, startVector.y);
					let currentAngle = Math.atan2(currentVector.x, currentVector.y);
					let angleDelta = -(currentAngle - startAngle); //-output to make it so it rotates correctly with the mouse
					let degreesRotation = angleDelta * (180 / Math.PI);
					degreesRotation = ((degreesRotation % 360) + 360) % 360; //first gets the remainder then add 360 to keep it positve then if it was already positive do % 360 to lock it between 0 and 360 again.
					switch (pageState?.selectedNode?.type) {
						case SelectedNodeType.Root:
							if (rotationCircle === 'One') rigObject.offsets.rotation = degreesRotation;
							else if (rotationCircle === 'Two') rigObject.offsets.rotation_two = degreesRotation;
							break;
						case SelectedNodeType.Group:
							let currentGroup = rigObject.groups.find(
								(g) => g.id === pageState.selectedNode?.name
							);
							if (!currentGroup) return;
							if (rotationCircle === 'One') currentGroup.offsets.rotation = degreesRotation;
							else if (rotationCircle === 'Two')
								currentGroup.offsets.rotation_two = degreesRotation;
							break;
						case SelectedNodeType.Element:
							let currentElement = rigObject.elements.find(
								(e) => e.name === pageState.selectedNode?.name
							);
							if (!currentElement) return;
							if (rotationCircle === 'One') currentElement.offsets.rotation = degreesRotation;
							else if (rotationCircle === 'Two')
								currentElement.offsets.rotation_two = degreesRotation;
							break;
					}
					break;
				case VisualEditorTools.SCALE:
					console.log("scale drag");
					if (!pageState.selectedNodePhysicalPosition || !isScaling || (scalingAxis !== "X" && scalingAxis !== "Y")) return;
					let scaleDistance = scalingAxis === "X" ? cursorPhysicalPosition.x - cursorStartPosition.x : cursorPhysicalPosition.y - cursorStartPosition.y;
					let scaleDelta = (scaleDistance * scaleStep) * scaleUnit;
					let scaleArrowDistance = (pageState.currentVisualEditorTool === VisualEditorTools.SCALE ? absoluteScaleArrowDistance / 3 : absoluteScaleArrowDistance);
					if (lastScaleDistance === null) lastScaleDistance = scaleDistance;
					switch (pageState?.selectedNode?.type) {
						case SelectedNodeType.Root:
							if (scalingAxis === "X") {
								scaleDelta = cursorPhysicalPosition.x < pageState.selectedNodePhysicalPosition.x + scaleArrowDistance + absoluteScaleArrowSideLength / 2 ? -scaleDelta : scaleDelta;
								if (scaleDistance < lastScaleDistance) rigObject.offsets.scale.x -= scaleDelta;
								if (scaleDistance > lastScaleDistance) rigObject.offsets.scale.x += scaleDelta;
							} else {
								scaleDelta = cursorPhysicalPosition.y > pageState.selectedNodePhysicalPosition.y - scaleArrowDistance - absoluteScaleArrowSideLength / 2 ? -scaleDelta : scaleDelta;
								if (scaleDistance < lastScaleDistance) rigObject.offsets.scale.y -= scaleDelta;
								if (scaleDistance > lastScaleDistance) rigObject.offsets.scale.y += scaleDelta;
							}
							lastScaleDistance = scaleDistance;
							break;
						case SelectedNodeType.Group:
							let currentGroup = rigObject.groups.find(g => g.id === pageState.selectedNode?.name);
							if (!currentGroup) return;
							if (scalingAxis === "X") {
								scaleDelta = cursorPhysicalPosition.x < pageState.selectedNodePhysicalPosition.x + scaleArrowDistance + absoluteScaleArrowSideLength / 2 ? -scaleDelta : scaleDelta;
								console.log(lastScaleDistance, scaleDistance);
								if (scaleDistance < lastScaleDistance) currentGroup.offsets.scale.x -= scaleDelta;
								if (scaleDistance > lastScaleDistance) currentGroup.offsets.scale.x += scaleDelta;
							} else {
								scaleDelta = cursorPhysicalPosition.y > pageState.selectedNodePhysicalPosition.y - scaleArrowDistance - absoluteScaleArrowSideLength / 2 ? -scaleDelta : scaleDelta;
								if (scaleDistance < lastScaleDistance) currentGroup.offsets.scale.y -= scaleDelta;
								if (scaleDistance > lastScaleDistance) currentGroup.offsets.scale.y += scaleDelta;
							}
							lastScaleDistance = scaleDistance;
							break;
						case SelectedNodeType.Element:
							let currentElement = rigObject.elements.find(e => e.name === pageState.selectedNode?.name);
							if (!currentElement) return;
							if (scalingAxis === "X") {
								scaleDelta = cursorPhysicalPosition.x < pageState.selectedNodePhysicalPosition.x + scaleArrowDistance + absoluteScaleArrowSideLength / 2 ? -scaleDelta : scaleDelta;
								console.log(lastScaleDistance, scaleDistance);
								if (scaleDistance < lastScaleDistance) currentElement.offsets.scale.x -= scaleDelta;
								if (scaleDistance > lastScaleDistance) currentElement.offsets.scale.x += scaleDelta;
							} else {
								scaleDelta = cursorPhysicalPosition.y > pageState.selectedNodePhysicalPosition.y - scaleArrowDistance - absoluteScaleArrowSideLength / 2 ? -scaleDelta : scaleDelta;
								if (scaleDistance < lastScaleDistance) currentElement.offsets.scale.y -= scaleDelta;
								if (scaleDistance > lastScaleDistance) currentElement.offsets.scale.y += scaleDelta;
							}
							lastScaleDistance = scaleDistance;
							break;
					}
					break;
				default:
					return;
			}
		};
		let handleVisualEditorDragEnded = function (e: MouseEvent) {
			e.preventDefault();
			if (!isDragging) return;
			isDragging = false;
			isRotating = false;
			isScaling = false;
			lockHorizontal = false;
			lockVertical = false;
			cursorStartPosition = { x: 0, y: 0 };
			rotationCircle = 'One';
			scalingAxis = 'X';
			lastScaleDistance = null;
		};
		canvas.onmousedown = pageState?.visualEditorEnabled ? VisualEditorDragStarted : null;
		canvas.onmousemove = pageState?.visualEditorEnabled ? handleVisualEditorDrag : null;
		canvas.onmouseup = pageState?.visualEditorEnabled ? handleVisualEditorDragEnded : null;

		//save preview render to rigObject on every change
		if (rigObject) {
			rigObject.previewRender = canvas.toDataURL();
		}
	});

	$effect(() => {
		if (
			pageState?.selectedNode &&
			(pageState.selectedNode.type === SelectedNodeType.Point ||
				pageState.selectedNode.type === SelectedNodeType.ControlPoint) &&
			pageState.currentVisualEditorTool !== VisualEditorTools.MOVE
		) {
			//force points and control points to use the move tool
			pageState.clickedOnPoint = true;
			pageState.lastVisualEditorTool = pageState.currentVisualEditorTool;
			appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.MOVE);
			return;
		} else {
			if (!pageState?.selectedNode) return;
			if (
				pageState.clickedOnPoint &&
				pageState.selectedNode.type !== SelectedNodeType.Point &&
				pageState.selectedNode.type !== SelectedNodeType.ControlPoint
			) {
				pageState.clickedOnPoint = false;
				appState.UpdatePageStateVisualEditorTool(pageId, pageState.lastVisualEditorTool);
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
						class="toolbar-button {currentVisualEditorTool === VisualEditorTools.ALL
							? 'selected'
							: ''}"
						title="Transform Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.ALL);
							console.log('test');
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
						class="toolbar-button {currentVisualEditorTool === VisualEditorTools.MOVE
							? 'selected'
							: ''}"
						title="Move Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.MOVE);
							console.log('test 2');
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
						class="toolbar-button {currentVisualEditorTool === VisualEditorTools.ROTATE
							? 'selected'
							: ''}"
						title="Rotate Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.ROTATE);
							console.log('test 3');
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
						class="toolbar-button {currentVisualEditorTool === VisualEditorTools.SCALE
							? 'selected'
							: ''}"
						title="Scale Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.SCALE);
							console.log('test 4');
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
					<button
						class="toolbar-button {currentVisualEditorTool === VisualEditorTools.SELECT
							? 'selected'
							: ''}"
						title="Select Tool"
						onclick={() => {
							appState.UpdatePageStateVisualEditorTool(pageId, VisualEditorTools.SELECT);
							console.log('test 5');
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-mouse-pointer-click preview-icon"
							><path d="M14 4.1 12 6" /><path d="m5.1 8-2.9-.8" /><path d="m6 12-1.9 2" /><path
								d="M7.2 2.2 8 5.1"
							/><path
								d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"
							/></svg
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
		z-index: 2;

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
