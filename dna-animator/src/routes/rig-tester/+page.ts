import { appState, HeaderType, type PageConfig } from "../../AppState.svelte";

export function load(): PageConfig {
    appState.GetCurrentPage();
    return {
        title: "Rig Playground",
        header: {
            menu: {
                type: HeaderType.File,
                panels: [
                    {
                        name: "File",
                        options: [
                            {label: "Close Playground", id: "closePlayground"},
                            {label: "Import Rig", id: "importRig"},
                            {label: "New Rig", id: "newRig"},
                            {label: "Save Rig", id: "saveRig"},
                            {label: "Save Rig As", id: "saveRigAs"},
                            {label: "Open In File Explorer", id: "openInFileExplorer"}
                        ]
                    },
                    {
                        name: "Edit",
                        options: [
                            {label: "Undo", id: "undo"},
                            {label: "Redo", id: "redo"},
                            {label: "Cut", id: "cut"},
                            {label: "Copy", id: "copy"},
                            {label: "Paste", id: "paste"},
                            {label: "Find", id: "find"}
                        ]
                    },
                    {
                        name: "View",
                        options: [
                            {label: "Toggle Properties Explorer", id: "togglePropertiesExplorer"},
                            {label: "Toggle Draggable Indicators", id: "toggleDraggableIndicators"}
                        ]
                    },
                    {
                        name: "Options",
                        options: [
                            {label: "Colors", id: "colors"},
                            {label: "Text & Font", id: "textAndFont"},
                            {label: "Miscellaneous", id: "miscellaneous"}
                        ]
                    }
                ]
            }
        }
    }
}