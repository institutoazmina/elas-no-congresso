// Geometrias do mapa da Atividade Legislativa.
// Rodar: node --experimental-strip-types src/lib/dashboard-map.test.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAP_UF_CODES } from "./dashboard-utils.ts";

// A camada de cor só pode ser aplicada a paths identificados por UF.
assert.strictEqual(MAP_UF_CODES.length, 27);

// O vetor oficial exportado do Figma contém uma geometria identificada para
// cada UF. A camada de interação referencia exatamente estes 27 IDs.
const mapSvg = readFileSync(new URL("../../public/assets/images/activity/map/ufs-vector-diverging-elas-palette.svg", import.meta.url), "utf8");
const vectorUfs = [...mapSvg.matchAll(/<path id="([A-Z]{2})"/g)].map((match) => match[1]);
assert.strictEqual(vectorUfs.length, 27);
assert.deepStrictEqual([...vectorUfs].sort(), [...MAP_UF_CODES].sort());

console.log("ok");
