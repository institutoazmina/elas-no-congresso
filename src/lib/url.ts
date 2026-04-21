export function url(path = ''): string {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `/${clean}`;
}
