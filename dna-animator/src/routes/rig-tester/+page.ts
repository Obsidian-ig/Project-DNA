import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  return {
    title: "Rig Playground",
    menu: {
        type: "file",
        panels: [
            {
                name: "File",
                options: [
                    "Import Rig",
                    "New Rig",
                    "Save Rig",
                    "Save Rig As",
                    "Open In File Explorer",
                ]
            }
        ]
    }
  }  
};