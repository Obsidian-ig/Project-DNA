export interface RigVector2 {
    x: number;
    y: number;
}

export const RigPointInterpolationType = {
    Linear: 'Linear',
    QuadraticBezierCurve: 'Quadratic',
    CubicBezierCurve: 'Cubic'
} as const;
export type RigPointInterpolationType =
    (typeof RigPointInterpolationType)[keyof typeof RigPointInterpolationType];

export interface RigPoint {
    point: RigVector2;
    interpolation_type: RigPointInterpolationType;
    controls?: RigVector2[]; //for the interpolation
}
export interface RigElement {
    name: string;
    group_id: string | null | undefined;
    expanded: boolean; // runtime only
    visible: boolean;
    show_position_point: boolean;
    show_origin_point: boolean;
    offsets: {
        position: RigVector2;
        rotation: number;
        scale: RigVector2;
        rotation_two: number;
        transform_origin: RigVector2;
    };
    position: RigVector2; // runtime only
    rotation: number; // runtime only
    scale: RigVector2; // runtime only
    rotation_two: number; // runtime only
    points: RigPoint[];
    filled: boolean;
    fill_color: string;
    stroke_color: string;
}
export interface RigGroup {
    id: string;
    expanded: boolean; // runtime only
    visible: boolean;
    offsets: {
        position: RigVector2;
        rotation: number;
        scale: RigVector2;
        rotation_two: number
    };
    position: RigVector2; // runtime only
    rotation: number; // runtime only
    scale: RigVector2; // runtime only
    rotation_two: number; // runtime only
}
export interface RigEnum {
    id: string;
    allowed_values: any[];
}
export interface RigState {
    id: string; // id of enum to use
    state: string; // value of enum to use
}
export const RigStateRuleComparisonType = {
    equal_to: '==',
    not_equal_to: '!=',
    less_or_equal_to: '<=',
    greater_or_equal_to: '>=',
    less_than: '<',
    greater_than: '>'
};
export type RigStateRuleComparisonType = (typeof RigStateRuleComparisonType)[keyof typeof RigStateRuleComparisonType];
export interface RigStateRuleWhenTrigger {
    property: string;
    comparison: RigStateRuleComparisonType;
    value: string | number | boolean;
    required: boolean;
}
export interface RigStateRule {
    when: RigStateRuleWhenTrigger[];
    state: RigState;
    priority: number; // state rule with the highest priority and all values true happens/takes over.
}

export const RigEventTriggerType = {
    On_Charging_Started: "battery.chargingStarted",
    On_Charging_Ended: "battery.chargingEnded",
    On_Other_Device_Connected: "bluetooth.otherDeviceConnected",
    On_Other_Device_Disconnected: "bluetooth.otherDeviceDisconnected",
    On_Face_Detected: "sensors.faceDetected",
    On_Face_Recognized: "sensors.faceRecognized",
    On_Face_Lost: "sensors.faceLost",
    On_User_Device_Connected: "bluetooth.userDeviceConnected",
    On_User_Device_Disconnected: "bluetooth.userDeviceDisconnected",
    On_Wake_Word: "voice.wakeWordDetected",
    On_Valid_Voice_Command: "voice.validVoiceCommand",
    On_Unknown_Voice_Command: "voice.unknownVoiceCommand",
    On_Error: "error",
    On_State_Entered: "state.entered",
    On_State_Exited: "state.exited",
    On_Bumped: "sensors.bumped",
    On_Tapped: "screen.tapped",
    On_Double_Tapped: "screen.doubleTapped",
    On_Drag: "screen.dragStarted",
    On_Drag_End: "screen.dragEnded",
    On_Swiped: "screen.swiped",
    On_Listening_Started: "voice.listeningStarted",
    On_Listening_Ended: "voice.listeningEnded",
    On_Thinking_Started: "voice.thinkingStarted",
    On_Thinking_Ended: "voice.thinkingEnded",
    On_Speaking_Started: "voice.speakingStarted",
    On_Speaking_Ended: "voice.speakingEnded",
    On_Media_Resumed: "media.resumed",
    On_Media_Paused: "media.paused",
    On_Media_Next: "media.next",
    On_Media_Previous: "media.previous",
    On_Media_Volume_Increased: "media.volumeIncreased",
    On_Media_Volume_Decreased: "media.volumeDecreased",
    On_Notification_Received: "phone.notification",
    On_Call_Incoming: "phone.callIncoming",
    On_Call_Answered: "phone.callAccepted",
    On_Call_Declined: "phone.callDeclined"
};
export const RigEventModeType = {
    Set: 'set',
    Add: 'add',
    Divide: 'divide',
    Multiply: 'multiply',
    play_animation: 'play_animation',
    play_animation_random: 'play_animation_random'
}
export type RigEventModeType =
    (typeof RigEventModeType)[keyof typeof RigEventModeType];

export const RigIfBusyActionType = {
    queue: 'queue',
    interrupt: 'interrupt',
    skip: 'skip'
};
export type RigIfBusyActionType  = (typeof RigIfBusyActionType)[keyof typeof RigIfBusyActionType];
export interface RigEvent {
    on: string[]; // list of all events to subscribe to like: 'chargingStarted'
    do: {
        mode: RigEventModeType;
        parameter?: string; // 'parameter' to modify
        value?: string; // value to use to modify the parameter
        animation_id?: string; // id of animation to play
        animation_group_id?: string; // id of animation group to choose from
        if_busy: RigIfBusyActionType; // how the device will handle the action depending on if it is busy or not
    }[];
}


export const RigLayeringOrderNodeType = {
    Group: 'group',
    Element: 'element'
};
export type RigLayeringOrderNodeType = (typeof RigLayeringOrderNodeType)[keyof typeof RigLayeringOrderNodeType];
export interface RigObject {
    name: string;
    rig_version: number; //the version of the rig itself
    rig_structure_version: number; //the version of the rig data structure it uses.
    author: string;
    author_link: string;
    last_updated_utc: Date;
    expanded: boolean; // runtime only
    disable_all_debug_options: boolean;
    hide_all_elements: boolean;
    base: {
        // essentially the initial "offsets" of the rig. The initial values everything else is based off of.
        starting_position: RigVector2;
        starting_rotation: number;
        starting_scale: RigVector2;
    };
    position: RigVector2; // runtime only
    rotation: number; // runtime only
    scale: RigVector2; // runtime only
    layering_order: {
        type: RigLayeringOrderNodeType; // whether or not the item is a group or element
        id: string; // id of group or element
    }[];
    elements: RigElement[];
    groups: RigGroup[];
    enums: RigEnum[]; //defines strict allowed values to fields with the id of the enum. Will throw error if field contains value the enum doesn't.
    default_state: RigState;
    state_rules: RigStateRule[];
    events: RigEvent[];
}


export const SelectedNodeType = {
    Root: 'Root',
    Group: 'Group',
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