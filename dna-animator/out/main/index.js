// src/main/index.ts
import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { ipcMain } from "electron/main";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var win = null;
var iconPath = app.isPackaged ? path.join(__dirname, "favicon.png") : path.join(__dirname, "../../src/main/favicon.png");
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: iconPath,
    title: "DNA Animator",
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs")
    }
  });
  win.setAutoHideMenuBar(true);
  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../../build/index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
}
ipcMain.on("window-minimize", () => {
  win?.minimize();
});
ipcMain.on("window-maximize", () => {
  win?.maximize();
});
ipcMain.on("window-restore", () => {
  win?.restore();
});
ipcMain.on("window-close", () => {
  win?.close();
});
ipcMain.on("set-window-title", (event, title) => {
  win?.setTitle(title);
});
ipcMain.on("open-file-explorer", async (event, folderpath) => {
  const errorMessage = await shell.openPath(folderpath);
  if (errorMessage) {
    console.error("Failed to open folder: }" + folderpath);
  }
});
app.whenReady().then(() => {
  if (process.platform === "win32") {
    app.setAppUserModelId("com.obsidiansoftware.dna-animator");
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
