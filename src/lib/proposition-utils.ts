export function propositionSlug(value: unknown): string | null {
  const slug = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
}

export function propositionRoute(
  proposition: { numero: string; house?: string } | string,
  house?: string,
): string | null {
  const number = typeof proposition === "string" ? proposition : proposition.numero;
  const slug = propositionSlug(number);
  const propositionHouse = typeof proposition === "string" ? house : proposition.house;
  const houseSlug = propositionSlug(propositionHouse);
  return slug ? `/atividade-legislativa/proposicao/${houseSlug ? `${houseSlug}-` : ""}${slug}` : null;
}
