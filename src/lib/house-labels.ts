import type { House } from "./activity-api";

export const HOUSE_LABELS: Record<House, { short: string; full: string }> = {
  camara: { short: "Câmara", full: "Câmara dos Deputados" },
  senado: { short: "Senado", full: "Senado Federal" },
};
