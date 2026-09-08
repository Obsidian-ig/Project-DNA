import { page } from "$app/state";

//supported themes
export enum Theme {
    Device,
    Light,
    Dark
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


class AppState {
    constAppConfig = { theme: Theme.Device };
    config = $state(this.constAppConfig); //whatever should/needs to be persistant between sessions.
    loading = $state(true);
    loadingErrorMessage: string | null = $state(null);

    /*
    constructor() {
        $effect.root(() => {
            $effect(() => {

            });
        });
    }
    */
    ImportConfigFromLocalStorage(config: { theme: Theme }) {
        this.config = config;
        console.log("Successfully imported config from local storage!");
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