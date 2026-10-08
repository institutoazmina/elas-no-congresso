// Port TS de https://github.com/vsueiro/papelada — a lib que gerou as artes de
// papelada do projeto. O original roda sobre p5.js, mas só usa
// translate/rotate/drawImage e um blend MULTIPLY: tudo Canvas 2D nativo. O
// algoritmo (ordem dos sorteios, fórmulas de tamanho) é o mesmo, então as
// pilhas saem com a mesma geometria dos PNGs que elas substituem.

type Arrangement = "pile" | "waffle";
type Category = "favoravel" | "desfavoravel";
type Amounts = [Category, number][];

/** Dimensões da folha em px e a resolução do asset correspondente. */
const SHEETS = {
    a8: { width: 24, height: 34, asset: "96w" },
    a6: { width: 48, height: 68, asset: "96w" },
    a4: { width: 96, height: 136, asset: "192w" },
    a2: { width: 192, height: 272, asset: "384w" },
} as const;

export type SheetSize = keyof typeof SHEETS;

export interface PapeladaOptions {
    arrangement?: Arrangement;
    size?: SheetSize;
    /** Categoria das folhas no `pile` (o `waffle` usa `amounts`). */
    category?: Category;
    /** Distância entre folhas, em percentual da largura da folha. */
    gap?: number;
    assetsPath?: string;
    /** Quantas folhas empilhar no `pile`. */
    amount?: number;
    /** Categorias e quantidades do `waffle`, ex.: `[["favoravel", 75], ["desfavoravel", 25]]`. */
    amounts?: Amounts;
}

// Distância mínima entre a extremidade da folha e o canvas (% da largura).
const PADDING = 0.1;
const ANGLE_INCREMENTS = [0, 1, 2, 3, 4, 5];
// Chance de trocar a orientação a cada folha empilhada.
const ANGLE_CHANCE = 0.125;
// Deslocamento lateral de um bloco de folhas (% da largura).
const HORIZONTAL_SHIFTS = [0, 0.025, 0.05];

type Config = Required<Omit<PapeladaOptions, "amounts">> & { amounts?: Amounts };

function resolve(options: PapeladaOptions): Config {
    return {
        arrangement: options.arrangement ?? "pile",
        size: options.size ?? "a4",
        category: options.category ?? "favoravel",
        gap: options.gap ?? 0.025,
        assetsPath: options.assetsPath ?? "",
        amount: options.amount ?? 0,
        amounts: options.amounts,
    };
}

const total = (config: Config) =>
    config.amounts ? config.amounts.reduce((sum, [, value]) => sum + value, 0) : config.amount;

// Maior dimensão ocupada por uma folha rotacionada, mais o respiro das bordas.
const diagonal = ({ width, height }: { width: number; height: number }) =>
    Math.hypot(width, height) + PADDING * width * 2;

/**
 * Dimensões naturais do gráfico. Serve para dimensionar o `<canvas>` no
 * servidor (evita layout shift) e para o chamador calcular escala.
 */
export function papeladaSize(options: PapeladaOptions): { width: number; height: number } {
    const config = resolve(options);
    const sheet = SHEETS[config.size];

    if (config.arrangement === "pile") {
        const gaps = Math.max(0, config.amount - 1);
        return { width: diagonal(sheet), height: diagonal(sheet) + gaps * (config.gap * sheet.width) };
    }

    const width = sheet.width * 10 + PADDING * sheet.width * 2;
    // Espaço entre os blocos de cada categoria.
    const separation = config.amounts ? (config.amounts.length - 1) * (sheet.width * 3) : 0;
    // Sobra da folha abaixo do quadrado recortado no topo. Usa `width` no lugar
    // da altura para forçar o grid a ficar quadrado.
    const extra = sheet.height - sheet.width;
    return { width, height: width + extra + separation };
}

/**
 * Gap que faz uma pilha de `peak` folhas ocupar `height` px quando o canvas é
 * exibido com `width` px de largura. Usar o mesmo gap em todas as pilhas de um
 * gráfico garante uma escala única: nenhuma estoura a moldura e a comparação
 * entre elas continua honesta, independente das contagens que a API devolver.
 */
export function pileGap(options: { size?: SheetSize; width: number; height: number; peak: number }): number {
    const size = options.size ?? "a4";
    if (options.peak <= 1) return 0.025;
    // A largura natural do canvas é a diagonal da folha — a altura de uma pilha
    // de uma folha só, e portanto o piso da escala.
    const base = papeladaSize({ arrangement: "pile", size, amount: 1 }).width;
    const scale = options.width / base;
    return Math.max(0, options.height / scale - base) / ((options.peak - 1) * SHEETS[size].width);
}

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`papelada: falha ao carregar ${src}`));
        image.src = src;
    });

// Um pile de 460 folhas sorteia 460 vezes entre as mesmas 10 artes, e a página
// tem vários gráficos: carrega cada conjunto uma vez só.
const sheetAssets = import.meta.glob<string>("../../assets/images/papelada/*.png", { eager: true, query: "?url", import: "default" });
const sheetsCache = new Map<string, Promise<HTMLImageElement[]>>();

function loadSheets(assetsPath: string, category: Category, asset: string) {
    const prefix = category === "desfavoravel" ? "proposicao-desfavoravel" : "proposicao";
    const key = `${assetsPath}|${prefix}|${asset}`;
    let sheets = sheetsCache.get(key);
    if (!sheets) {
        sheets = Promise.all(
            Array.from({ length: 10 }, (_, index) => loadImage(assetsPath ? `${assetsPath}${prefix}-${index + 1}-${asset}.png` : sheetAssets[`../../assets/images/papelada/${prefix}-${index + 1}-${asset}.png`])),
        );
        sheetsCache.set(key, sheets);
    }
    return sheets;
}

/** Desenha o gráfico de papelada dentro do `<canvas>` informado. */
export async function papelada(canvas: HTMLCanvasElement, options: PapeladaOptions): Promise<void> {
    const config = resolve(options);
    const sheet = SHEETS[config.size];
    const { width, height } = papeladaSize(options);

    const categories: Category[] = config.amounts
        ? [...new Set(config.amounts.map(([category]) => category))]
        : [config.category];
    const loaded = await Promise.all(categories.map((category) => loadSheets(config.assetsPath, category, sheet.asset)));
    const images = Object.fromEntries(categories.map((category, index) => [category, loaded[index]!])) as Record<
        Category,
        HTMLImageElement[]
    >;

    const context = canvas.getContext("2d");
    if (!context) return;

    const density = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    context.clearRect(0, 0, width, height);

    // O `pile` inclina as folhas; o `waffle` as mantém de pé.
    const angle = config.arrangement === "pile" ? 30 : 0;
    const rotate = () => angle + pick(ANGLE_INCREMENTS) * pick([-1, 1]);
    // O original sorteia uma direção mas nunca a aplica — o deslocamento é
    // sempre para a direita. Mantido: é assim que as artes de referência saíram.
    const shiftBy = () => pick(HORIZONTAL_SHIFTS) * sheet.width;

    const drawSheet = (image: HTMLImageElement, x: number, y: number, rotation: number) => {
        context.save();
        context.translate(x, y);
        context.rotate((rotation * Math.PI) / 180);
        context.drawImage(image, -sheet.width / 2, -sheet.height / 2, sheet.width, sheet.height);
        context.restore();
    };

    if (config.arrangement === "pile") {
        // Começa pela folha de baixo e vai subindo.
        const yBottom = height - diagonal(sheet) / 2;
        let rotation = rotate();
        let shift = shiftBy();

        for (let index = 0; index < config.amount; index++) {
            drawSheet(pick(images[config.category]!), width / 2 + shift, yBottom - index * (config.gap * sheet.width), rotation);

            // De vez em quando o bloco inteiro muda de inclinação.
            if (Math.random() < ANGLE_CHANCE) {
                rotation = rotate();
                shift = shiftBy();
            }
        }
        return;
    }

    // Grid de 10 colunas, do topo à esquerda para baixo.
    const yStart = PADDING * sheet.width + sheet.height / 2;
    const xStart = PADDING * sheet.width + sheet.width / 2;
    const limit = config.amounts ? config.amounts[0]![1] : Infinity;

    for (let index = 0; index < total(config); index++) {
        const category = config.amounts
            ? (index < limit ? config.amounts[0]![0] : config.amounts[1]![0])
            : config.category;
        // Fim da primeira categoria: pula 3 linhas antes de seguir.
        const separation = config.amounts && index >= limit ? 3 : 0;
        const column = index % 10;
        const row = Math.floor(index / 10) + separation;

        drawSheet(pick(images[category]!), xStart + column * sheet.width, yStart + row * sheet.width, rotate());
    }

    // Sobrepõe o gráfico a si mesmo para dar contraste a cada folha.
    context.globalCompositeOperation = "multiply";
    context.drawImage(canvas, 0, 0, width, height);
    context.globalCompositeOperation = "source-over";
}
