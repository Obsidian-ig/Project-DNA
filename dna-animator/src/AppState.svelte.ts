import { browser } from "$app/environment";
import type { RigObject, RigVector2, SelectedNode } from "./DNARig";

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

export interface RigPlaygroundState {
    loadedRig: RigObject | null;
    loadedRigFilePath: string | null | undefined;
    selectedNode: SelectedNode | null;
    expandedNodes: SelectedNode[] | null;
    hideAllGroups: boolean;
    hideAllElements: boolean;
    disabledAllDebugOptions: boolean;
}

export interface RigDisplayState {
    showGridOverlay: boolean;
    gridColumnsAndRows: RigVector2;
    gridStrokeColor: string;
}


class AppState {
    constAppConfig = { theme: Theme.Device };
    config = $state(this.constAppConfig); //whatever should/needs to be persistant between sessions.
    loading = $state(true);
    loadingErrorMessage: string | null = $state(null);
    rigPlaygroundState: RigPlaygroundState = $state({ loadedRig: null, loadedRigFilePath: null, selectedNode: null, expandedNodes: [], hideAllGroups: false, hideAllElements: false, disabledAllDebugOptions: false });
    currentPageConfig: PageConfig | null = $state(null);
    rigDisplayState: RigDisplayState = $state({
        showGridOverlay: false,
        gridColumnsAndRows: {
            x: 10,
            y: 10
        },
        gridStrokeColor: "#ffffff"
    });

    constructor() {
        $effect.root(() => {
            $effect(() => {
                this.UpdateAppState();
            });
        });
    }
    ImportConfigFromLocalStorage(config: AppConfig) {
        this.config = config;
        console.log("Successfully imported config from local storage!");
    }

    ImportRigPlaygroundStateFromLocalStorage(state: RigPlaygroundState) {
        if (state) this.rigPlaygroundState = state;
    }

    

    UpdateRigPlaygroundStateLoadedRig(rig: RigObject | null) {
        this.rigPlaygroundState.loadedRig = rig;
        this.UpdateRigPlaygroundStateInLocalStorage();
    }
    UpdateRigPlaygroundStateRigFilePath(filePath: string | null) {
        this.rigPlaygroundState.loadedRigFilePath = filePath;
        this.UpdateRigPlaygroundStateInLocalStorage();
    }
    UpdateRigPlaygroundStateSelectedNode(node: SelectedNode | null) {
        this.rigPlaygroundState.selectedNode = node;
        this.UpdateRigPlaygroundStateInLocalStorage();
    }
    UpdateRigPlaygroundStateInLocalStorage() {
        if (browser) {
            localStorage.setItem("rigPlaygroundState", JSON.stringify(this.rigPlaygroundState));
            //console.log("Updated rig playground state in local storage.");
        }
    }


    ImportRigDisplayStateFromLocalStorage(state: RigDisplayState) {
        if (state) this.rigDisplayState = state;
    }
    UpdateRigDisplayStateShowGridOverlay(show: boolean) {
        this.rigDisplayState.showGridOverlay = show;
    }
    UpdateRigDisplayStateGridColumnsAndRows(gridColumnsAndRows: RigVector2) {
        this.rigDisplayState.gridColumnsAndRows = gridColumnsAndRows;
    }
    UpdateRigDisplayStateGridStrokeColor(color: string) {
        this.rigDisplayState.gridStrokeColor = color;
    }
    UpdateRigDisplayStateInLocalStorage() {
        localStorage.setItem("rigDisplayState", JSON.stringify(this.rigDisplayState));
    }



    private UpdateAppState() {
        localStorage.setItem("appConfig", JSON.stringify(this.config));
        localStorage.setItem("rigPlaygroundState", JSON.stringify(this.rigPlaygroundState));
        localStorage.setItem("rigDisplayState", JSON.stringify(this.rigDisplayState));
        //console.log("Saved changes to appConfig to local storage!");
        this.UpdateTheme();
    }
    MarkAsDoneLoading() {
        this.loading = false;
    }
    SetLoadingErrorMessage(message: string | null) {
        this.loadingErrorMessage = message;
    }
    ChangeTheme(theme: Theme) {
        this.config.theme = theme;
        this.UpdateAppState();
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
    UpdatePageConfig(config: PageConfig) {
        let temp = structuredClone(config);
        this.currentPageConfig = temp;
    }
}

export const appState = new AppState();