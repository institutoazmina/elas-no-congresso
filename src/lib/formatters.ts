export function artigoCasa(s: string): string {
  switch (s) {
    case 'Senador': return 'o';
    case 'Deputado': return 'a';
    case 'Senador fora de exercício': return 'o';
    case 'Deputado fora de exercício': return 'a';
    default: return s;
  }
}

export function casa(s: string): string {
  switch (s) {
    case 'Senador': return 'Senado';
    case 'Deputado': return 'Câmara';
    case 'Senador fora de exercício': return 'Senado';
    case 'Deputado fora de exercício': return 'Câmara';
    default: return s;
  }
}

export function genero(s: string, g: string): string {
  switch (s) {
    case 'Campeão': return g === 'F' ? 'Campeã' : s;
    case 'Deputado': return g === 'F' ? 'Deputada' : s;
    case 'Senador': return g === 'F' ? 'Senadora' : s;
    case 'Candidato': return g === 'F' ? 'Candidata' : s;
    case 'Deputado fora de exercício': return g === 'F' ? 'Deputada fora de exercício' : s;
    case 'Senador fora de exercício': return g === 'F' ? 'Senadora fora de exercício' : s;
    case 'º': return g === 'F' ? 'ª' : s;
    default: return s;
  }
}

export function avaliacao(s: number | string): string {
  switch (Number(s)) {
    case -1: return 'Desfavorável';
    case 1: return 'Favorável';
    default: return String(s);
  }
}

export function relevancia(s: number): string {
  switch (s) {
    case 1: return 'Pouca';
    case 2: return 'Muita';
    default: return String(s);
  }
}

export function voto(s: number): string {
  switch (s) {
    case 1: return 'a favor';
    case -1: return 'contra';
    case 0: return 'abstenção';
    default: return String(s);
  }
}
