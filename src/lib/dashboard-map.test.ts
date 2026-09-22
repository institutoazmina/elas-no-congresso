// Testes determinísticos da escala absoluta do mapa da Atividade Legislativa.
// Rodar: node --experimental-strip-types src/lib/dashboard-map.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    MAP_FAVORABILITY_COLORS,
    MAP_FAVORABILITY_DOMAIN,
    MAP_FAVORABILITY_STOPS,
    aggregateAuthorships,
    calculateMapFavorableRate,
    getSingleDashboardResultMessage,
    mapFavorableRateToColor,
    MAP_UF_CODES,
    isMapUfCode,
    type DashboardRow,
} from "./dashboard-utils.ts";

const row = (key: string, favorable: number, unfavorable: number): DashboardRow => ({ key, label: key, favorable, unfavorable });

// Limites e clamp da escala absoluta: filtros nunca mudam este domínio.
assert.deepStrictEqual(MAP_FAVORABILITY_DOMAIN, [0.6, 0.9]);
assert.strictEqual(mapFavorableRateToColor(0.6), MAP_FAVORABILITY_COLORS.unfavorable);
assert.strictEqual(mapFavorableRateToColor(0.75), MAP_FAVORABILITY_COLORS.midpoint);
assert.strictEqual(mapFavorableRateToColor(0.9), MAP_FAVORABILITY_COLORS.favorable);
assert.strictEqual(mapFavorableRateToColor(0.2), MAP_FAVORABILITY_COLORS.unfavorable);
assert.strictEqual(mapFavorableRateToColor(1), MAP_FAVORABILITY_COLORS.favorable);
for (const stop of MAP_FAVORABILITY_STOPS) assert.strictEqual(mapFavorableRateToColor(stop.rate), stop.color);

// Sem avaliação não entra no denominador da taxa favorável.
assert.strictEqual(calculateMapFavorableRate(row("SP", 3, 1)), 0.75);

// Não há divisão 0/0: UF sem avaliadas é N/A, nunca vermelho.
assert.strictEqual(calculateMapFavorableRate(row("AC", 0, 0)), null);
assert.strictEqual(mapFavorableRateToColor(calculateMapFavorableRate(row("AC", 0, 0))), MAP_FAVORABILITY_COLORS.unavailable);

// A camada de cor só pode ser aplicada a paths identificados por UF.
assert.strictEqual(MAP_UF_CODES.length, 27);
assert.ok(isMapUfCode("SP"));
assert.ok(isMapUfCode(" sp "));
assert.ok(!isMapUfCode("background"));

// O vetor oficial exportado do Figma contém uma geometria identificada para
// cada UF. A camada de interação referencia exatamente estes 27 IDs.
const mapSvg = readFileSync(new URL("../assets/images/redesign/activity/map/ufs-vector-diverging-elas-palette.svg", import.meta.url), "utf8");
const vectorUfs = [...mapSvg.matchAll(/<path id="([A-Z]{2})"/g)].map((match) => match[1]);
assert.strictEqual(vectorUfs.length, 27);
assert.deepStrictEqual([...vectorUfs].sort(), [...MAP_UF_CODES].sort());

// A mesma taxa recebe a mesma cor, com ou sem filtros que alterem totais.
const beforeFilters = calculateMapFavorableRate(row("SP", 8, 2));
const afterFilters = calculateMapFavorableRate(row("SP", 4, 1));
assert.strictEqual(beforeFilters, afterFilters);
assert.strictEqual(mapFavorableRateToColor(beforeFilters), mapFavorableRateToColor(afterFilters));

// A unidade do mapa é uma autoria válida por pessoa e por proposição.
const mapRows = aggregateAuthorships(
    [{ favorable: 1, authors: [{ numero: 7, estado: "SP" }, { numero: 7, estado: "SP" }, { numero: 8, estado: "SP" }] }],
    (author) => author.estado === "SP" ? { key: "SP", label: "SP" } : null,
);
assert.deepStrictEqual(mapRows, [row("SP", 2, 0)]);

// Mensagens de resultado único são genéricas, sem nomes de partidos/pessoas.
assert.strictEqual(getSingleDashboardResultMessage("party", [row("PT", 1, 0)]), "Para ver mais partidos, tente remover filtros.");
assert.strictEqual(getSingleDashboardResultMessage("author", [row("person:1", 1, 0)]), "Para ver mais parlamentares, tente remover filtros.");
assert.strictEqual(getSingleDashboardResultMessage("party", [row("PT", 1, 0), row("PSB", 1, 0)]), null);

console.log("ok");
