/*This whole file is used for initialization.*/
import { appDataDir, join } from "@tauri-apps/api/path";
import { appState, CreateAllDefaultPageStates, CreateDefaultAppConfig, CreateDefaultPageState } from "./AppState.svelte";
import { platformApi } from "./PlatformApi";

console.log("App initializing...");
let pulledConfig = await platformApi.getAppConfig();
if (pulledConfig) {
    appState.ImportConfig(CreateDefaultAppConfig(pulledConfig));
    console.log("Successfully imported app config, some values may have been added with the default values if they were missing from the config save.");
} else {
    console.error("Failed to import app config! Using default.");
    appState.ImportConfig(CreateDefaultAppConfig());
}

let pulledPageStates = await platformApi.getPageStates();
if (pulledPageStates) {
    appState.ImportPageStates(pulledPageStates.map((pps) => CreateDefaultPageState(pps)));
} else {
    console.error("Failed to import page states! Using default.");
    appState.ImportPageStates(CreateAllDefaultPageStates());
}

console.log("Checking crash status...");
const crash_status = await platformApi.getCrashStatus();
if (crash_status) {
    if (crash_status === "0") {
        console.log("No crash detected.");
        const result = await platformApi.saveOrCreateFile(await join(await appDataDir(), "crash_status"), "1");
        if (result) {
            console.log("Updated crash_status successfully!");
        } else {
            console.error("Failed to update crash_status!");
        }
    } else if (crash_status === "1") {
        console.warn("App crash detected.");
    }
} else {
    console.error("Unable to import crash_status! Assuming crash occurred.");
    appState.SetCrashStatus(crash_status);
    appState.ManagePageStatesChangeHistories();
}

appState.UpdateTheme();
appState.MarkAsDoneLoading();
platformApi.showWindow();

export function handleError({ error, event }) {
    appState.SetLoadingErrorMessage("An unexcpected error occurred during initialization. Check the console for more details.");
    console.error('An unexpected client-side error occurred:', error);
}