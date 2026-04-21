export function cleanName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/'/g, '_')
    .toLowerCase()
    .replace(/[^a-z _\-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '-');
}

export function cleanNumero(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/'/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9/_\-]/g, '')
    .replace(/\/+/g, '-')
    .replace(/-+/g, '-');
}
