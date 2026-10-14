// node --experimental-strip-types src/lib/paperwork/paperwork.test.ts
//
// O port só está correto se reproduzir a geometria dos PNGs que ele substitui —
// eles saíram da lib original, então os tamanhos medidos neles são a referência.
import assert from "node:assert/strict";
import { paperworkSize, pileGap } from "./index.ts";

const near = (actual: number, expected: number, what: string, tolerance = 0.5) =>
    assert.ok(
        Math.abs(actual - expected) <= tolerance,
        `${what}: esperado ~${expected}, veio ${actual}`,
    );

// papelada-favoravel-feminina.png (export do design) tem 244.8 x 326.8: waffle a8 com duas categorias.
const waffle = paperworkSize({ arrangement: "waffle", size: "a8", amounts: [["favorable", 83], ["unfavorable", 17]] });
near(waffle.width, 244.8, "waffle a8 largura", 0.01);
near(waffle.height, 326.8, "waffle a8 altura", 0.01);

// Sem `amounts` o waffle perde o intervalo entre blocos (3 linhas de 24px).
near(paperworkSize({ arrangement: "waffle", size: "a8", amount: 100 }).height, 326.8 - 72, "waffle sem blocos");

// papelada-desfavoravel-242/460.png aparecem com 92.5px de largura e 382/643.5px
// de altura no design — pile a4 com o gap padrão, exibido em escala 1:2. As
// alturas confirmam a escala exata (92.83px); o design arredondou a largura para
// 92.5px, daí a folga de ~0.4% na tolerância.
const scale = 92.5 / paperworkSize({ arrangement: "pile", size: "a4", amount: 1 }).width;
near(paperworkSize({ arrangement: "pile", size: "a4", amount: 242 }).height * scale, 382, "pile 242 @92.5px", 3);
near(paperworkSize({ arrangement: "pile", size: "a4", amount: 460 }).height * scale, 643.5, "pile 460 @92.5px", 3);
near(paperworkSize({ arrangement: "pile", size: "a4", amount: 460 }).height / 2, 643.5, "pile 460 em escala 1:2", 0.2);

// Uma folha só = a diagonal da folha, o piso da escala.
const single = paperworkSize({ arrangement: "pile", size: "a4", amount: 1 });
assert.equal(single.width, single.height, "pilha de 1 folha é quadrada");
// E amount 0 não pode gerar altura negativa (gaps = -1 no cálculo ingênuo).
assert.equal(paperworkSize({ arrangement: "pile", size: "a4", amount: 0 }).height, single.height, "pile vazio");

// pileGap: a maior pilha tem que bater exatamente a altura pedida, e nenhuma
// outra pode passar dela — é o que impede o gráfico de estourar a moldura.
for (const [width, height, peak] of [[46, 127, 304], [46, 200, 378], [92.5, 643.5, 460]]) {
    const gap = pileGap({ width: width!, height: height!, peak: peak! });
    const at = (amount: number) =>
        paperworkSize({ arrangement: "pile", size: "a4", gap, amount }).height * (width! / single.width);
    near(at(peak!), height!, `pileGap pico ${peak}`, 0.01);
    assert.ok(at(peak! - 1) < height!, `pileGap: ${peak! - 1} folhas devem ser menores que o pico`);
    near(at(1), width!, `pileGap piso ${width}px`, 0.01);
}

// Pico degenerado não pode dividir por zero nem devolver NaN.
assert.ok(Number.isFinite(pileGap({ width: 46, height: 127, peak: 1 })), "pileGap com pico 1");

console.log("ok");
