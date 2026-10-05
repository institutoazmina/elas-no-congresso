export const YEAR_RANGE_CHANGE_EVENT = "activity:year-range-change";
export const YEAR_RANGE_SYNC_EVENT = "activity:year-range-sync";

export type ActivityYearRange = { start: string; end: string };
export type ActivityYearOption = { value: string; label: string };

export function readActivityYearRange(root: HTMLElement): ActivityYearRange {
    return {
        start: root.querySelector<HTMLInputElement>('input[name="year_start"]')?.value ?? "",
        end: root.querySelector<HTMLInputElement>('input[name="year_end"]')?.value ?? "",
    };
}

export function readActivityYearOptions(root: HTMLElement): ActivityYearOption[] {
    return JSON.parse(root.dataset.yearOptions || "[]");
}

export function syncActivityYearRange(root: HTMLElement, close = false) {
    root.dispatchEvent(new CustomEvent(YEAR_RANGE_SYNC_EVENT, { detail: { close } }));
}
