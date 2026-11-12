/*This whole file is used for initialization.*/
import { appState, CreateDefaultAppConfig, Theme } from "./AppState.svelte";

console.log("App initializing...");
let pulledConfig = localStorage.getItem("appConfig");
if (pulledConfig) {
    let configObject = JSON.parse(pulledConfig);
    appState.ImportConfig(configObject);
} else {
    localStorage.setItem("appConfig", JSON.stringify(CreateDefaultAppConfig()));
}

let pulledPageStates = localStorage.getItem("pageStates");
if (pulledPageStates) {
    let stateObject = pulledPageStates ? JSON.parse(pulledPageStates) : undefined;
    appState.ImportPageStates(stateObject);
} else {
    appState.CreatePageStatesInLocalStorage();
}

console.log("Checking crash status...");
let crash_status =  await window.electronAPI.getCrashStatus();
if (crash_status === "0") {
    console.log("No crash detected.");
} else if (crash_status === "1") {
    console.warn("App crash detected.");
} else {
    let fileSaveStatus = await window.electronAPI.saveOrCreateFile("crash_status", "1");
    if (fileSaveStatus) {
        console.warn("First startup? 'crash_status' file was missing. Created file. No Crash Detectable.")
        crash_status = "0";
    } else {
        console.error("First startup? 'crash_status' file is missing! An error occurred when attempting to create the file!");
        crash_status = "1";
    }
}
if (crash_status === "0") {
    window.electronAPI.saveOrCreateFile("crash_status", "1"); //mark crash_status as the app is currently running.
}
appState.SetCrashStatus(crash_status);


appState.UpdateTheme();
appState.MarkAsDoneLoading();
window.electronAPI.showWindow();
window.electronAPI.showWindow();

export function handleError({ error, event }) {
    appState.SetLoadingErrorMessage("An unexcpected error occurred during initialization. Check the console for more details.");
    console.error('An unexpected client-side error occurred:', error);
}