import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow, type Window } from "@tauri-apps/api/window";
import { BaseDirectory, readTextFile, writeTextFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { openPath, revealItemInDir } from "@tauri-apps/plugin-opener";
import { appDataDir, join } from "@tauri-apps/api/path";
import { CreateAllDefaultPageStates, CreateDefaultAppConfig, CreateDefaultPageState } from "./AppState.svelte";

class PlatformApi {
    private appWindow: Window | null = null;

    constructor() {
        if (isTauri()) {
            this.appWindow = getCurrentWindow();
        }
    }

    async makeAppDataDir() {
        await mkdir("", { baseDir: BaseDirectory.AppData, recursive: true });
    }

    async getAppConfig(): Promise<object | null> {
        if (this.appWindow) {
            await this.makeAppDataDir();
            let filePath = "app_config.json";
            try {
                if (await exists(await join(await appDataDir(), filePath))) {
                    return JSON.parse(await readTextFile(filePath, { baseDir: BaseDirectory.AppData }));
                } else {
                    console.warn("appConfig file didn't exist in app data. Creating.");
                    const defaultAppConfig = CreateDefaultAppConfig();
                    await writeTextFile(filePath, JSON.stringify(defaultAppConfig), {baseDir: BaseDirectory.AppData});
                    return defaultAppConfig;
                }
            } catch (e) {
                console.error(e);
                return null;
            }
        } else {
            let pulledLocalConfig = localStorage.getItem("appConfig");
            if (!pulledLocalConfig) return null;
            return JSON.parse(pulledLocalConfig);
        }
    }

    async getPageStates(): Promise<object[] | null> {
        if (this.appWindow) {
            await this.makeAppDataDir();
            let filePath = "page_states.json";
            try {
                if (await exists(await join(await appDataDir(), filePath))) {
                    const data = JSON.parse(await readTextFile(filePath, { baseDir: BaseDirectory.AppData }));
                    return data["page_states"];
                } else {
                    console.warn("Page States file didn't exist in app data. Creating.");
                    const defaultPageStates = CreateAllDefaultPageStates();
                    await writeTextFile(filePath, JSON.stringify({"page_states": defaultPageStates}), {baseDir: BaseDirectory.AppData});
                    return defaultPageStates;
                }
            } catch (e) {
                console.error(e);
                return null;
            }
        } else {
            return null;
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
        return true;
    }

    async closeWindow() {
        if (this.appWindow) {
            await this.makeAppDataDir();
            try {
                let filePath = "crash_status";
                await writeTextFile(filePath, "0", {baseDir: BaseDirectory.AppData});
            } catch (e) {
                console.error(e);
                return;
            }
            this.appWindow.close();
        } else {
            //update crash_status
        }
    }

    setWindowTitle(title: string) {
        if (this.appWindow) {
            this.appWindow.setTitle(title);
        } else {
            document.title = title;
        }
    }

    async openFolderOrFileInFileExplorer(folderPath: string, filePath?: string, revealInExplorer?: boolean) {
        if (this.appWindow) {
            if (revealInExplorer && filePath) {
                await revealItemInDir(filePath);
            } else {
                await openPath(folderPath);
            }
        } else {
            //figure out how to create or use a lib that acts as a file explorer for IndexedDB
        }
    }

    async saveOrCreateFile(filePath: string, data: string): Promise<boolean> {
        if (this.appWindow) {
            try {
                await writeTextFile(filePath, data);
                return true;
            } catch (e) {
                console.error(e);
                //make an error notification popup or something.
                return false;
            }
        } else {
            //implement IndexedDB support later
            return false;
        }
    }

    async openFileDialog(windowTitle: string, fileTypeName: string, acceptedFileExtensions: { name: string, extensions: string[] }[]): Promise<string | null> {
        if (this.appWindow) {
            const selectedFilePath = await open({
                multiple: false,
                directory: false,
                filters: acceptedFileExtensions
            });
            return selectedFilePath as string | null;
        } else {
            return "";
        }
    }

    async readTextFile(filePath: string): Promise<string | null> {
        if (this.appWindow) {
            try {
                return await readTextFile(filePath);
            } catch (e) {
                console.error(e);
                return null;
            }
        } else {
            return null;
        }
    }

    async saveNewFile(windowTitle: string, allowedFileExtensions?: { name: string, extensions: string[] }[], defaultPath?: string): Promise<string | null> {
        if (this.appWindow) {
            try {
                return await save({
                    canCreateDirectories: true,
                    defaultPath: defaultPath,
                    filters: allowedFileExtensions,
                    title: windowTitle
                });
            } catch (e) {
                console.error(e);
                return null;
            }
        } else {
            return null;
        }
    }

    async getCrashStatus(): Promise<string | null> {
        if (this.appWindow) {
            await this.makeAppDataDir();
            try {
                let filePath = "crash_status";
                if (await exists(await join(await appDataDir(), filePath))) {
                    return await readTextFile(filePath, {baseDir: BaseDirectory.AppData });
                } else {
                    await writeTextFile(filePath, "1", {baseDir: BaseDirectory.AppData});
                    return "1";
                }
            } catch (e) {
                console.error(e);
                return null;
            }
        } else {
            return null;
        }
    }
}

export const platformApi = new PlatformApi();

