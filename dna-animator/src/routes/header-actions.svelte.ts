export interface HeaderAction {
    id: string,
    action: () => void
}

export interface HeaderActionsPanels {
    file?: HeaderAction[];
    edit?: HeaderAction[];
    view?: HeaderAction[];
    options?: HeaderAction[];
}

class HeaderActions {
    current = $state<HeaderActionsPanels>();
}
export const headerActions = new HeaderActions();

export function registerHeaderActions(actions: HeaderActionsPanels) {
    headerActions.current = actions;
}

/*Global Header Functions (Cut, Copy, Paste, Etc.)*/
//EDIT FUNCTIONS
export function Undo() {console.log("Undo!");}
export function Redo() {console.log("Redo!");}
export function Cut() {console.log("Cut!");}
export function Copy() {console.log("Copy!");}
export function Paste() {console.log("Paste!");}
export function Find() {console.log("Find!");}

//Options Functions
export function Colors() {console.log("Color Settings!");}
export function TextAndFont() {console.log("Text & Font Settings!");}
export function Miscellaneous() {console.log("Misc Settings!");}