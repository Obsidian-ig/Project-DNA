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
  openFileExplorer: (folderPath) => import_electron.ipcRenderer.send("open-file-explorer", folderPath),
  saveOrCreateFile: (filePath, data) => import_electron.ipcRenderer.invoke("save-or-create-file", filePath, data),
  openFile: (windowTitle, fileTypeName, acceptedFileExtensions) => import_electron.ipcRenderer.invoke("open-file", windowTitle, fileTypeName, acceptedFileExtensions),
  readFile: (filePath) => import_electron.ipcRenderer.invoke("read-file", filePath),
  saveNewFile: (windowTitle, fileTypeName, acceptedFileExtensions, data) => import_electron.ipcRenderer.invoke("save-new-file", windowTitle, fileTypeName, acceptedFileExtensions, data)
});
