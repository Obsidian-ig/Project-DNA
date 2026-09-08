//Global Declarations So Typescript isn't a dumbass
export interface ElectronAPI {
  showWindow: () => void;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  restoreWindow: () => void;
  isFullscreen: () => Promise<boolean>;
  isMaximized: () => Promise<boolean>;
  closeWindow: () => void;
  setWindowTitle: (title: string) => void;
  openFileExplorer: (folderPath: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}