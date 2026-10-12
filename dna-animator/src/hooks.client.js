/*This whole file is used for initialization.*/
import { appState, Theme } from "./AppState.svelte";

console.log("App initializing...");
let pulledConfig = localStorage.getItem("appConfig");
if (pulledConfig) {
    let configObject = JSON.parse(pulledConfig);
    appState.ImportConfig(configObject);
} else {
    localStorage.setItem("appConfig", JSON.stringify(appState.constAppConfig));
}

let pulledPageStates = localStorage.getItem("pageStates");
if (pulledPageStates) {
    let stateObject = pulledPageStates ? JSON.parse(pulledPageStates) : undefined;
    appState.ImportPageStates(stateObject);
} else {
    appState.CreatePageStatesInLocalStorage();
}


appState.UpdateTheme();
appState.MarkAsDoneLoading();
window.electronAPI.showWindow();
window.electronAPI.showWindow();

export function handleError({ error, event }) {
    appState.SetLoadingErrorMessage("An unexcpected error occurred during initialization. Check the console for more details.");
    console.error('An unexpected client-side error occurred:', error);
}