import { browser } from "$app/environment";
import { untrack } from "svelte";
import { createDefaultRigObject, RigControlPointParameters, RigElementParameters, RigGroupParameters, RigObjectParameters, RigPointParameters, SelectedNodeType, type NodeFrame, type RigObject, type RigVector2, type SelectedNode } from "./DNARig";

//supported themes
export enum Theme {
    Device,
    Light,
    Dark
}

export interface AppConfig {
    theme: Theme;
    keybindings: Keybind[];
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
    node_type: 'Group';
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

    ImportPageStates(states: PageState[]) {
        if (states?.length) {
            this.pageStates = states.map(state => CreateDefaultPageState(state));
        }
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