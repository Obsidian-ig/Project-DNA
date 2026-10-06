/*This whole file is used for initialization.*/
import { appState, Theme } from "./AppState.svelte";

console.log("App initializing...");
let pulledConfig = localStorage.getItem("appConfig");
if (pulledConfig) {
    let configObject = JSON.parse(pulledConfig);
    appState.ImportConfigFromLocalStorage(configObject);
} else {
    localStorage.setItem("appConfig", JSON.stringify(appState.constAppConfig));
}

let pulledRigPlaygroundState = localStorage.getItem("rigPlaygroundState");
if (pulledRigPlaygroundState) {
    let stateObject = pulledRigPlaygroundState ? JSON.parse(pulledRigPlaygroundState) : undefined;
    appState.ImportRigPlaygroundStateFromLocalStorage(stateObject);
} else {
    appState.UpdateRigPlaygroundStateInLocalStorage();
}
let pulledRigDisplayState = localStorage.getItem("rigDisplayState");
if (pulledRigDisplayState) {
    let stateObject = JSON.parse(pulledRigDisplayState);
    appState.ImportRigDisplayStateFromLocalStorage(stateObject);
} else {
    appState.UpdateRigDisplayStateInLocalStorage();
}


appState.UpdateTheme();
appState.MarkAsDoneLoading();
window.electronAPI.showWindow();
window.electronAPI.showWindow();

export function handleError({ error, event }) {
    appState.SetLoadingErrorMessage("An unexcpected error occurred during initialization. Check the console for more details.");
    console.error('An unexpected client-side error occurred:', error);
}