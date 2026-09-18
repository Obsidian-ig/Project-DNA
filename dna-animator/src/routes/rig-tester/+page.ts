import { appState, HeaderPanelOptionType, HeaderType, type PageConfig } from "../../AppState.svelte";
import Header from "../header.svelte";

export function load(): PageConfig {
    return {
        title: "Rig Playground",
        id: "Rig Playground",
        header: {
            menu: {
                type: HeaderType.File,
                panels: [
                    {
                        name: "File",
                        options: [
                            {label: "Close Playground", id: "closePlayground", type: HeaderPanelOptionType.Default},
                            {label: "Close Rig", id: "closeRig", type: HeaderPanelOptionType.Default},
                            {label: "Import Rig", id: "importRig", type: HeaderPanelOptionType.Default},
                            {label: "New Rig", id: "newRig", type: HeaderPanelOptionType.Default},
                            {label: "Save Rig", id: "saveRig", type: HeaderPanelOptionType.Default},
                            {label: "Save Rig As", id: "saveRigAs", type: HeaderPanelOptionType.Default},
                            {label: "Open In File Explorer", id: "openInFileExplorer", type: HeaderPanelOptionType.Default}
                        ]
                    },
                    {
                        name: "Edit",
                        options: [
                            {label: "Undo", id: "undo", type: HeaderPanelOptionType.Default},
                            {label: "Redo", id: "redo", type: HeaderPanelOptionType.Default},
                            {label: "Cut", id: "cut", type: HeaderPanelOptionType.Default},
                            {label: "Copy", id: "copy", type: HeaderPanelOptionType.Default},
                            {label: "Paste", id: "paste", type: HeaderPanelOptionType.Default},
                            {label: "Find", id: "find", type: HeaderPanelOptionType.Default}
                        ]
                    },
                    {
                        name: "View",
                        options: [
                            {label: "Toggle Rig Tree", id: "toggleRigTree", type: HeaderPanelOptionType.Default},
                            {label: "Toggle Properties Explorer", id: "togglePropertiesExplorer", type: HeaderPanelOptionType.Default},
                            {label: "Toggle Draggable Indicators", id: "toggleDraggableIndicators", type: HeaderPanelOptionType.Default},
                            {label: "Toggle Sensors Simulation", id: "toggleSensorsSimulation", type: HeaderPanelOptionType.Default},
                            {label: "Layout", id: "layout", type: HeaderPanelOptionType.Expand}
                        ]
                    },
                    {
                        name: "Options",
                        options: [
                            {label: "Colors", id: "colors", type: HeaderPanelOptionType.Default},
                            {label: "Text & Font", id: "textAndFont", type: HeaderPanelOptionType.Default},
                            {label: "Miscellaneous", id: "miscellaneous", type: HeaderPanelOptionType.Default},
                            {label: "Change Theme", id: "changeTheme", type: HeaderPanelOptionType.Default}
                        ]
                    },
                    {
                        name: "Device",
                        options: [
                            {label: "Toggle Device Live Preview", id: "toggleDeviceLivePreview", type: HeaderPanelOptionType.Default}
                        ]
                    }
                ]
            }
        }
    }
}