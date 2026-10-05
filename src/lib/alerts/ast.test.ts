import assert from "node:assert/strict";
import { buildAst } from "./ast.ts";

// As "Categorias 2026" viram um único leaf `in` — o compilador da API já traduz
// isso para (categoria_a | categoria_b), sem precisar de um nó OR à mão.
assert.deepEqual(buildAst({ categorias: ["violencias_de_genero", "saude"] }), {
    field: "categoria",
    op: "in",
    value: ["violencias_de_genero", "saude"],
});

// Os filtros do alerta diário entram como AND ao lado das categorias.
assert.deepEqual(buildAst({ categorias: ["saude"], casa: "camara", comissao: "CCJ" }), {
    op: "AND",
    children: [
        { field: "categoria", op: "in", value: ["saude"] },
        { field: "casa", op: "eq", value: "camara" },
        { field: "comissao", op: "eq", value: "CCJ" },
    ],
});

// Proposições são opcionais; quando vêm, são os ids numéricos que a API tokeniza.
assert.deepEqual(buildAst({ categorias: ["saude"], casa: "senado", proposicoes: [4242, 4343] }), {
    op: "AND",
    children: [
        { field: "categoria", op: "in", value: ["saude"] },
        { field: "casa", op: "eq", value: "senado" },
        { field: "proposicao", op: "in", value: [4242, 4343] },
    ],
});

// "Ambas" não envia um token de casa: mantém os temas nas duas casas.
for (const casa of ["senado", "camara"]) {
    assert.deepEqual(buildAst({ categorias: ["educacao_cultura"], casa }), {
        op: "AND",
        children: [
            { op: "in", field: "categoria", value: ["educacao_cultura"] },
            { op: "eq", field: "casa", value: casa },
        ],
    });
}
assert.deepEqual(buildAst({ categorias: ["educacao_cultura"], casa: "" }), {
    op: "in", field: "categoria", value: ["educacao_cultura"],
});
assert.deepEqual(buildAst({ categorias: ["saude"], casa: "", proposicoes: [4242, 4343] }), {
    op: "AND",
    children: [
        { field: "categoria", op: "in", value: ["saude"] },
        { field: "proposicao", op: "in", value: [4242, 4343] },
    ],
});

// Sem nada marcado a inscrição casaria com o Congresso inteiro — barra antes
// de chegar na rede.
assert.throws(() => buildAst({ categorias: [] }), /ao menos um tema/);

console.log("ok");
