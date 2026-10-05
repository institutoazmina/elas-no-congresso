export const ACTIVITY_SINGLE_FILTERS = ["house", "assessment", "movements", "gender", "comments"] as const;
export const SELECT_CHANGE_EVENT = "activity:select-change";
export const SELECT_SYNC_EVENT = "activity:select-sync";

export function activitySelectInput(root: HTMLElement, name: string) {
    return root.querySelector<HTMLInputElement>(`input[data-activity-select="${name}"]`);
}

export function syncActivitySelects(root: HTMLElement, close = false) {
    root.dispatchEvent(new CustomEvent(SELECT_SYNC_EVENT, { detail: { close } }));
}
