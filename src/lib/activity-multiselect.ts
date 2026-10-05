export const ACTIVITY_MULTI_FILTERS = ["party", "category", "celerity", "religion", "state", "evaluator"] as const;
export type ActivityMultiFilterName = typeof ACTIVITY_MULTI_FILTERS[number];
export type ActivityFilterOption = { value: string; label: string };
export const MULTI_FILTER_CHANGE_EVENT = "activity:multi-filter-change";
export const MULTI_FILTER_SYNC_EVENT = "activity:multi-filter-sync";

export function readActivityMultiValues(root: HTMLElement, name: ActivityMultiFilterName): string[] {
    const value = root.querySelector<HTMLInputElement>(`input[data-activity-multiple="${name}"]`)?.value;
    return value ? JSON.parse(value) : [];
}

export function readActivityMultiOptions(root: HTMLElement, name: ActivityMultiFilterName): ActivityFilterOption[] {
    const options = JSON.parse(root.dataset.multiFilterOptions || "{}");
    return options[name] ?? [];
}

export function syncActivityMultiFilters(root: HTMLElement, close = false) {
    root.dispatchEvent(new CustomEvent(MULTI_FILTER_SYNC_EVENT, { detail: { close } }));
}
