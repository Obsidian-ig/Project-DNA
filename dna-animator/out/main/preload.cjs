"use strict";

// src/main/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => import_electron.ipcRenderer.send("window-minimize"),
  maximizeWindow: () => import_electron.ipcRenderer.send("window-maximize"),
  restoreWindow: () => import_electron.ipcRenderer.send("window-restore"),
  closeWindow: () => import_electron.ipcRenderer.send("window-close"),
  setWindowTitle: (title) => import_electron.ipcRenderer.send("set-window-title", title),
  openFileExplorer: (folderPath) => import_electron.ipcRenderer.send("open-file-explorer", folderPath)
});
