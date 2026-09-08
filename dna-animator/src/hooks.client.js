/*This whole file is used for initialization.*/
import { appState, Theme } from "./AppState.svelte";

console.log("App initializing...");
let pulledConfig = localStorage.getItem("appConfig");
let configObject = pulledConfig ? JSON.parse(pulledConfig) : undefined;
if (configObject) {
    console.log("Successfully retrieved appConfig from local storage!");
    appState.ImportConfigFromLocalStorage(configObject);
    appState.UpdateTheme();
    appState.MarkAsDoneLoading();
    window.electronAPI.showWindow();
} else {
    console.log("Error when retrieving appConfig from local storage! Pulled Config: ", pulledConfig);
    console.log("Attempting to create new appConfig in local storage.");
    localStorage.setItem("appConfig", JSON.stringify(appState.constAppConfig));
}

export function handleError({error, event}) {
    appState.SetLoadingErrorMessage("An unexcpected error occurred during initialization. Check the console for more details.");
    console.error('An unexpected client-side error occurred:', error);
}