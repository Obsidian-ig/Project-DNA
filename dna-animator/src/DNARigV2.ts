export interface RigVector2 {
    x: number;
    y: number;
};

export const RigPointInterpolationType = {
    Linear: 'Linear',
    QuadraticBezierCurve: 'Quadratic',
    CubicBezierCurve: 'Cubic'
} as const;
export type RigPointInterpolationType =
    (typeof RigPointInterpolationType)[keyof typeof RigPointInterpolationType];

export interface LiveTransforms {
    position: RigVector2;
    rotation: number;
    scale: RigVector2;
    rotation_two: number;
};

export interface RigPoint {
    point: RigVector2;
    interpolation_type: RigPointInterpolationType;
    controls?: RigVector2[]; //for the interpolation
};
export interface RigElement {
    name: string;
    group_id?: string;
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
    transforms: LiveTransforms;
    points: RigPoint[];
    closed: boolean;
    filled: boolean;
    fill_color: string;
    stroke_color: string;
};
export const RigElementParameters = {
    visible: 'visible',
    position_x: 'position.x',
    position_y: 'position.y',
    rotation: 'rotation',
    scale_x: 'scale.x',
    scale_y: 'scale.y',
    rotation_two: 'rotation_two',
    closed: 'closed',
    filled: 'filled',
    fill_color: 'fill_color',
    stroke_color: 'stroke_color'
} as const;
export type RigElementParameters = (typeof RigElementParameters)[keyof typeof RigElementParameters];

export interface RigGroup {
    id: string;
    visible: boolean;
    offsets: {
        position: RigVector2;
        rotation: number;
        scale: RigVector2;
        rotation_two: number;
        transform_origin: RigVector2;
    };
    transforms: LiveTransforms;
};
export const RigGroupParameters = {
    visible: 'visible',
    position_x: 'position.x',
    position_y: 'position.y',
    rotation: 'rotation',
    scale_x: 'scale.x',
    scale_y: 'scale.y',
    rotation_two: 'rotation_two'
} as const;
export type RigGroupParameters = (typeof RigGroupParameters)[keyof typeof RigGroupParameters];

export interface RigEnum {
    id: string;
    allowed_values: (string | boolean | number)[];
};
export interface RigState {
    state: string; // value of state enum to use
};

export const RigStateRuleComparisonType = {
    equal_to: '==',
    not_equal_to: '!=',
    less_or_equal_to: '<=',
    greater_or_equal_to: '>=',
    less_than: '<',
    greater_than: '>'
} as const;
export type RigStateRuleComparisonType = (typeof RigStateRuleComparisonType)[keyof typeof RigStateRuleComparisonType];
export interface RigStateRuleWhenTrigger {
    property: string;
    comparison: RigStateRuleComparisonType;
    value: string | number | boolean;
    required: boolean;
};
export interface RigStateRule {
    when: RigStateRuleWhenTrigger[];
    state: RigState;
    priority: number; // state rule with the highest priority and all values true happens/takes over.
};

export const RigEventTriggerType = {
    //battery
    On_Charging_Started: "battery.chargingStarted",
    On_Charging_Ended: "battery.chargingEnded",
    //bluetooth
    On_Other_Device_Connected: "bluetooth.otherDeviceConnected", //other Helix
    On_Other_Device_Disconnected: "bluetooth.otherDeviceDisconnected", //other Helix
    On_User_Device_Connected: "bluetooth.userDeviceConnected",
    On_User_Device_Disconnected: "bluetooth.userDeviceDisconnected",
    //vision
    On_Face_Detected: "vision.faceDetected",
    On_Face_Recognized: "vision.faceRecognized",
    On_Face_Lost: "vision.faceLost",
    //voice & assistant
    On_Wake_Word: "voice.wakeWordDetected",
    On_Valid_Voice_Command: "voice.validVoiceCommand",
    On_Unknown_Voice_Command: "voice.unknownVoiceCommand",
    On_Listening_Started: "voice.listeningStarted",
    On_Listening_Ended: "voice.listeningEnded",
    On_Speaking_Started: "voice.speakingStarted",
    On_Speaking_Ended: "voice.speakingEnded",
    On_Thinking_Started: "assistant.thinkingStarted",
    On_Thinking_Ended: "assistant.thinkingEnded",
    //states & rig
    On_State_Entered: "state.entered",
    On_State_Exited: "state.exited",
    On_Anim_Finished: "rig.animFinished",
    //motions
    On_Bumped: "motion.bumped",
    //screen/display
    On_Tapped: "screen.tapped",
    On_Long_Press: "screen.longPress",
    On_Double_Tapped: "screen.doubleTapped",
    On_Triple_Tapped: "screen.tripleTapped",
    On_Drag: "screen.dragStarted",
    On_Drag_End: "screen.dragEnded",
    On_Swiped: "screen.swiped",
    On_Wake: "screen.wake",
    On_Sleep: "screen.sleep",
    //media
    On_Media_Resumed: "media.resumed",
    On_Media_Paused: "media.paused",
    On_Media_Next: "media.next",
    On_Media_Previous: "media.previous",
    On_Media_Volume_Changed: "media.volumeChanged",
    //phone settings
    On_Notification_Received: "phone.notification",
    On_Call_Incoming: "phone.callIncoming",
    On_Call_Answered: "phone.callAnswered",
    On_Call_Declined: "phone.callDeclined",
    On_DND_Enabled: "phone.dndEnabled",
    On_DND_Disabled: "phone.dndDisabled",
    On_Airplane_Mode_Enabled: "phone.airplaneEnabled",
    On_Airplane_Mode_Disabled: "phone.airplaneDisabled",
    On_Flashlight_Enabled: "phone.flashlightEnabled",
    On_Flashlight_Disabled: "phone.flashlightDisabled",
    On_WiFi_Connected: "phone.wifiConnected",
    On_WiFi_Disconnected: "phone.wifiDisconnected",
    On_Gesture_Detected: "gestures.detected",
    //system
    On_System_Init: "system.init",
    On_System_Error: "system.error",
} as const;
export type RigEventTriggerType = (typeof RigEventTriggerType)[keyof typeof RigEventTriggerType];
export const RigEventModeType = {
    Set: 'set',
    Add: 'add',
    Multiply: 'multiply',
    play_animation: 'play_animation',
    play_animation_random: 'play_animation_random',
    set_state: 'set_state'
} as const;
export type RigEventModeType =
    (typeof RigEventModeType)[keyof typeof RigEventModeType];

export const RigIfBusyActionType = {
    queue: 'queue',
    interrupt: 'interrupt',
    skip: 'skip'
} as const;
export type RigIfBusyActionType = (typeof RigIfBusyActionType)[keyof typeof RigIfBusyActionType];

export type RigModifier = 
{
    target_type: 'root';
    target?: never;
    parameter: RigParameters;
    mode: 'set' | 'add' | 'multiply';
    value: number;
} |
{
    target_type: 'group';
    target: string;
    parameter: RigGroupParameters;
    mode: 'set' | 'add' | 'multiply';
    value: number | boolean;
} |
{
    target_type: 'element';
    target: string;
    parameter: RigElementParameters;
    mode: 'set' | 'add' | 'multiply';
    value: number | boolean;
}

export type RigAction = 
{
    mode: 'modify';
    modifier: RigModifier;
} |
{
    mode: 'play_animation';
    animation_id: string;
    if_busy: RigIfBusyActionType;
} |
{
    mode: 'play_animation_random';
    animation_group_id: string;
    if_busy: RigIfBusyActionType;
};



export interface RigEvent {
    on: RigEventTriggerType[]; // list of all events to subscribe to like: 'chargingStarted'
    when?: RigStateRuleWhenTrigger[]; // run the "do" when the event is triggered and the when is true.
    do: RigAction[];
};

export const RigLayeringOrderNodeType = {
    Group: 'group',
    Element: 'element'
} as const;
export type RigLayeringOrderNodeType = (typeof RigLayeringOrderNodeType)[keyof typeof RigLayeringOrderNodeType];

export interface RigActionGroupModifier {
    target: string; //name of group
    target_type: 'group';
    mode: 'set' | 'add' | 'multiply';
    property: RigGroupParameters;
    value: number;
}
export interface RigActionElementModifier {
    target: string; //name of element
    target_type: 'element';
    mode: 'set' | 'add' | 'multiply';
    property: RigElementParameters;
    value: number | string | boolean;
}
export interface RigPoseState {
    id: string;
    modifiers: (RigActionGroupModifier | RigActionElementModifier)[];
};
export interface RigPose {
    id: string;
    states: RigPoseState[];
};

export interface RigAnimationKeyframe {
    time_ms: number; //point in animation timeline to run
    modifiers: (RigActionGroupModifier | RigActionElementModifier)[];
}
export interface RigAnimation {
    name: string;
    anim_group_id: string;
    duration_ms: number;
    loop: boolean;
    keyframes: RigAnimationKeyframe[];
};

export const HardwareSensors = {
    Accelerometer: 'accel',
    Gyro: 'gyro',
    GPS: 'gps',
    Haptic: 'haptic_motor',
    Thermal: 'thermal',
    Camera: 'camera',
    TOF: 'time_of_flight_distance',
    Environment: 'environment',
    CO2: 'co2',
    Magnometer: 'magnometer',
    AmbientLight: 'ambient_light'
} as const;
export type HardwareSensors = (typeof HardwareSensors)[keyof typeof HardwareSensors];

export const RigParameters = {
    position_x: 'position.x',
    position_y: 'position.y',
    rotation: 'rotation',
    scale_x: 'scale.x',
    scale_y: 'scale.y',
    rotation_two: 'rotation_two'
} as const;
export type RigParameters = (typeof RigParameters)[keyof typeof RigParameters];

export const DeviceParameters = {
    battery_percent: 'battery.percent',
    battery_is_charging: 'battery.isCharging',
    battery_is_full: 'battery.isFull',
    bluetooth_is_enabled: 'bluetooth.isEnabled',
    bluetooth_is_user_device_connected: 'bluetooth.isUserDeviceConnected',
    bluetooth_is_other_device_connected: 'bluetooth.isOtherDeviceConnected',
    vision_is_face_detected: 'vision.isFaceDetected',
    vision_is_face_recognized: 'vision.isFaceRecognized',
    voice_is_listening: 'voice.isListening',
    voice_is_speaking: 'voice.isSpeaking',
    assistant_is_thinking: 'assistant.isThinking',
    rig_state: 'rig.state',
    rig_is_playing_animation: 'rig.isPlayingAnimation',
    motion_is_shaking: 'motion.isShaking',
    motion_tilt_x: 'motion.tilt.x',
    motion_tilt_y: 'motion.tilt.y',
    motion_pitch: 'motion.pitch',
    motion_roll: 'motion.roll',
    motion_heading: 'motion.heading',
    motion_rotation_rate_x: 'motion.rotation.rate.x',
    motion_rotation_rate_y: 'motion.rotation.rate.y',
    motion_rotation_rate_z: 'motion.rotation.rate.z',
    motion_accel_x: 'motion.accel.x',
    motion_accel_y: 'motion.accel.y',
    motion_accel_z: 'motion.accel.z',
    motion_intensity: 'motion.intensity',
    motion_is_still: 'motion.isStill',
    motion_facing_direction: 'motion.facingDirection', //enum up, down, left, right, front, back.
    gps_speed_mph: 'motion.speed.mph',
    gps_speed_kph: 'motion.speed.kph',
    gps_longitude: 'gps.longitude',
    gps_latitude: 'gps.latitude',
    screen_is_touching: 'screen.isTouching',
    screen_is_dragging: 'screen.isDragging',
    screen_is_awake: 'screen.isAwake',
    media_is_playing: 'media.isPlaying',
    media_is_muted: 'media.isMuted',
    phone_is_call_incoming: 'phone.isCallIncoming',
    phone_is_call_active: 'phone.isCallActive',
    phone_is_dnd_enabled: 'phone.isDNDEnabled',
    phone_is_airplane_mode_enabled: 'phone.isAirplaneModeEnabled',
    phone_is_flashlight_enabled: 'phone.isFlashlightEnabled',
    phone_is_wifi_connected: 'phone.isWifiConnected',
    gesture_is_gesture_detected: 'gesture.isGestureDetected',
    gesture_current_gesture: 'gesture.gesture',
    system_is_initializing: 'system.isInitializing',
    system_is_error: 'system.isError',
    system_is_battery_saver_enabled: 'system.isBatterySaverEnabled',
    system_is_car_mode_enabled: 'system.isCarModeEnabled',
    system_is_wifi_enabled: 'system.isWifiEnabled',
    system_is_vision_enabled: 'system.isVisionEnabled',
    system_is_dnd_enabled: 'system.isDNDEnabled', //on device do not disturb.
} as const;
export type DeviceParameters = (typeof DeviceParameters)[keyof typeof DeviceParameters];

export type RigBinding = 
{
    target: string;
    target_type: 'root';
    parameter: RigParameters;
    input_parameter: DeviceParameters | RigParameters | RigGroupParameters | RigElementParameters;
    factor: number;
    min: number;
    max: number;
} |
{
    target: string;
    target_type: 'group';
    parameter: RigGroupParameters;
    input_parameter: DeviceParameters | RigParameters | RigGroupParameters | RigElementParameters;
    factor: number;
    min: number;
    max: number;
} |
{
    target: string;
    target_type: 'element';
    parameter: RigElementParameters;
    input_parameter: DeviceParameters | RigParameters | RigGroupParameters | RigElementParameters;
    factor: number;
    min: number;
    max: number;
};

export interface RigObject {
    name: string;
    rig_version: number; //the version of the rig itself
    rig_structure_version: number; //the version of the rig data structure it uses.
    author: string;
    author_link: string;
    last_updated_utc: string;
    offsets: {
        // essentially the initial "offsets" of the rig. The initial values everything else is based off of.
        position: RigVector2;
        rotation: number;
        scale: RigVector2;
        rotation_two: number;
    };
    transforms: LiveTransforms;
    layering_order: {
        type: RigLayeringOrderNodeType; // whether or not the item is a group or element
        id: string; // id of group or element
    }[];
    elements: RigElement[];
    groups: RigGroup[];
    default_state: RigState;
    state_enum: RigEnum;
    state_rules: RigStateRule[];
    events: RigEvent[];
    poses: RigPose[];
    animations: RigAnimation[];
    sensors: {
        required: HardwareSensors[];
        optional: HardwareSensors[];
    };
    bindings: RigBinding[];
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