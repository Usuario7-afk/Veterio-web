import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { desdeISO, esFechaISO, hoyISO } from '../utilidades/fechas';
import { normalizarTexto } from '../utilidades/colecciones';

const PATRON_DOCUMENTO = /^\d{8}$/;
const PATRON_TELEFONO = /^9\d{8}$/;

function textoDe(control: AbstractControl): string {
  const valor: unknown = control.value;
  return typeof valor === 'string' ? valor.trim() : '';
}

export function documentoValido(control: AbstractControl): ValidationErrors | null {
  const valor = textoDe(control);
  if (!valor) {
    return null;
  }
  return PATRON_DOCUMENTO.test(valor) ? null : { documento: true };
}

export function telefonoValido(control: AbstractControl): ValidationErrors | null {
  const valor = textoDe(control).replace(/\s/g, '');
  if (!valor) {
    return null;
  }
  return PATRON_TELEFONO.test(valor) ? null : { telefono: true };
}

export function fechaValida(control: AbstractControl): ValidationErrors | null {
  const valor = textoDe(control);
  if (!valor) {
    return null;
  }
  return esFechaISO(valor) ? null : { fecha: true };
}

export function fechaNoPasada(referencia: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = textoDe(control);
    if (!valor || !esFechaISO(valor)) {
      return null;
    }
    return valor < hoyISO(referencia()) ? { fechaPasada: true } : null;
  };
}

export function fechaNoFutura(referencia: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = textoDe(control);
    if (!valor || !esFechaISO(valor)) {
      return null;
    }
    return desdeISO(valor) > desdeISO(hoyISO(referencia())) ? { fechaFutura: true } : null;
  };
}

export function clavesCoinciden(campoClave: string, campoConfirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const clave = grupo.get(campoClave)?.value;
    const confirmacion = grupo.get(campoConfirmacion)?.value;
    if (!clave && !confirmacion) {
      return null;
    }
    return clave === confirmacion ? null : { clavesDistintas: true };
  };
}

export function sinDuplicados(control: AbstractControl): ValidationErrors | null {
  if (!(control instanceof FormArray)) {
    return null;
  }
  const valores = control.controls
    .map((item) => (typeof item.value === 'string' ? normalizarTexto(item.value) : ''))
    .filter((valor) => valor.length > 0);
  return new Set(valores).size === valores.length ? null : { duplicados: true };
}

export function requeridoSi(condicion: () => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!condicion()) {
      return null;
    }
    const valor: unknown = control.value;
    const vacio = valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');
    return vacio ? { required: true } : null;
  };
}
