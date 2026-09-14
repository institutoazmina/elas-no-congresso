/**
 * Traduz o que a pessoa marcou no modal para a árvore de filtros que
 * `POST /subscriptions/` espera.
 *
 * Os nomes de campo e os valores têm que bater exatamente com os tokens que a
 * API gera para cada proposição (`apps/subscriptions/compiler.py`): categoria é
 * o valor das "Categorias 2026", comissão é a sigla, casa é `camara`/`senado`.
 */
export type AlertSelection = {
    categorias: string[];
    casa?: string;
    comissao?: string;
    proposicoes?: number[];
};

type Leaf = { field: string; op: string; value: unknown };
export type Ast = Leaf | { op: "AND"; children: Ast[] };

export function buildAst({ categorias, casa, comissao, proposicoes }: AlertSelection): Ast {
    const filtros: Leaf[] = [];
    if (categorias.length) filtros.push({ field: "categoria", op: "in", value: categorias });
    if (casa) filtros.push({ field: "casa", op: "eq", value: casa });
    if (comissao) filtros.push({ field: "comissao", op: "eq", value: comissao });
    if (proposicoes?.length) filtros.push({ field: "proposicao", op: "in", value: proposicoes });

    if (!filtros.length) throw new Error("Escolha ao menos um tema.");
    return filtros.length === 1 ? filtros[0]! : { op: "AND", children: filtros };
}
