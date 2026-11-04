import { BehaviorSubject, Observable } from 'rxjs';
import { Entidad } from '../../shared/modelos/tipos';
import { CambiosDe, Repositorio } from './repositorio';

export abstract class ColeccionReactiva<T extends Entidad> {
  private readonly sujeto: BehaviorSubject<readonly T[]>;

  protected constructor(protected readonly repositorio: Repositorio<T>) {
    this.sujeto = new BehaviorSubject<readonly T[]>(repositorio.listar());
  }

  public get lista$(): Observable<readonly T[]> {
    return this.sujeto.asObservable();
  }

  public get lista(): readonly T[] {
    return this.sujeto.value;
  }

  public obtener(id: string): T | undefined {
    return this.lista.find((item) => item.id === id);
  }

  protected agregar(item: T): T {
    const creado = this.repositorio.crear(item);
    this.refrescar();
    return creado;
  }

  protected modificar(id: string, cambios: CambiosDe<T>): T | undefined {
    const actualizado = this.repositorio.actualizar(id, cambios);
    this.refrescar();
    return actualizado;
  }

  protected quitar(id: string): boolean {
    const eliminado = this.repositorio.eliminar(id);
    this.refrescar();
    return eliminado;
  }

  protected refrescar(): void {
    this.sujeto.next(this.repositorio.listar());
  }
}
