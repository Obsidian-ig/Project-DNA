import { HeaderType, type PageConfig } from "../AppState.svelte";

export function load(): PageConfig {
    return {
        title: "Dashboard",
        header: {
            menu: {
                type: HeaderType.Default,
                panels: []
            }
        }
    }
}