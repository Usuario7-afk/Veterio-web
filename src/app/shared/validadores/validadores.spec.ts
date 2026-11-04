import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { firstValueFrom, Observable, of } from 'rxjs';
import { mensajesDe } from './mensajes';
import {
  clavesCoinciden,
  documentoValido,
  fechaNoFutura,
  fechaNoPasada,
  fechaValida,
  requeridoSi,
  sinDuplicados,
  telefonoValido,
} from './validadores';
import { correoUnico, documentoUnico, horarioDisponible } from './validadores-asincronos';
import { ValidationErrors } from '@angular/forms';

const referencia = (): Date => new Date(2026, 10, 3, 10, 0);

describe('Validadores síncronos', () => {
  it('documento de 8 dígitos', () => {
    expect(documentoValido(new FormControl('45781236'))).toBeNull();
    expect(documentoValido(new FormControl('4578123'))).toEqual({ documento: true });
    expect(documentoValido(new FormControl('4578123a'))).toEqual({ documento: true });
    expect(documentoValido(new FormControl(''))).toBeNull();
  });

  it('celular peruano de 9 dígitos que empieza con 9', () => {
    expect(telefonoValido(new FormControl('987654321'))).toBeNull();
    expect(telefonoValido(new FormControl('987 654 321'))).toBeNull();
    expect(telefonoValido(new FormControl('187654321'))).toEqual({ telefono: true });
    expect(telefonoValido(new FormControl('98765432'))).toEqual({ telefono: true });
  });

  it('fecha válida', () => {
    expect(fechaValida(new FormControl('2026-11-03'))).toBeNull();
    expect(fechaValida(new FormControl('2026-13-03'))).toEqual({ fecha: true });
  });

  it('fecha no pasada', () => {
    const validador = fechaNoPasada(referencia);
    expect(validador(new FormControl('2026-11-03'))).toBeNull();
    expect(validador(new FormControl('2026-11-10'))).toBeNull();
    expect(validador(new FormControl('2026-11-02'))).toEqual({ fechaPasada: true });
  });

  it('fecha no futura', () => {
    const validador = fechaNoFutura(referencia);
    expect(validador(new FormControl('2026-11-03'))).toBeNull();
    expect(validador(new FormControl('2026-11-04'))).toEqual({ fechaFutura: true });
  });

  it('confirmación de contraseña a nivel de grupo', () => {
    const grupo = new FormGroup(
      { clave: new FormControl('Clave2026'), confirmacion: new FormControl('Clave2025') },
      { validators: clavesCoinciden('clave', 'confirmacion') },
    );
    expect(grupo.hasError('clavesDistintas')).toBe(true);
    grupo.controls.confirmacion.setValue('Clave2026');
    expect(grupo.valid).toBe(true);
  });

  it('lista sin elementos repetidos en un FormArray', () => {
    const lista = new FormArray([new FormControl('Penicilina'), new FormControl('penicilina ')], sinDuplicados);
    expect(lista.hasError('duplicados')).toBe(true);
    lista.at(1).setValue('Pollo');
    expect(lista.valid).toBe(true);
  });

  it('requerido solo cuando se cumple la condición', () => {
    let activo = false;
    const control = new FormControl('', requeridoSi(() => activo));
    expect(control.valid).toBe(true);
    activo = true;
    control.updateValueAndValidity();
    expect(control.hasError('required')).toBe(true);
  });

  it('traduce los errores a mensajes', () => {
    expect(mensajesDe({ documento: true })).toEqual(['El DNI debe tener 8 dígitos.']);
    expect(mensajesDe({ minlength: { requiredLength: 8, actualLength: 3 } })).toEqual([
      'Debe tener al menos 8 caracteres.',
    ]);
    expect(mensajesDe({ required: true }, { required: 'Elige un horario.' })).toEqual(['Elige un horario.']);
  });
});

describe('Validadores asíncronos', () => {
  const resolver = (resultado: Observable<ValidationErrors | null> | Promise<ValidationErrors | null>) =>
    resultado instanceof Promise ? resultado : firstValueFrom(resultado);

  it('correo único', async () => {
    const validador = correoUnico({ correoDisponible: (correo) => of(correo !== 'admin@veterio.pe') });
    expect(await resolver(validador(new FormControl('admin@veterio.pe')))).toEqual({ correoRegistrado: true });
    expect(await resolver(validador(new FormControl('nuevo@veterio.pe')))).toBeNull();
  });

  it('DNI único solo cuando el formato es correcto', async () => {
    const validador = documentoUnico({ documentoDisponible: () => of(false) });
    expect(await resolver(validador(new FormControl('45781236')))).toEqual({ documentoRegistrado: true });
    expect(await resolver(validador(new FormControl('123')))).toBeNull();
  });

  it('evita choques de horario a nivel de grupo', async () => {
    const validador = horarioDisponible({ verificarHorario: (clave) => of(clave.hora !== '10:30') });
    const grupo = new FormGroup({
      fecha: new FormControl('2026-11-05'),
      hora: new FormControl('10:30'),
      veterinarioId: new FormControl('vet-1'),
    });
    expect(await resolver(validador(grupo))).toEqual({ horarioOcupado: true });
    grupo.controls.hora.setValue('11:00');
    expect(await resolver(validador(grupo))).toBeNull();
  });
});
