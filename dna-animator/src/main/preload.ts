import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    restoreWindow: () => ipcRenderer.send('window-restore'),
    closeWindow: () => ipcRenderer.send('window-close'),
    setWindowTitle: (title: string) => ipcRenderer.send('set-window-title', title),
    openFileExplorer: (folderPath: string) => ipcRenderer.send('open-file-explorer', folderPath)
});