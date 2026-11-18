import { untrack } from "svelte";
import { createDefaultRigObject, RigControlPointParameters, RigElementParameters, RigGroupParameters, RigObjectParameters, RigPointInterpolationType, RigPointParameters, SelectedNodeType, type NodeFrame, type RigElement, type RigGroup, type RigObject, type RigPoint, type RigVector2, type SelectedNode } from "./DNARig";

//supported themes
export enum Theme {
    Device,
    Light,
    Dark
}
export interface AppConfigSetting {
    label: string;
    id: string;
    value: boolean | string | number;
}
export interface AppConfig {
    theme: Theme;
    keybindings: Keybind[];
    settings: AppConfigSetting[];
}
export interface Keybind {
    keybind_id: string;
    keycode: string;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
}
export interface PageKeybindings {
    page_id: string;
    keybinds: Keybind[];
}

export enum HeaderType {
    Default,
    File
}
export const HeaderPanelOptionType = {
    Default: "default",
    Expand: "expand"
} as const;
export type HeaderPanelOptionType = (typeof HeaderPanelOptionType)[keyof typeof HeaderPanelOptionType]
export interface HeaderPanelOption {
    label: string;
    id: string;
    type: HeaderPanelOptionType;
}

export interface HeaderPanel {
    name: string;
    options: HeaderPanelOption[];
}

export interface PageConfig {
    title: string;
    id: string;
    header: {
        menu: {
            type: HeaderType,
            panels: HeaderPanel[];
        }
    }
}

export interface PageHeader {
    menu: {
        type: HeaderType,
        panels: HeaderPanel[];
    }
}

export interface PageWatchRule {
    watch: any;
    handler: (data: any) => void;
}

export const VisualEditorTools = {
    ALL: "ALL",
    MOVE: "MOVE",
    ROTATE: "ROTATE",
    SCALE: "SCALE",
    SELECT: "SELECT"
} as const;
export type VisualEditorTools = (typeof VisualEditorTools)[keyof typeof VisualEditorTools];
export const VisualEditorModes = {
    VISUAL: "VISUAL",
    MINIMAL: "MINIMAL"
} as const;
export type VisualEditorModes = (typeof VisualEditorModes)[keyof typeof VisualEditorModes];
export const VisualEditorSelectToolModes = {
    PRIORITIZE_GROUPS: "GROUPS",
    PRIORITIZE_ELEMENTS: "ELEMENTS"
} as const;
export type VisualEditorSelectToolModes = (typeof VisualEditorSelectToolModes)[keyof typeof VisualEditorSelectToolModes];

export type Change =
    {
        node_type: 'Root';
        node_id: string;
        changed_property: RigObjectParameters;
        new_value: string | number | boolean;
        old_value: string | number | boolean;
    } |
    {
        node_type: 'Group';
        node_id: string;
        changed_property: RigGroupParameters;
        new_value: string | number | boolean;
        old_value: string | number | boolean;
    } |
    {
        node_type: 'Element';
        node_id: string;
        changed_property: RigElementParameters;
        new_value: string | number | boolean;
        old_value: string | number | boolean;
    } |
    {
        node_type: 'Point';
        node_id: string; //the special name including the parent element name
        changed_property: RigPointParameters;
        new_value: string | number | boolean;
        old_value: string | number | boolean;
    } |
    {
        node_type: 'ControlPoint';
        node_id: string; //the special name including the parent element name
        changed_property: RigControlPointParameters;
        new_value: number;
        old_value: number;
    };


export interface PageState {
    title: string; //the page title that should be displayed
    id: string; //the constant id of the page for identification.
    loadedRig: RigObject | null;
    loadedRigFilePath: string | null;
    selectedNode: SelectedNode | null;
    selectedNodePhysicalPosition: RigVector2 | null;
    expandedNodes: SelectedNode[] | null;
    hideAllGroups: boolean;
    hideAllElements: boolean;
    disableAllDebugOptions: boolean;
    showGridOverlay: boolean;
    gridColumnsAndRows: RigVector2;
    gridStrokeColor: string;
    currentVisualEditorTool: VisualEditorTools;
    lastVisualEditorTool: VisualEditorTools;
    clickedOnPoint: boolean;
    currentVisualEditorMode: VisualEditorModes;
    currentVisualEditorSelectToolMode: VisualEditorSelectToolModes;
    visualEditorEnabled: boolean;
    nodeFrames: NodeFrame[];
    rigErrorMessages: string[];
    watchRules: PageWatchRule[];
    rigRestorePoints: RigObject[];
    change_history: Change[];
    undone_change_history: Change[];
}

export const CreateDefaultPageState = (overrides: Partial<PageState> = {}): PageState => {
    return {
        title: "Title",
        id: "id",
        loadedRig: null,
        loadedRigFilePath: null,
        selectedNode: null,
        selectedNodePhysicalPosition: null,
        expandedNodes: [],
        gridColumnsAndRows: {
            x: 10,
            y: 10
        },
        gridStrokeColor: "#FFFFFF",
        currentVisualEditorTool: VisualEditorTools.MOVE,
        lastVisualEditorTool: VisualEditorTools.MOVE,
        clickedOnPoint: false,
        currentVisualEditorMode: VisualEditorModes.VISUAL,
        currentVisualEditorSelectToolMode: VisualEditorSelectToolModes.PRIORITIZE_GROUPS,
        visualEditorEnabled: false,
        nodeFrames: [],
        rigErrorMessages: [],
        watchRules: [],
        hideAllGroups: false,
        hideAllElements: false,
        disableAllDebugOptions: false,
        showGridOverlay: false,
        rigRestorePoints: [],
        change_history: [],
        undone_change_history: [],
        ...overrides
    };
};

export const CreateDefaultAppConfig = (overrides: Partial<AppConfig> = {}): AppConfig => {
    return {
        theme: Theme.Device,
        keybindings: [
            {
                "keybind_id": "undo",
                "keycode": "KeyZ",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "redo",
                "keycode": "KeyY",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "copy",
                "keycode": "KeyC",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "paste",
                "keycode": "KeyV",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "cut",
                "keycode": "KeyX",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "save_rig",
                "keycode": "KeyS",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "create_new_node",
                "keycode": "KeyN",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "find_node",
                "keycode": "KeyF",
                "shift": false,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "expand_collapse_rig_tree",
                "keycode": "KeyE",
                "shift": false,
                "ctrl": false,
                "alt": true
            },
            {
                "keybind_id": "save_rig_as",
                "keycode": "KeyS",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "import_rig",
                "keycode": "KeyM",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "close_rig",
                "keycode": "KeyC",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "new_rig",
                "keycode": "KeyN",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "create_rig_restore_point",
                "keycode": "KeyR",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "load_rig_restore_point",
                "keycode": "KeyL",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "open_rig_in_file_explorer",
                "keycode": "KeyO",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "export_rig_preview_as_png",
                "keycode": "KeyE",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "toggle_rig_tree",
                "keycode": "KeyT",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "toggle_properties_explorer",
                "keycode": "KeyP",
                "shift": true,
                "ctrl": true,
                "alt": false
            },
            {
                "keybind_id": "toggle_visual_editing_mode",
                "keycode": "KeyV",
                "shift": true,
                "ctrl": true,
                "alt": false
            }
        ],
        settings: [
            {
                label: "Clear Change Histories On App Start",
                id: "clear_change_histories_on_app_start",
                value: false
            }
        ],
        ...overrides
    };
};


class AppState {
    config = $state(CreateDefaultAppConfig()); //whatever should/needs to be persistant between sessions.
    loading = $state(true);
    loadingErrorMessage: string | null = $state(null);
    pageStates: PageState[] = $state([
        CreateDefaultPageState({ title: "Rig Playground", id: "rig_playground" })
    ]);
    crashStatus: string | null = $state(null);

    constructor() { }


    ImportConfig(config: AppConfig) {
        this.config = CreateDefaultAppConfig(config);
    }

    SetCrashStatus(status: string | null) {
        this.crashStatus = status;
    }
    ManagePageStatesChangeHistories() {
        if (this.crashStatus === "0" && this.config.settings.find(s => s.id === "clear_change_histories_on_app_start")?.value === true) {
            //clear da histories
            this.pageStates.forEach((ps) => {
                ps.change_history = [];
            });
            console.log("Cleared change histories.");
        }
    }

    ImportPageStates(states: PageState[]) {
        if (states?.length) {
            this.pageStates = states.map(state => CreateDefaultPageState(state));
        }
    }

    ForceLocalStorageUpdate() {
        localStorage.setItem("pageStates", JSON.stringify(this.pageStates));
        localStorage.setItem("appConfig", JSON.stringify(this.config));
    }

    CreatePageStatesInLocalStorage() {
        localStorage.setItem("pageStates", JSON.stringify(this.pageStates));
    }
    UpdatePageStatePartial(pageStateId: string, changes: Partial<PageState>) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log(this.pageStates);
            console.log(pageState);
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        //console.log("Updating page state!");
        Object.assign(pageState, changes);
    }
    UpdatePageStateLoadedRig(pageStateId: string, rig: RigObject | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.loadedRig = rig;
        //console.log("Update pageState loadedRig!");
    }
    UpdatePageStateLoadedRigFromRestorePoint(pageStateId: string, restorePoint: RigObject) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log(this.pageStates);
            console.log(pageState);
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        if (!pageState.loadedRig) pageState.loadedRig = createDefaultRigObject();
        Object.assign(pageState.loadedRig, restorePoint);
        //console.log("Update pageState loadedRig from restore point!");
    }
    UpdatePageStateLoadedRigFilePath(pageStateId: string, filePath: string | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.loadedRigFilePath = filePath;
        //console.log("Update pageState loadedRigFilePath!");
    }
    UpdatePageStateSelectedNode(pageStateId: string, selectedNode: SelectedNode | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.selectedNode = selectedNode;
        //console.log("Update pageState selectedNode!");
    }
    UpdatePageStateSelectedNodePhysicalPosition(pageStateId: string, position: RigVector2 | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.selectedNodePhysicalPosition = position;
        //console.log("Update pageState selectedNodePhysicalPosition!");
    }
    UpdatePageStateShowGridOverlay(pageStateId: string, showGridOverlay: boolean) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.showGridOverlay = showGridOverlay;
    }
    UpdatePageStateGridColumnsAndRows(pageStateId: string, gridColumnsAndRows: RigVector2) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.gridColumnsAndRows = gridColumnsAndRows;
    }
    UpdatePageStateGridStrokeColor(pageStateId: string, gridStrokeColor: string) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.gridStrokeColor = gridStrokeColor;
    }
    UpdatePageStateExpandedNodes(pageStateId: string, expandedNodes: SelectedNode[]) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.expandedNodes = expandedNodes;
    }
    UpdatePageStateVisualEditorTool(pageStateId: string, tool: VisualEditorTools) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.currentVisualEditorTool = tool;
    }
    UpdatePageStateVisualEditorMode(pageStateId: string, mode: VisualEditorModes) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.currentVisualEditorMode = mode;
    }
    UpdatePageStateVisualEditingEnabled(pageStateId: string, visualEditorEnabled: boolean) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.visualEditorEnabled = visualEditorEnabled;
    }
    UpdatePageStateVisualEditorSelectToolCurrentMode(pageStateId: string, selectToolMode: VisualEditorSelectToolModes) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.currentVisualEditorSelectToolMode = selectToolMode;
    }
    AddOrUpdatePageStateNodeFrame(pageStateId: string, nodeFrame: NodeFrame) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        let frameExists = pageState.nodeFrames.findIndex(n => n.nodeType === nodeFrame.nodeType && n.nodeId === nodeFrame.nodeId);
        if (frameExists < 0 || frameExists > pageState.nodeFrames.length) {
            pageState.nodeFrames.push(nodeFrame);
            return;
        }
        pageState.nodeFrames[frameExists] = nodeFrame;
    }
    RemovePageStateNodeFrame(pageStateId: string, nodeFrameIndex: number) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        if (pageState.nodeFrames.length - 1 < nodeFrameIndex || nodeFrameIndex < 0) return;
        pageState.nodeFrames.splice(nodeFrameIndex, 1);
    }
    ResetPageStateRestorePoints(pageStateId: string) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.rigRestorePoints = [];
    }
    AddChangeToPageStateHistory(pageStateId: string, change: Change) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.change_history.push(change);
    }
    UndoLastChangeFromPageStateHistory(pageStateId: string) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        if (!pageState.loadedRig) return;
        let removedChange = pageState.change_history.splice(pageState.change_history.length - 1, 1)[0];
        if (!removedChange) return;
        pageState.undone_change_history.push(removedChange);
        switch (removedChange.node_type) {
            case "Root":
                switch (removedChange.changed_property) {
                    case "name":
                        if (typeof removedChange.old_value === "string") {
                            pageState.loadedRig.name = removedChange.old_value;
                        }
                        break;
                    case "disabled_all_debug_options":
                        if (typeof removedChange.old_value ===  "boolean") {
                            pageState.disableAllDebugOptions = removedChange.old_value;
                        }
                        break;
                    case "hide_all_elements":
                        if (typeof removedChange.old_value ===  "boolean") {
                            pageState.hideAllElements = removedChange.old_value;
                        }
                        break;
                    case "hide_all_groups":
                        if (typeof removedChange.old_value ===  "boolean") {
                            pageState.hideAllGroups = removedChange.old_value;
                        }
                        break;
                    case "offsets.position.x":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.offsets.position.x = removedChange.old_value;
                        }
                        break;
                    case "offsets.position.y":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.offsets.position.y = removedChange.old_value;
                        }
                        break;
                    case "offsets.rotation":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.offsets.rotation = removedChange.old_value;
                        }
                        break;
                    case "offsets.rotation_two":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.offsets.rotation_two = removedChange.old_value;
                        }
                        break;
                    case "offsets.scale.x":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.offsets.scale.x = removedChange.old_value;
                        }
                        break;
                    case "offsets.scale.y":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.offsets.scale.y = removedChange.old_value;
                        }
                        break;
                    case "position.x":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.transforms.position.x = removedChange.old_value;
                        }
                        break;
                    case "position.y":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.transforms.position.y = removedChange.old_value;
                        }
                        break;
                    case "position_point_color":
                        if (typeof removedChange.old_value ===  "string") {
                            pageState.loadedRig.position_point_color = removedChange.old_value;
                        }
                        break;
                    case "position_point_radius":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.position_point_radius = removedChange.old_value;
                        }
                        break;
                    case "rotation":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.transforms.rotation = removedChange.old_value;
                        }
                        break;
                    case "rotation_two":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.transforms.rotation_two = removedChange.old_value;
                        }
                        break;
                    case "scale.x":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.transforms.scale.x = removedChange.old_value;
                        }
                        break;
                    case "scale.y":
                        if (typeof removedChange.old_value ===  "number") {
                            pageState.loadedRig.transforms.scale.y = removedChange.old_value;
                        }
                        break;
                    case "show_position_point":
                        if (typeof removedChange.old_value ===  "boolean") {
                            pageState.loadedRig.show_position_point = removedChange.old_value;
                        }
                        break;
                }
                break;
            case "Group":
                let item: RigGroup | RigElement | RigPoint | RigVector2 | undefined = pageState.loadedRig.groups.find(g => g.id === removedChange.node_id);
                if (!item) {
                    console.error("Unable to find the group item being changed!");
                    return;
                }
                switch (removedChange.changed_property) {
                    case "offsets.position.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.position.x = removedChange.old_value;
                        }
                        break;
                    case "offsets.position.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.position.y = removedChange.old_value;
                        }
                        break;
                    case "offsets.rotation":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.rotation = removedChange.old_value;
                        }
                        break;
                    case "offsets.rotation_two":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.rotation_two = removedChange.old_value;
                        }
                        break;
                    case "offsets.scale.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.scale.x = removedChange.old_value;
                        }
                        break;
                    case "offsets.scale.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.scale.y = removedChange.old_value;
                        }
                        break;
                    case "position.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.position.x = removedChange.old_value;
                        }
                        break;
                    case "position.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.position.y = removedChange.old_value;
                        }
                        break;
                    case "rotation":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.rotation = removedChange.old_value;
                        }
                        break;
                    case "rotation_two":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.rotation_two = removedChange.old_value;
                        }
                        break;
                    case "scale.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.scale.x = removedChange.old_value;
                        }
                        break;
                    case "scale.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.scale.y = removedChange.old_value;
                        }
                        break;
                    case "visible":
                        if (typeof removedChange.old_value === "boolean") {
                            item.visible = removedChange.old_value;
                        }
                        break;
                    case "show_position_point":
                        if (typeof removedChange.old_value ===  "boolean") {
                            item.show_position_point = removedChange.old_value;
                        }
                        break;
                    case "position_point_color":
                        if (typeof removedChange.old_value ===  "string") {
                            item.position_point_color = removedChange.old_value;
                        }
                        break;
                    case "position_point_radius":
                        if (typeof removedChange.old_value ===  "number") {
                            item.position_point_radius = removedChange.old_value;
                        }
                        break;
                    case "show_origin_point":
                        if (typeof removedChange.old_value ===  "boolean") {
                            item.show_origin_point = removedChange.old_value;
                        }
                        break;
                    case "origin_point_color":
                        if (typeof removedChange.old_value ===  "string") {
                            item.origin_point_color = removedChange.old_value;
                        }
                        break;
                    case "origin_point_radius":
                        if (typeof removedChange.old_value ===  "number") {
                            item.origin_point_radius = removedChange.old_value;
                        }
                        break;
                }
                break;
            case "Element":
                item = pageState.loadedRig.elements.find(e => e.name === removedChange.node_id);
                if (!item) {
                    console.error("Unable to find the element item being changed!");
                    return;
                }
                switch (removedChange.changed_property) {
                    case "offsets.position.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.position.x = removedChange.old_value;
                        }
                        break;
                    case "offsets.position.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.position.y = removedChange.old_value;
                        }
                        break;
                    case "offsets.rotation":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.rotation = removedChange.old_value;
                        }
                        break;
                    case "offsets.rotation_two":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.rotation_two = removedChange.old_value;
                        }
                        break;
                    case "offsets.scale.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.scale.x = removedChange.old_value;
                        }
                        break;
                    case "offsets.scale.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.offsets.scale.y = removedChange.old_value;
                        }
                        break;
                    case "position.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.position.x = removedChange.old_value;
                        }
                        break;
                    case "position.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.position.y = removedChange.old_value;
                        }
                        break;
                    case "rotation":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.rotation = removedChange.old_value;
                        }
                        break;
                    case "rotation_two":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.rotation_two = removedChange.old_value;
                        }
                        break;
                    case "scale.x":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.scale.x = removedChange.old_value;
                        }
                        break;
                    case "scale.y":
                        if (typeof removedChange.old_value ===  "number") {
                            item.transforms.scale.y = removedChange.old_value;
                        }
                        break;
                    case "visible":
                        if (typeof removedChange.old_value === "boolean") {
                            item.visible = removedChange.old_value;
                        }
                        break;
                    case "show_position_point":
                        if (typeof removedChange.old_value ===  "boolean") {
                            item.show_position_point = removedChange.old_value;
                        }
                        break;
                    case "position_point_color":
                        if (typeof removedChange.old_value ===  "string") {
                            item.position_point_color = removedChange.old_value;
                        }
                        break;
                    case "position_point_radius":
                        if (typeof removedChange.old_value ===  "number") {
                            item.position_point_radius = removedChange.old_value;
                        }
                        break;
                    case "show_origin_point":
                        if (typeof removedChange.old_value ===  "boolean") {
                            item.show_origin_point = removedChange.old_value;
                        }
                        break;
                    case "origin_point_color":
                        if (typeof removedChange.old_value ===  "string") {
                            item.origin_point_color = removedChange.old_value;
                        }
                        break;
                    case "origin_point_radius":
                        if (typeof removedChange.old_value ===  "number") {
                            item.origin_point_radius = removedChange.old_value;
                        }
                        break;
                }
                break;
            case "Point":
                let splitId = removedChange.node_id.split("_PIndex_");
                item = pageState.loadedRig.elements.find(e => e.name === splitId[0])?.points[parseInt(splitId[1])];
                if (!item) {
                    console.error("Unable to find the point item being changed!");
                    return;
                }
                switch (removedChange.changed_property) {
                    case "position.x":
                        if (typeof removedChange.old_value === "number") {
                            item.point.x = removedChange.old_value;
                        }
                        break;
                    case "position.y":
                        if (typeof removedChange.old_value === "number") {
                            item.point.y = removedChange.old_value;
                        }
                        break;
                    case "interpolation_type":
                        if (typeof removedChange.old_value === "string" && (removedChange.old_value === RigPointInterpolationType.CubicBezierCurve || removedChange.old_value === RigPointInterpolationType.QuadraticBezierCurve || removedChange.old_value === RigPointInterpolationType.Linear)) {
                            item.interpolation_type = removedChange.old_value;
                        }
                        break;
                    case "steps":
                        if (typeof removedChange.old_value === "number") {
                            item.steps = removedChange.old_value;
                        }
                        break;
                }
                break;
            case "ControlPoint":
                splitId = removedChange.node_id.split("_PIndex_");
                item = pageState.loadedRig.elements.find(e => e.name === splitId[0])?.points?.[parseInt(splitId[1])]?.controls?.[parseInt(splitId[2])];
                if (!item) {
                    console.error("Unable to find the point item being changed!");
                    return;
                }
                switch (removedChange.changed_property) {
                    case "position.x":
                        if (typeof removedChange.old_value === "number") {
                            item.x = removedChange.old_value;
                        }
                        break;
                    case "position.y":
                        if (typeof removedChange.old_value === "number") {
                            item.y = removedChange.old_value;
                        }
                        break;
                }
                break;
        }
        console.log("Undid change to propterty '" + removedChange.changed_property + "' of " + removedChange.node_type + " node '" + removedChange.node_id + "', Current Value: " + removedChange.old_value);
    }
    RedoLastUndonChangeFromPageStateHistory(pageStateId: string) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        if (!pageState.loadedRig) return;
        let redoneChange = pageState.undone_change_history.splice(pageState.undone_change_history.length - 1, 1)[0];
        if (!redoneChange) return;
        pageState.change_history.push(redoneChange);
        switch (redoneChange.node_type) {
            case "Root":
                switch (redoneChange.changed_property) {
                    case "name":
                        if (typeof redoneChange.new_value === "string") {
                            pageState.loadedRig.name = redoneChange.new_value;
                        }
                        break;
                    case "disabled_all_debug_options":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            pageState.disableAllDebugOptions = redoneChange.new_value;
                        }
                        break;
                    case "hide_all_elements":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            pageState.hideAllElements = redoneChange.new_value;
                        }
                        break;
                    case "hide_all_groups":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            pageState.hideAllGroups = redoneChange.new_value;
                        }
                        break;
                    case "offsets.position.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.offsets.position.x = redoneChange.new_value;
                        }
                        break;
                    case "offsets.position.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.offsets.position.y = redoneChange.new_value;
                        }
                        break;
                    case "offsets.rotation":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.offsets.rotation = redoneChange.new_value;
                        }
                        break;
                    case "offsets.rotation_two":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.offsets.rotation_two = redoneChange.new_value;
                        }
                        break;
                    case "offsets.scale.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.offsets.scale.x = redoneChange.new_value;
                        }
                        break;
                    case "offsets.scale.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.offsets.scale.y = redoneChange.new_value;
                        }
                        break;
                    case "position.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.transforms.position.x = redoneChange.new_value;
                        }
                        break;
                    case "position.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.transforms.position.y = redoneChange.new_value;
                        }
                        break;
                    case "position_point_color":
                        if (typeof redoneChange.new_value ===  "string") {
                            pageState.loadedRig.position_point_color = redoneChange.new_value;
                        }
                        break;
                    case "position_point_radius":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.position_point_radius = redoneChange.new_value;
                        }
                        break;
                    case "rotation":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.transforms.rotation = redoneChange.new_value;
                        }
                        break;
                    case "rotation_two":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.transforms.rotation_two = redoneChange.new_value;
                        }
                        break;
                    case "scale.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.transforms.scale.x = redoneChange.new_value;
                        }
                        break;
                    case "scale.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            pageState.loadedRig.transforms.scale.y = redoneChange.new_value;
                        }
                        break;
                    case "show_position_point":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            pageState.loadedRig.show_position_point = redoneChange.new_value;
                        }
                        break;
                }
                break;
            case "Group":
                let item: RigGroup | RigElement | RigPoint | RigVector2 | undefined = pageState.loadedRig.groups.find(g => g.id === redoneChange.node_id);
                if (!item) {
                    console.error("Unable to find the group item being changed!");
                    return;
                }
                switch (redoneChange.changed_property) {
                    case "offsets.position.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.position.x = redoneChange.new_value;
                        }
                        break;
                    case "offsets.position.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.position.y = redoneChange.new_value;
                        }
                        break;
                    case "offsets.rotation":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.rotation = redoneChange.new_value;
                        }
                        break;
                    case "offsets.rotation_two":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.rotation_two = redoneChange.new_value;
                        }
                        break;
                    case "offsets.scale.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.scale.x = redoneChange.new_value;
                        }
                        break;
                    case "offsets.scale.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.scale.y = redoneChange.new_value;
                        }
                        break;
                    case "position.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.position.x = redoneChange.new_value;
                        }
                        break;
                    case "position.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.position.y = redoneChange.new_value;
                        }
                        break;
                    case "rotation":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.rotation = redoneChange.new_value;
                        }
                        break;
                    case "rotation_two":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.rotation_two = redoneChange.new_value;
                        }
                        break;
                    case "scale.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.scale.x = redoneChange.new_value;
                        }
                        break;
                    case "scale.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.scale.y = redoneChange.new_value;
                        }
                        break;
                    case "visible":
                        if (typeof redoneChange.new_value === "boolean") {
                            item.visible = redoneChange.new_value;
                        }
                        break;
                    case "show_position_point":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            item.show_position_point = redoneChange.new_value;
                        }
                        break;
                    case "position_point_color":
                        if (typeof redoneChange.new_value ===  "string") {
                            item.position_point_color = redoneChange.new_value;
                        }
                        break;
                    case "position_point_radius":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.position_point_radius = redoneChange.new_value;
                        }
                        break;
                    case "show_origin_point":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            item.show_origin_point = redoneChange.new_value;
                        }
                        break;
                    case "origin_point_color":
                        if (typeof redoneChange.new_value ===  "string") {
                            item.origin_point_color = redoneChange.new_value;
                        }
                        break;
                    case "origin_point_radius":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.origin_point_radius = redoneChange.new_value;
                        }
                        break;
                }
                break;
            case "Element":
                item = pageState.loadedRig.elements.find(e => e.name === redoneChange.node_id);
                if (!item) {
                    console.error("Unable to find the element item being changed!");
                    return;
                }
                switch (redoneChange.changed_property) {
                    case "offsets.position.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.position.x = redoneChange.new_value;
                        }
                        break;
                    case "offsets.position.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.position.y = redoneChange.new_value;
                        }
                        break;
                    case "offsets.rotation":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.rotation = redoneChange.new_value;
                        }
                        break;
                    case "offsets.rotation_two":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.rotation_two = redoneChange.new_value;
                        }
                        break;
                    case "offsets.scale.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.scale.x = redoneChange.new_value;
                        }
                        break;
                    case "offsets.scale.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.offsets.scale.y = redoneChange.new_value;
                        }
                        break;
                    case "position.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.position.x = redoneChange.new_value;
                        }
                        break;
                    case "position.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.position.y = redoneChange.new_value;
                        }
                        break;
                    case "rotation":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.rotation = redoneChange.new_value;
                        }
                        break;
                    case "rotation_two":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.rotation_two = redoneChange.new_value;
                        }
                        break;
                    case "scale.x":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.scale.x = redoneChange.new_value;
                        }
                        break;
                    case "scale.y":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.transforms.scale.y = redoneChange.new_value;
                        }
                        break;
                    case "visible":
                        if (typeof redoneChange.new_value === "boolean") {
                            item.visible = redoneChange.new_value;
                        }
                        break;
                    case "show_position_point":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            item.show_position_point = redoneChange.new_value;
                        }
                        break;
                    case "position_point_color":
                        if (typeof redoneChange.new_value ===  "string") {
                            item.position_point_color = redoneChange.new_value;
                        }
                        break;
                    case "position_point_radius":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.position_point_radius = redoneChange.new_value;
                        }
                        break;
                    case "show_origin_point":
                        if (typeof redoneChange.new_value ===  "boolean") {
                            item.show_origin_point = redoneChange.new_value;
                        }
                        break;
                    case "origin_point_color":
                        if (typeof redoneChange.new_value ===  "string") {
                            item.origin_point_color = redoneChange.new_value;
                        }
                        break;
                    case "origin_point_radius":
                        if (typeof redoneChange.new_value ===  "number") {
                            item.origin_point_radius = redoneChange.new_value;
                        }
                        break;
                }
                break;
            case "Point":
                let splitId = redoneChange.node_id.split("_PIndex_");
                item = pageState.loadedRig.elements.find(e => e.name === splitId[0])?.points[parseInt(splitId[1])];
                if (!item) {
                    console.error("Unable to find the point item being changed!");
                    return;
                }
                switch (redoneChange.changed_property) {
                    case "position.x":
                        if (typeof redoneChange.new_value === "number") {
                            item.point.x = redoneChange.new_value;
                        }
                        break;
                    case "position.y":
                        if (typeof redoneChange.new_value === "number") {
                            item.point.y = redoneChange.new_value;
                        }
                        break;
                    case "interpolation_type":
                        if (typeof redoneChange.new_value === "string" && (redoneChange.new_value === RigPointInterpolationType.CubicBezierCurve || redoneChange.new_value === RigPointInterpolationType.QuadraticBezierCurve || redoneChange.new_value === RigPointInterpolationType.Linear)) {
                            item.interpolation_type = redoneChange.new_value;
                        }
                        break;
                    case "steps":
                        if (typeof redoneChange.new_value === "number") {
                            item.steps = redoneChange.new_value;
                        }
                        break;
                }
                break;
            case "ControlPoint":
                splitId = redoneChange.node_id.split("_PIndex_");
                item = pageState.loadedRig.elements.find(e => e.name === splitId[0])?.points?.[parseInt(splitId[1])]?.controls?.[parseInt(splitId[2])];
                if (!item) {
                    console.error("Unable to find the point item being changed!");
                    return;
                }
                switch (redoneChange.changed_property) {
                    case "position.x":
                        if (typeof redoneChange.new_value === "number") {
                            item.x = redoneChange.new_value;
                        }
                        break;
                    case "position.y":
                        if (typeof redoneChange.new_value === "number") {
                            item.y = redoneChange.new_value;
                        }
                        break;
                }
                break;
        }
        console.log("Reverted propterty '" + redoneChange.changed_property + "' of " + redoneChange.node_type + " node '" + redoneChange.node_id + "', Current Value: " + redoneChange.new_value);
    }


    MarkAsDoneLoading() {
        this.loading = false;
    }
    SetLoadingErrorMessage(message: string | null) {
        this.loadingErrorMessage = message;
    }
    ChangeTheme(theme: Theme) {
        this.config.theme = theme;
        this.UpdateTheme();
    }
    UpdateTheme() {
        untrack(() => {
            const body = document.body;
            if (body) {
                switch (appState.config.theme) {
                    case Theme.Device:
                        body.className = "device";
                        break;
                    case Theme.Light:
                        body.className = "light";
                        break;
                    case Theme.Dark:
                        body.className = "";
                        break;
                }
            }
        });

    }
}

export const appState = new AppState();