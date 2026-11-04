import { Injectable } from '@angular/core';
import { Almacenamiento } from '../../core/almacenamiento/almacenamiento';
import { ColeccionReactiva } from '../../core/datos/coleccion-reactiva';
import { datosIniciales } from '../../core/datos/datos-iniciales';
import { RepositorioLocal } from '../../core/datos/repositorio-local';
import { Veterinarios } from '../../core/servicios/veterinarios';
import { Citas } from '../../citas/servicios/citas';
import { Mascotas } from '../../mascotas/servicios/mascotas';
import { Atencion, AtencionVista, NuevaAtencion } from '../../shared/modelos/atencion';
import { esAtencion } from '../../shared/modelos/guardas';
import { Resultado, exito, fallo } from '../../shared/modelos/tipos';
import { generarId, ordenarPor } from '../../shared/utilidades/colecciones';
import { desdeISO } from '../../shared/utilidades/fechas';

@Injectable({ providedIn: 'root' })
export class Atenciones extends ColeccionReactiva<Atencion> {
  constructor(
    almacenamiento: Almacenamiento,
    private citas: Citas,
    private mascotas: Mascotas,
    private veterinarios: Veterinarios,
  ) {
    super(new RepositorioLocal<Atencion>(almacenamiento, 'atenciones', esAtencion, () => datosIniciales().atenciones));
  }

  public registrar(datos: NuevaAtencion): Resultado<Atencion> {
    if (!this.mascotas.obtener(datos.mascotaId)) {
      return fallo('La mascota no existe.');
    }
    if (datos.citaId !== null) {
      const cita = this.citas.obtener(datos.citaId);
      if (cita && cita.estado !== 'atendida') {
        const cambio = this.citas.cambiarEstado(cita.id, 'atendida');
        if (!cambio.ok) {
          return fallo(cambio.error);
        }
      }
    }
    const atencion = this.agregar({
      ...datos,
      medicamentos: datos.medicamentos.filter((medicamento) => medicamento.nombre.trim().length > 0),
      id: generarId('ate'),
    });
    if (datos.peso > 0) {
      this.mascotas.actualizar(datos.mascotaId, { peso: datos.peso });
    }
    return exito(atencion);
  }

  public porMascota(mascotaId: string): AtencionVista[] {
    const propias = this.lista.filter((atencion) => atencion.mascotaId === mascotaId);
    return ordenarPor(propias, (atencion) => atencion.fecha, true).map((atencion) => ({
      ...atencion,
      nombreVeterinario: this.veterinarios.obtenerVeterinario(atencion.veterinarioId)?.nombreCompleto ?? 'Sin registro',
    }));
  }

  public ultimaDe(mascotaId: string): Atencion | undefined {
    return this.porMascota(mascotaId)[0];
  }

  public delMes(anio: number, mes: number): Atencion[] {
    return this.lista.filter((atencion) => {
      const fecha = desdeISO(atencion.fecha);
      return fecha.getFullYear() === anio && fecha.getMonth() === mes;
    });
  }
}
