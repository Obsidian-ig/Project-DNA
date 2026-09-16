export interface RigVector2 {
    x: number;
    y: number;
}
export interface RigVector3 {
    x: number;
    y: number;
    z: number;
}
export const RigPath2InterpolationType = {
    Linear: 'Linear',
    QuadraticBezierCurve: 'QuadraticBezierCurve',
    CubicBezierCurve: 'CubicBezierCurve'
} as const;
export type RigPath2InterpolationType =
    (typeof RigPath2InterpolationType)[keyof typeof RigPath2InterpolationType];
export interface RigPathPoint {
    point: RigVector2;
    interpolation_type: RigPath2InterpolationType;
    controls?: RigVector2[]; //for the interpolation
}
export interface RigElement {
    name: string;
    expanded: boolean;
    offsets: {
        position: RigVector2;
        rotation: RigVector3;
        scale: RigVector2;
    };
    position: RigVector2;
    rotation: RigVector3;
    scale: RigVector2;
    transform_origin: RigVector2; // the origin point in which modifications happen. idk how this works/how to implement it tho
    points: RigPathPoint[];
    closed: boolean; //whether or not the last point should automatically connect to  the first point.
    filled: boolean;
    fill_color: string;
    stroke_color: string;
}
export interface RigEnum {
    id: string;
    allowed_values: any[];
}
export interface RigObject {
    name: string;
    rig_version: number; //the version of the rig itself
    rig_structure_version: number; //the version of the rig data structure it uses.
    author: string;
    author_link: string;
    last_updated_utc: Date;
    expanded: boolean;
    base: {
        // essentially the initial "offsets" of the rig. The initial values everything else is based off of.
        starting_position: RigVector2;
        starting_rotation: RigVector3;
        starting_scale: RigVector2;
    };
    position: RigVector2;
    rotation: RigVector3;
    scale: RigVector2;
    elements: RigElement[];
    enums: RigEnum[]; //defines strict allowed values to fields with the id of the enum. Will throw error if field contains value the enum doesn't.
    //add animations field/data types later
}
export const SelectedNodeType = {
    Root: 'Root',
    Element: 'Element',
    Point: 'Point',
    None: 'None'
} as const;
export type SelectedNodeType = (typeof SelectedNodeType)[keyof typeof SelectedNodeType];
export interface SelectedNode {
    name: string;
    type: SelectedNodeType;
    index: number;
}