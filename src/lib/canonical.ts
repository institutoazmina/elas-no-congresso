/**
 * Ano legislativo válido: inteiro entre 1900 e 2100.
 * A API retorna `year: 0` em registros sujos — tratar como desconhecido.
 */
export function isValidLegislativeYear(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 1900 && (value as number) <= 2100;
}

/** Extrai o ano de `presented_at` (YYYY-MM-DD) ou de `/AAAA` do número. */
export function extractPropositionYear(presentedAt: unknown, numberLabel: unknown): number {
    const iso = String(presentedAt ?? "").match(/^(\d{4})-\d{2}-\d{2}/);
    if (iso && isValidLegislativeYear(Number(iso[1]))) return Number(iso[1]);
    const num = String(numberLabel ?? "").match(/\/(\d{4})/);
    if (num && isValidLegislativeYear(Number(num[1]))) return Number(num[1]);
    return 0;
}

/** Formata `presented_at` (YYYY-MM-DD) para DD/MM/AAAA; "Indisponível" se inválido. */
export function formatPresentedDate(value: unknown): string {
    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match || !isValidLegislativeYear(Number(match[1]))) return "Indisponível";
    return `${match[3]}/${match[2]}/${match[1]}`;
}
