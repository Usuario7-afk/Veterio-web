import { Entidad } from '../../shared/modelos/tipos';

export type CambiosDe<T extends Entidad> = Partial<Omit<T, 'id'>>;

export abstract class Repositorio<T extends Entidad> {
  public listar(): T[] {
    return [...this.leerTodos()];
  }

  public obtener(id: string): T | undefined {
    return this.leerTodos().find((item) => item.id === id);
  }

  public buscar(predicado: (item: T) => boolean): T[] {
    return this.leerTodos().filter(predicado);
  }

  public contar(): number {
    return this.leerTodos().length;
  }

  public crear(item: T): T {
    const actuales = this.leerTodos();
    if (actuales.some((existente) => existente.id === item.id)) {
      throw new Error(`Ya existe un registro con id ${item.id}`);
    }
    this.escribirTodos([...actuales, item]);
    return item;
  }

  public actualizar(id: string, cambios: CambiosDe<T>): T | undefined {
    const actuales = this.leerTodos();
    const actual = actuales.find((item) => item.id === id);
    if (!actual) {
      return undefined;
    }
    const actualizado: T = { ...actual, ...cambios, id };
    this.escribirTodos(actuales.map((item) => (item.id === id ? actualizado : item)));
    return actualizado;
  }

  public eliminar(id: string): boolean {
    const actuales = this.leerTodos();
    const restantes = actuales.filter((item) => item.id !== id);
    if (restantes.length === actuales.length) {
      return false;
    }
    this.escribirTodos(restantes);
    return true;
  }

  protected abstract leerTodos(): readonly T[];

  protected abstract escribirTodos(items: readonly T[]): void;
}
