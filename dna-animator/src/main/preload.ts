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
    openFileExplorer: (folderPath: string) => ipcRenderer.send('open-file-explorer', folderPath),
    saveOrCreateFile: (filePath: string, data: string) => ipcRenderer.invoke('save-or-create-file', filePath, data),
    openFile: (windowTitle: string, fileTypeName: string, acceptedFileExtensions: string[]) => ipcRenderer.invoke('open-file', windowTitle, fileTypeName, acceptedFileExtensions),
    readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    saveNewFile: (windowTitle: string, fileTypeName: string, acceptedFileExtensions: string[], data: string) => ipcRenderer.invoke('save-new-file', windowTitle, fileTypeName, acceptedFileExtensions, data)
});