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
  saveOrCreateFile: (filePath: string, data: string) => Promise<boolean>;
  openFile: (windowTitle: string, fileTypeName: string, acceptedFileExtensions: string[]) => Promise<string[] | undefined>;
  readFile: (filePath: string) => Promise<string>;
  saveNewFile: (windowTitle: string, fileTypeName: string, acceptedFileExtensions: string[], data: string) => Promise<{success: boolean, filePath: string}>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    showOpenFilePicker(options?: *): Promise<*[]>;
  }
}
