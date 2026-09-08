import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    showWindow: () => ipcRenderer.send('window-show'),
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    restoreWindow: () => ipcRenderer.send('window-restore'),
    isFullscreen: () => { return ipcRenderer.invoke('is-fullscreen'); },
    isMaximized: () => { return ipcRenderer.invoke('is-maximized'); },
    closeWindow: () => ipcRenderer.send('window-close'),
    setWindowTitle: (title: string) => ipcRenderer.send('set-window-title', title),
    openFileExplorer: (folderPath: string) => ipcRenderer.send('open-file-explorer', folderPath)
});