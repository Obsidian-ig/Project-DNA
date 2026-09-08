"use strict";

// src/main/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  showWindow: () => import_electron.ipcRenderer.send("window-show"),
  minimizeWindow: () => import_electron.ipcRenderer.send("window-minimize"),
  maximizeWindow: () => import_electron.ipcRenderer.send("window-maximize"),
  restoreWindow: () => import_electron.ipcRenderer.send("window-restore"),
  isFullscreen: () => {
    return import_electron.ipcRenderer.invoke("is-fullscreen");
  },
  isMaximized: () => {
    return import_electron.ipcRenderer.invoke("is-maximized");
  },
  closeWindow: () => import_electron.ipcRenderer.send("window-close"),
  setWindowTitle: (title) => import_electron.ipcRenderer.send("set-window-title", title),
  openFileExplorer: (folderPath) => import_electron.ipcRenderer.send("open-file-explorer", folderPath)
});
