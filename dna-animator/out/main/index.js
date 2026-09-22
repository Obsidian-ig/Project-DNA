// src/main/index.ts
import { app, BrowserWindow, dialog, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { ipcMain } from "electron/main";
import * as fs from "fs/promises";
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
    show: false,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs")
    }
  });
  win.setAutoHideMenuBar(true);
  function LoadUrl() {
    if (!win) return;
    win.loadURL("http://localhost:5173").catch(() => {
      setTimeout(LoadUrl, 500);
    });
  }
  if (!app.isPackaged) {
    LoadUrl();
  } else {
    win.loadFile(path.join(__dirname, "../../build/index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
}
ipcMain.once("window-show", () => {
  win?.show();
});
ipcMain.on("window-minimize", () => {
  win?.minimize();
});
ipcMain.on("window-maximize", () => {
  win?.maximize();
});
ipcMain.on("window-restore", () => {
  win?.restore();
});
ipcMain.handle("is-fullscreen", () => {
  return win?.isFullScreen();
});
ipcMain.handle("is-maximized", () => {
  return win?.isMaximized();
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
ipcMain.handle("open-file", async (event, windowTitle, fileTypeName, acceptedFileExtensions) => {
  if (!win) return;
  const openOptions = {
    title: windowTitle,
    properties: ["openFile"],
    filters: [
      {
        name: fileTypeName,
        extensions: acceptedFileExtensions
      }
    ]
  };
  const result = await dialog.showOpenDialogSync(win, openOptions);
  return result;
});
ipcMain.handle("read-file", async (event, filePath) => {
  return await fs.readFile(filePath, "utf-8");
});
ipcMain.handle("save-or-create-file", async (event, filePath, data) => {
  try {
    await fs.writeFile(filePath, data);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});
ipcMain.handle("save-new-file", async (event, windowTitle, fileTypeName, acceptedFileExtensions, data) => {
  try {
    if (!win) return;
    const saveOptions = {
      title: windowTitle,
      filters: [
        {
          name: fileTypeName,
          extensions: acceptedFileExtensions
        }
      ]
    };
    const result = await dialog.showSaveDialogSync(win, saveOptions);
    await fs.writeFile(result, data);
    return {
      success: true,
      filePath: result
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      filePath: null
    };
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
