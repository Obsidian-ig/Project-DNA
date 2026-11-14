import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow, type Window } from "@tauri-apps/api/window";

class PlatformApi {
    private appWindow: Window | null = null;

    constructor() {
        if (isTauri()) {
            this.appWindow = getCurrentWindow();
        }
    }

    showWindow() {
        if (this.appWindow) {
            this.appWindow.show();
        } else {

        }
    }

    minimizeWindow() {
        if (this.appWindow) {
            this.appWindow.minimize();
        }
    }

    maximizeWindow() {
        if (this.appWindow) {
            this.appWindow.maximize();
        }
    }

    restoreWindow() {
        if (this.appWindow) {
            this.appWindow.unmaximize(); //has no appWindow.restore command
        }
    }

    async isFullscreen(): Promise<boolean> {
        if (this.appWindow) {
            return await this.appWindow.isFullscreen();
        }
        return false; //temp
    }

    async isMaximized(): Promise<boolean> {
        if (this.appWindow) {
            return await this.appWindow.isMaximized();
        }
        return false; //temp
    }

    closeWindow() {
        if (this.appWindow) {
             this.appWindow.close();
        }
    }

    setWindowTitle(title: string) {
        if (this.appWindow) {
            this.appWindow.setTitle(title);
        } else {
            document.title = title;
        }
    }
}

export const platformApi = new PlatformApi();

