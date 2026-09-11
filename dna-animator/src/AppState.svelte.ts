import { browser } from "$app/environment";
import { page } from "$app/state";
import type { RigObject, SelectedNode } from "./DNARig";

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

export interface HeaderPanelOption {
    label: string;
    id: string;
}

export interface HeaderPanel {
    name: string;
    options: HeaderPanelOption[];
}

export interface PageConfig {
    title: string;
    header: {
        menu: {
            type: HeaderType,
            panels: HeaderPanel[];
        }
    }
}

export interface RigPlaygroundState {
    loadedRig: RigObject | null;
    selectedNode: SelectedNode | null;
}


class AppState {
    constAppConfig = { theme: Theme.Device };
    config = $state(this.constAppConfig); //whatever should/needs to be persistant between sessions.
    loading = $state(true);
    loadingErrorMessage: string | null = $state(null);
    rigPlaygroundState: RigPlaygroundState = $state({loadedRig: null, selectedNode: null});

    /*
    constructor() {
        $effect.root(() => {
            $effect(() => {

            });
        });
    }
    */
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
    UpdateRigPlaygroundStateSelectedNode(node: SelectedNode | null) {
        this.rigPlaygroundState.selectedNode = node;
        this.UpdateRigPlaygroundStateInLocalStorage();
    }
    UpdateRigPlaygroundStateInLocalStorage() {
        if (browser) {
            localStorage.setItem("rigPlaygroundState", JSON.stringify(this.rigPlaygroundState));
            console.log("Updated rig playground state in local storage.");
        }
    }
    private UpdateAppState() {
        localStorage.setItem("appConfig", JSON.stringify(this.config));
        console.log("Saved changes to appConfig to local storage!");
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
}
export const appState = new AppState();