class HeaderActions {
    current = $state({});
}
export const headerActions = new HeaderActions();

export function registerHeaderActions(actions) {
    headerActions.current = actions;
}