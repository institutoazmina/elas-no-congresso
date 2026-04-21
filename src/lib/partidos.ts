import csvRaw from '../data/parlamentares.csv?raw';

export function getPartidos(): string[] {
  const lines = csvRaw.trim().split('\n');
  const headers = lines[0].split(',');
  const idx = headers.indexOf('partido');
  if (idx === -1) return [];
  const set = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols[idx]?.trim()) set.add(cols[idx].trim());
  }
  return [...set].sort();
}
