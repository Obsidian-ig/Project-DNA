"use strict";

// src/main/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => import_electron.ipcRenderer.send("window-minimize"),
  closeWindow: () => import_electron.ipcRenderer.send("window-close")
});
