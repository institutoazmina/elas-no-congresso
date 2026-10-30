import type { House } from "./activity-api";

export const HOUSE_LABELS: Record<House, { short: string; full: string }> = {
  camara: { short: "Câmara", full: "Câmara dos Deputados" },
  senado: { short: "Senado", full: "Senado Federal" },
};

export function formatHouseJourney(origin: House, current: House | null | undefined, form: "short" | "full"): string {
  const destination = current && current !== origin && HOUSE_LABELS[current][form];
  return [HOUSE_LABELS[origin][form], destination].filter(Boolean).join(" → ");
}
