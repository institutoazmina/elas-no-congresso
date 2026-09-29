/**
 * Identidade canônica de proposições entre `dados.json` e a API oficial.
 *
 * Etapa 4 (P0): a API e a base local usam convenções diferentes
 * (`Deputado` vs `camara`, espaços duplos vs simples). A chave canônica é:
 *
 *   CASA|NUMERO_NORMALIZADO
 *
 * NUNCA usar como identidade entre bases: `i` (índice interno por
 * legislatura), `slug` (colide nos 11 pares com espaço duplo) ou `id`
 * interno da API.
 */

/** trim + colapsa whitespace múltiplo + uppercase. */
export function normalizeNumero(value: unknown): string {
    return String(value ?? "").trim().replace(/\s+/g, " ").toUpperCase();
}

/**
 * Deputado/camara/Câmara → CAMARA; Senador/senado → SENADO.
 * Qualquer outro valor vira token upper (nunca silenciosamente Câmara).
 */
export function normalizeCasaKey(value: unknown): string {
    const text = String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
    if (/sen/.test(text)) return "SENADO";
    if (/dep|cam/.test(text)) return "CAMARA";
    return normalizeNumero(value) || "DESCONHECIDA";
}

/** Chave canônica CASA|NUMERO_NORMALIZADO. */
export function canonicalPropositionKey(casa: unknown, numero: unknown): string {
    return `${normalizeCasaKey(casa)}|${normalizeNumero(numero)}`;
}

/**
 * 11 pares do dados.json diferem só por espaço duplo ("PL  1338/2022" vs
 * "PL 1338/2022") e colidem no slug. A canônica é a forma sem espaço duplo:
 * preserva URL única, sem duplicar página/card/contagem.
 */
export function isCanonicalNumero(numero: unknown): boolean {
    const raw = String(numero ?? "");
    return raw.length > 0 && raw.trim() === raw && !/ {2,}/.test(raw);
}

/**
 * Normalização APENAS para agrupamento do filtro "Quem avaliou?".
 * Não altera o texto editorial armazenado/exibido.
 * Ex.: Cfemea/CFEMEA e deFEMde/deFemde agrupam juntos.
 */
export function normalizeEvaluatorKey(value: unknown): string {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/**
 * Ano legislativo válido: inteiro entre 1900 e 2100.
 * A API retorna `year: 0` em registros sujos — tratar como desconhecido.
 */
export function isValidLegislativeYear(value: unknown): value is number {
    return Number.isInteger(value) && (value as number) >= 1900 && (value as number) <= 2100;
}

/** Extrai o ano de `presented_at` (YYYY-MM-DD) ou de `/AAAA` do número. */
export function extractPropositionYear(presentedAt: unknown, numero: unknown): number {
    const iso = String(presentedAt ?? "").match(/^(\d{4})-\d{2}-\d{2}/);
    if (iso && isValidLegislativeYear(Number(iso[1]))) return Number(iso[1]);
    const num = String(numero ?? "").match(/\/(\d{4})/);
    if (num && isValidLegislativeYear(Number(num[1]))) return Number(num[1]);
    return 0;
}

/** Formata `presented_at` (YYYY-MM-DD) para DD/MM/AAAA; "Indisponível" se inválido. */
export function formatPresentedDate(value: unknown): string {
    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match || !isValidLegislativeYear(Number(match[1]))) return "Indisponível";
    return `${match[3]}/${match[2]}/${match[1]}`;
}
