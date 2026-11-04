import { Injectable } from '@angular/core';
import { Observable, map, timer } from 'rxjs';
import { Almacenamiento } from '../../core/almacenamiento/almacenamiento';
import { ColeccionReactiva } from '../../core/datos/coleccion-reactiva';
import { datosIniciales } from '../../core/datos/datos-iniciales';
import { RepositorioLocal } from '../../core/datos/repositorio-local';
import { Veterinarios } from '../../core/servicios/veterinarios';
import { Duenos } from '../../mascotas/servicios/duenos';
import { Mascotas } from '../../mascotas/servicios/mascotas';
import {
  Cita,
  CitaDetallada,
  ClaveHorario,
  HORARIO_CLINICA,
  HorarioDia,
  NuevaCita,
} from '../../shared/modelos/cita';
import { esCita } from '../../shared/modelos/guardas';
import { EstadoCita, Resultado, exito, fallo } from '../../shared/modelos/tipos';
import { contarPor, generarId, ordenarPor } from '../../shared/utilidades/colecciones';
import { combinarFechaHora, desdeISO, generarHorarios, hoyISO } from '../../shared/utilidades/fechas';

export const TRANSICIONES_CITA: Readonly<Record<EstadoCita, readonly EstadoCita[]>> = {
  pendiente: ['confirmada', 'atendida', 'cancelada'],
  confirmada: ['atendida', 'cancelada'],
  atendida: [],
  cancelada: [],
};

const ACTIVAS: readonly EstadoCita[] = ['pendiente', 'confirmada'];

@Injectable({ providedIn: 'root' })
export class Citas extends ColeccionReactiva<Cita> {
  public retardoVerificacion = 300;
  public readonly horariosClinica: readonly string[] = generarHorarios(
    HORARIO_CLINICA.inicio,
    HORARIO_CLINICA.fin,
    HORARIO_CLINICA.intervaloMinutos,
    HORARIO_CLINICA.refrigerio,
  );

  constructor(
    almacenamiento: Almacenamiento,
    private mascotas: Mascotas,
    private duenos: Duenos,
    private veterinarios: Veterinarios,
  ) {
    super(new RepositorioLocal<Cita>(almacenamiento, 'citas', esCita, () => datosIniciales().citas));
  }

  public get detalladas$(): Observable<CitaDetallada[]> {
    return this.lista$.pipe(map((citas) => citas.map((cita) => this.detallar(cita))));
  }

  public detallar(cita: Cita): CitaDetallada {
    const mascota = this.mascotas.obtener(cita.mascotaId);
    return {
      ...cita,
      mascota,
      dueno: mascota ? this.duenos.obtenerDueno(mascota.duenoId) : undefined,
      veterinario: this.veterinarios.obtenerVeterinario(cita.veterinarioId),
    };
  }

  public horarioOcupado(clave: ClaveHorario, excluirId: string | null = null): boolean {
    return this.lista.some(
      (cita) =>
        cita.id !== excluirId &&
        cita.estado !== 'cancelada' &&
        cita.fecha === clave.fecha &&
        cita.hora === clave.hora &&
        cita.veterinarioId === clave.veterinarioId,
    );
  }

  public verificarHorario(clave: ClaveHorario, excluirId: string | null = null): Observable<boolean> {
    return timer(this.retardoVerificacion).pipe(map(() => !this.horarioOcupado(clave, excluirId)));
  }

  public horariosDelDia(
    fecha: string,
    veterinarioId: string,
    excluirId: string | null = null,
    ahora: Date = new Date(),
  ): HorarioDia[] {
    const veterinario = this.veterinarios.obtenerVeterinario(veterinarioId);
    if (!fecha || !veterinario || !veterinario.atiendeEl(desdeISO(fecha))) {
      return [];
    }
    return this.horariosClinica.map((hora) => ({
      hora,
      libre:
        combinarFechaHora(fecha, hora) > ahora &&
        !this.horarioOcupado({ fecha, hora, veterinarioId }, excluirId),
    }));
  }

  public agendar(datos: NuevaCita, ahora: Date = new Date()): Resultado<Cita> {
    if (combinarFechaHora(datos.fecha, datos.hora) <= ahora) {
      return fallo('La fecha y hora de la cita ya pasaron.');
    }
    const veterinario = this.veterinarios.obtenerVeterinario(datos.veterinarioId);
    if (!veterinario) {
      return fallo('El veterinario seleccionado no existe.');
    }
    if (!veterinario.atiendeEl(desdeISO(datos.fecha))) {
      return fallo(`${veterinario.nombreCorto} no atiende ese día.`);
    }
    if (this.horarioOcupado(datos)) {
      return fallo('Ese horario ya está ocupado.');
    }
    const cita = this.agregar({
      ...datos,
      notas: datos.notas.trim(),
      id: generarId('cit'),
      estado: 'pendiente',
      creadaEn: hoyISO(ahora),
    });
    return exito(cita);
  }

  public puedeCambiar(cita: Cita, estado: EstadoCita): boolean {
    return TRANSICIONES_CITA[cita.estado].includes(estado);
  }

  public cambiarEstado(id: string, estado: EstadoCita): Resultado<Cita> {
    const cita = this.obtener(id);
    if (!cita) {
      return fallo('La cita no existe.');
    }
    if (!this.puedeCambiar(cita, estado)) {
      return fallo('La cita ya no se puede modificar.');
    }
    const actualizada = this.modificar(id, { estado });
    return actualizada ? exito(actualizada) : fallo('No se pudo actualizar la cita.');
  }

  public delDia(fecha: string, veterinarioId: string | null = null): CitaDetallada[] {
    const delDia = this.lista.filter(
      (cita) => cita.fecha === fecha && (veterinarioId === null || cita.veterinarioId === veterinarioId),
    );
    return ordenarPor(delDia, (cita) => cita.hora).map((cita) => this.detallar(cita));
  }

  public conteoPorDia(veterinarioId: string | null = null): Record<string, number> {
    const activas = this.lista.filter(
      (cita) => cita.estado !== 'cancelada' && (veterinarioId === null || cita.veterinarioId === veterinarioId),
    );
    return contarPor(activas, (cita) => cita.fecha);
  }

  public proximas(ahora: Date, limite = 5, veterinarioId: string | null = null): CitaDetallada[] {
    const futuras = this.lista.filter(
      (cita) =>
        ACTIVAS.includes(cita.estado) &&
        combinarFechaHora(cita.fecha, cita.hora) >= ahora &&
        (veterinarioId === null || cita.veterinarioId === veterinarioId),
    );
    return ordenarPor(futuras, (cita) => `${cita.fecha}T${cita.hora}`)
      .slice(0, limite)
      .map((cita) => this.detallar(cita));
  }

  public porMascota(mascotaId: string): CitaDetallada[] {
    return ordenarPor(
      this.lista.filter((cita) => cita.mascotaId === mascotaId),
      (cita) => `${cita.fecha}T${cita.hora}`,
    ).map((cita) => this.detallar(cita));
  }
}
