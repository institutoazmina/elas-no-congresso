export function propositionSlug(value: unknown): string | null {
  const slug = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
}

export function propositionRoute(proposition: { numero: string } | string): string | null {
  const number = typeof proposition === "string" ? proposition : proposition.numero;
  const slug = propositionSlug(number);
  return slug ? `/propostas-e-votacoes/proposicao/${slug}` : null;
}

export function propositionStatus(probability: number | null | undefined): string {
  if (probability === null || probability === undefined || !Number.isFinite(probability)) return "Indisponível";
  return probability >= 0.55 ? "Rápida" : "Lenta";
}

export function propositionAssessment(value: number): "Favorável" | "Desfavorável" | "Sem avaliação" {
  if (value > 0) return "Favorável";
  if (value < 0) return "Desfavorável";
  return "Sem avaliação";
}
