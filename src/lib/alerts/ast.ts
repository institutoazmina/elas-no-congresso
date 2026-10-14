/**
 * Traduz o que a pessoa marcou no modal para a árvore de filters que
 * `POST /subscriptions/` espera.
 *
 * Os nomes de campo e os valores têm que bater exatamente com os tokens que a
 * API gera para cada proposição (`apps/subscriptions/compiler.py`): categoria é
 * o valor das "Categorias 2026", comissão é a sigla, casa é `camara`/`senado`.
 */
export type AlertSelection = {
    categories: string[];
    house?: string;
    committee?: string;
    propositions?: number[];
};

type Leaf = { field: string; op: string; value: unknown };
export type Ast = Leaf | { op: "AND"; children: Ast[] };

export function buildAst({ categories, house, committee, propositions }: AlertSelection): Ast {
    const filters: Leaf[] = [];
    // ``field`` values are API tokens (apps/subscriptions/compiler.py): keep them in Portuguese.
    if (categories.length) filters.push({ field: "categoria", op: "in", value: categories });
    if (house) filters.push({ field: "casa", op: "eq", value: house });
    if (committee) filters.push({ field: "comissao", op: "eq", value: committee });
    if (propositions?.length) filters.push({ field: "proposicao", op: "in", value: propositions });

    if (!filters.length) throw new Error("Escolha ao menos um tema.");
    return filters.length === 1 ? filters[0]! : { op: "AND", children: filters };
}
