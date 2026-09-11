export interface RigVector2 {
    x: number;
    y: number;
}
export const RigPath2InterpolationType = {
    Linear: 'Linear',
    QuadraticBezierCurve: 'QuadraticBezierCurve',
    CubicBezierCurve: 'CubicBezierCurve'
} as const;
export type RigPath2InterpolationType =
    (typeof RigPath2InterpolationType)[keyof typeof RigPath2InterpolationType];
export interface RigPath2 {
    point_one: RigVector2;
    point_two: RigVector2;
    interpolation_type: RigPath2InterpolationType;
}
export interface RigElement {
    name: string;
    expanded: boolean;
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
export interface RigObject {
    name: string;
    rig_version: number; //the version of the rig itself
    rig_structure_version: number; //the version of the rig data structure it uses.
    expanded: boolean;
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
export const SelectedNodeType = {
    Root: 'Root',
    Element: 'Element',
    Path: 'Path',
    None: 'None'
} as const;
export type SelectedNodeType = (typeof SelectedNodeType)[keyof typeof SelectedNodeType];
export interface SelectedNode {
    name: string;
    type: SelectedNodeType;
    index: number;
}