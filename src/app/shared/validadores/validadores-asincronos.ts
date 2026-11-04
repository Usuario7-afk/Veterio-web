import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { ClaveHorario } from '../modelos/cita';

export interface VerificadorCorreo {
  correoDisponible(correo: string, excluirId: string | null): Observable<boolean>;
}

export interface VerificadorDocumento {
  documentoDisponible(documento: string, excluirId: string | null): Observable<boolean>;
}

export interface VerificadorHorario {
  verificarHorario(clave: ClaveHorario, excluirId: string | null): Observable<boolean>;
}

type IdActual = () => string | null;

const sinId: IdActual = () => null;

export function correoUnico(verificador: VerificadorCorreo, idActual: IdActual = sinId): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const correo: unknown = control.value;
    if (typeof correo !== 'string' || !correo.trim()) {
      return of(null);
    }
    return verificador
      .correoDisponible(correo, idActual())
      .pipe(map((disponible) => (disponible ? null : { correoRegistrado: true })));
  };
}

export function documentoUnico(verificador: VerificadorDocumento, idActual: IdActual = sinId): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const documento: unknown = control.value;
    if (typeof documento !== 'string' || !/^\d{8}$/.test(documento)) {
      return of(null);
    }
    return verificador
      .documentoDisponible(documento, idActual())
      .pipe(map((disponible) => (disponible ? null : { documentoRegistrado: true })));
  };
}

export function horarioDisponible(verificador: VerificadorHorario, idActual: IdActual = sinId): AsyncValidatorFn {
  return (grupo: AbstractControl): Observable<ValidationErrors | null> => {
    const fecha: unknown = grupo.get('fecha')?.value;
    const hora: unknown = grupo.get('hora')?.value;
    const veterinarioId: unknown = grupo.get('veterinarioId')?.value;
    if (typeof fecha !== 'string' || typeof hora !== 'string' || typeof veterinarioId !== 'string') {
      return of(null);
    }
    if (!fecha || !hora || !veterinarioId) {
      return of(null);
    }
    return verificador
      .verificarHorario({ fecha, hora, veterinarioId }, idActual())
      .pipe(map((libre) => (libre ? null : { horarioOcupado: true })));
  };
}
