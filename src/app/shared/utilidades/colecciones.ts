export function generarId(prefijo: string): string {
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${prefijo}-${Date.now().toString(36)}${aleatorio}`;
}

export function agruparPor<T, K extends PropertyKey>(
  lista: readonly T[],
  clave: (item: T) => K,
): Partial<Record<K, T[]>> {
  const grupos: Partial<Record<K, T[]>> = {};
  for (const item of lista) {
    const k = clave(item);
    const grupo = grupos[k] ?? [];
    grupo.push(item);
    grupos[k] = grupo;
  }
  return grupos;
}

export function contarPor<T>(lista: readonly T[], clave: (item: T) => string): Record<string, number> {
  const conteo: Record<string, number> = {};
  for (const item of lista) {
    const k = clave(item);
    conteo[k] = (conteo[k] ?? 0) + 1;
  }
  return conteo;
}

export function ordenarPor<T>(
  lista: readonly T[],
  selector: (item: T) => string | number,
  descendente = false,
): T[] {
  const factor = descendente ? -1 : 1;
  return [...lista].sort((a, b) => {
    const va = selector(a);
    const vb = selector(b);
    if (va < vb) {
      return -1 * factor;
    }
    if (va > vb) {
      return 1 * factor;
    }
    return 0;
  });
}

export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}
