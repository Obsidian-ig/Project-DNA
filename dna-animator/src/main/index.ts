import { app, BrowserWindow, dialog, shell, type OpenDialogSyncOptions, type SaveDialogSyncOptions } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ipcMain } from 'electron/main';
import * as fs from 'node:fs/promises';

// Standard ESM fallback to safely resolve path names on Windows
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow | null = null;

const iconPath = app.isPackaged ? path.join(__dirname, 'favicon.png') : path.join(__dirname, '../../src/main/favicon.png');



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
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  win.setAutoHideMenuBar(true);

  function LoadUrl() {
    if (!win) return;
    win.loadURL('http://localhost:5173').catch(() => {
      setTimeout(LoadUrl, 500);
    });
  }

  if (!app.isPackaged) {
    LoadUrl();
  } else {
    win.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.once('window-show', () => {
  win?.show();
});

ipcMain.on('window-minimize', () => {
  win?.minimize();
});
ipcMain.on('window-maximize', () => {
  win?.maximize();
});
ipcMain.on('window-restore', () => {
  win?.restore();
});
ipcMain.handle('is-fullscreen', () => {
  return win?.isFullScreen();
});
ipcMain.handle('is-maximized', () => {
  return win?.isMaximized();
});

ipcMain.on('window-close', () => {
  win?.close();
});

ipcMain.on('set-window-title', (event, title) => {
  win?.setTitle(title);
});

ipcMain.on('open-file-explorer', async (event, folderpath: string) => {
  const errorMessage = await shell.openPath(folderpath);
  if (errorMessage) {
    console.error('Failed to open folder: }' + folderpath);
  }
});
ipcMain.handle('open-file', async (event, windowTitle: string, fileTypeName: string, acceptedFileExtensions: string[]): Promise<string[] | undefined> => {
  if (!win) return;
  const openOptions: OpenDialogSyncOptions = {
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
  return result;  // returns a list of the selected filepaths
});
ipcMain.handle('read-file', async (event, filePath: string) => {
  return await fs.readFile(filePath, 'utf-8');
});
ipcMain.handle('save-or-create-file', async (event, filePath: string, data: string): Promise<boolean> => {
  try {
    await fs.writeFile(filePath, data);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});
ipcMain.handle('save-new-file', async (event, windowTitle: string, fileTypeName: string, acceptedFileExtensions: string[], data: string) => {
  try {
    if (!win) return;
    const saveOptions: SaveDialogSyncOptions = {
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
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.obsidiansoftware.dna-animator');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
