import { browser } from "$app/environment";
import { untrack } from "svelte";
import type { NodeFrame, RigObject, RigVector2, SelectedNode } from "./DNARig";

//supported themes
export enum Theme {
    Device,
    Light,
    Dark
}

export interface AppConfig {
    theme: Theme;
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

export class PageState {
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
    visualEditorEnabled: boolean;
    nodeFrames: NodeFrame[];
    rigErrorMessages: string[];
    watchRules: PageWatchRule[];

    constructor(title: string, id: string, loadedRig: RigObject | null, loadedRigFilePath: string | null, selectedNode: SelectedNode | null, selectedNodePhysicalPosition: RigVector2 | null, expandedNodes: SelectedNode[], gridColumnsAndRows: RigVector2, gridStrokeColor: string, currentVisualEditorTool: VisualEditorTools = VisualEditorTools.MOVE, lastVisualEditorTool: VisualEditorTools = VisualEditorTools.MOVE,  clickedOnPoint: boolean = false, currentVisualEditorMode: VisualEditorModes = VisualEditorModes.VISUAL, visualEditorEnabled: boolean = false, nodeFrames: NodeFrame[] = [], rigErrorMessages: string[], watchRules: PageWatchRule[] = [], hideAllGroups: boolean = false, hideAllElements: boolean = false, disableAllDebugOptions: boolean = false, showGridOverlay: boolean = false) {
        this.title = title;
        this.id = id;
        this.loadedRig = loadedRig;
        this.loadedRigFilePath = loadedRigFilePath;
        this.selectedNode = selectedNode;
        this.selectedNodePhysicalPosition = selectedNodePhysicalPosition;
        this.expandedNodes = expandedNodes;
        this.hideAllGroups = hideAllGroups;
        this.hideAllElements = hideAllElements;
        this.disableAllDebugOptions = disableAllDebugOptions;
        this.showGridOverlay = showGridOverlay;
        this.gridColumnsAndRows = gridColumnsAndRows;
        this.gridStrokeColor = gridStrokeColor;
        this.currentVisualEditorTool = currentVisualEditorTool;
        this.lastVisualEditorTool = lastVisualEditorTool;
        this.clickedOnPoint = clickedOnPoint;
        this.currentVisualEditorMode = currentVisualEditorMode;
        this.visualEditorEnabled = visualEditorEnabled;
        this.nodeFrames = nodeFrames;
        this.rigErrorMessages = rigErrorMessages;
        this.watchRules = watchRules;

        for (const rule of watchRules) {
            $effect(() => {
                rule.watch(this);
                untrack(() => {
                    rule.handler(this);
                });
            });
        }
    }
}

export const CreateDefaultPageState = (overrides: Partial<PageState> = {}): PageState => {
    return new PageState(
        overrides.title ?? "Title",
        overrides.id ?? "id",
        overrides.loadedRig ?? null, //loaded rig
        overrides.loadedRigFilePath ?? null, //file path
        overrides.selectedNode ?? null, //selected node
        overrides.selectedNodePhysicalPosition ?? null,
        overrides.expandedNodes ?? [], //expanded nodes
        overrides.gridColumnsAndRows ?? {
            x: 10,
            y: 10
        }, //grid columns and rows
        overrides.gridStrokeColor ?? "strokecolor", //grid stroke color
        overrides.currentVisualEditorTool ?? VisualEditorTools.MOVE,
        overrides.lastVisualEditorTool ?? VisualEditorTools.MOVE,
        overrides.clickedOnPoint ?? false,
        overrides.currentVisualEditorMode ?? VisualEditorModes.MINIMAL,
        overrides.visualEditorEnabled ?? false,
        overrides.nodeFrames ?? [],
        overrides.rigErrorMessages ?? [], //rig errors
        overrides.watchRules ?? [], //watch rules
        overrides.hideAllGroups ?? false,
        overrides.hideAllElements ?? false,
        overrides.disableAllDebugOptions ?? false,
        overrides.showGridOverlay ?? false
    );
};


class AppState {
    constAppConfig = { theme: Theme.Device };
    config = $state(this.constAppConfig); //whatever should/needs to be persistant between sessions.
    loading = $state(true);
    loadingErrorMessage: string | null = $state(null);
    pageStates: PageState[] = $state([
        CreateDefaultPageState({ title: "Rig Playground", id: "rig_playground" })
    ]);

    constructor() {}


    ImportConfig(config: AppConfig) {
        this.config = config;
    }

    ImportPageStates(states: PageState[]) {
        if (states?.length) {
            this.pageStates = states;
        }
    }

    /*
    ImportPageStates(states: PageState[]) {
        if (states?.length) {
            this.pageStates = states.map(state => CreateDefaultPageState(state));
        }
    }*/

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
        console.log("Updating page state!");
        Object.assign(pageState, changes);
    }
    UpdatePageStateLoadedRig(pageStateId: string, rig: RigObject | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.loadedRig = rig;
    }
    UpdatePageStateLoadedRigFilePath(pageStateId: string, filePath: string | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.loadedRigFilePath = filePath;
    }
    UpdatePageStateSelectedNode(pageStateId: string, selectedNode: SelectedNode | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.selectedNode = selectedNode;
    }
    UpdatePageStateSelectedNodePhysicalPosition(pageStateId: string, position: RigVector2 | null) {
        let pageState = this.pageStates.find(ps => ps.id === pageStateId);
        if (!pageState) {
            console.log("Failed to find page state with id: '" + pageStateId + "'!");
            return;
        }
        pageState.selectedNodePhysicalPosition = position;
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


    MarkAsDoneLoading() {
        this.loading = false;
    }
    SetLoadingErrorMessage(message: string | null) {
        this.loadingErrorMessage = message;
    }
    ChangeTheme(theme: Theme) {
        this.config.theme = theme;
    }
    UpdateTheme() {
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
    }
}

export const appState = new AppState();