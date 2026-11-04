import { Almacenamiento } from '../almacenamiento/almacenamiento';
import { Guarda, esListaDe } from '../../shared/modelos/guardas';
import { Entidad } from '../../shared/modelos/tipos';
import { Repositorio } from './repositorio';

export class RepositorioLocal<T extends Entidad> extends Repositorio<T> {
  private readonly guardaLista: Guarda<T[]>;

  constructor(
    private readonly almacenamiento: Almacenamiento,
    private readonly clave: string,
    guarda: Guarda<T>,
    private readonly semilla: () => readonly T[] = () => [],
  ) {
    super();
    this.guardaLista = (valor: unknown): valor is T[] => esListaDe(valor, guarda);
  }

  protected leerTodos(): readonly T[] {
    const guardados = this.almacenamiento.leer(this.clave, this.guardaLista);
    if (guardados !== null) {
      return guardados;
    }
    const iniciales = [...this.semilla()];
    this.escribirTodos(iniciales);
    return iniciales;
  }

  protected escribirTodos(items: readonly T[]): void {
    this.almacenamiento.escribir(this.clave, items);
  }
}
