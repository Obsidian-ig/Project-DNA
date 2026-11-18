export async function CreateOrSaveFile(filename: string, data: string) {
    if (!window.electronAPI) {
        //not packaged in electron and so IndexedDB should be used.
    } else {
        //packaged in electron and so regular files should be used.
    }
}