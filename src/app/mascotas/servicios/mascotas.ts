import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { Almacenamiento } from '../../core/almacenamiento/almacenamiento';
import { ColeccionReactiva } from '../../core/datos/coleccion-reactiva';
import { datosIniciales } from '../../core/datos/datos-iniciales';
import { RepositorioLocal } from '../../core/datos/repositorio-local';
import { esMascota } from '../../shared/modelos/guardas';
import {
  CambiosMascota,
  FiltroMascotas,
  Mascota,
  MascotaConDueno,
  NuevaMascota,
} from '../../shared/modelos/mascota';
import { generarId, normalizarTexto, ordenarPor } from '../../shared/utilidades/colecciones';
import { hoyISO } from '../../shared/utilidades/fechas';
import { Duenos } from './duenos';

@Injectable({ providedIn: 'root' })
export class Mascotas extends ColeccionReactiva<Mascota> {
  constructor(
    almacenamiento: Almacenamiento,
    private duenos: Duenos,
  ) {
    super(new RepositorioLocal<Mascota>(almacenamiento, 'mascotas', esMascota, () => datosIniciales().mascotas));
  }

  public get conDueno$(): Observable<MascotaConDueno[]> {
    return combineLatest([this.lista$, this.duenos.duenos$]).pipe(
      map(([mascotas]) => this.combinar(mascotas)),
    );
  }

  public obtenerConDueno(id: string): MascotaConDueno | undefined {
    const mascota = this.obtener(id);
    return mascota ? { mascota, dueno: this.duenos.obtenerDueno(mascota.duenoId) } : undefined;
  }

  public nombreDe(id: string): string {
    return this.obtener(id)?.nombre ?? 'Mascota eliminada';
  }

  public filtrar(filtro: FiltroMascotas): MascotaConDueno[] {
    const texto = normalizarTexto(filtro.texto);
    return this.combinar(this.lista).filter(({ mascota, dueno }) => {
      const coincideEspecie = filtro.especie === 'todas' || mascota.especie === filtro.especie;
      if (!coincideEspecie) {
        return false;
      }
      if (!texto) {
        return true;
      }
      const campos = [mascota.nombre, mascota.raza, dueno?.nombreCompleto ?? '', dueno?.documento ?? ''];
      return campos.some((campo) => normalizarTexto(campo).includes(texto));
    });
  }

  public registrar(datos: NuevaMascota): Mascota {
    return this.agregar({
      ...datos,
      nombre: datos.nombre.trim(),
      alergias: datos.alergias.map((alergia) => alergia.trim()).filter((alergia) => alergia.length > 0),
      id: generarId('mas'),
      fechaRegistro: hoyISO(),
    });
  }

  public actualizar(id: string, cambios: CambiosMascota): Mascota | undefined {
    return this.modificar(id, cambios);
  }

  public delDueno(duenoId: string): Mascota[] {
    return this.lista.filter((mascota) => mascota.duenoId === duenoId);
  }

  private combinar(mascotas: readonly Mascota[]): MascotaConDueno[] {
    return ordenarPor(mascotas, (mascota) => mascota.nombre).map((mascota) => ({
      mascota,
      dueno: this.duenos.obtenerDueno(mascota.duenoId),
    }));
  }
}
