import { ValidationErrors } from '@angular/forms';

type GeneradorMensaje = (detalle: unknown) => string;

function numeroDe(detalle: unknown, clave: string): number | null {
  if (typeof detalle === 'object' && detalle !== null && clave in detalle) {
    const valor: unknown = Reflect.get(detalle, clave);
    return typeof valor === 'number' ? valor : null;
  }
  return null;
}

export const MENSAJES_ERROR: Readonly<Record<string, GeneradorMensaje>> = {
  required: () => 'Este campo es obligatorio.',
  email: () => 'Ingresa un correo válido.',
  minlength: (d) => `Debe tener al menos ${numeroDe(d, 'requiredLength') ?? ''} caracteres.`,
  maxlength: (d) => `No debe pasar de ${numeroDe(d, 'requiredLength') ?? ''} caracteres.`,
  min: (d) => `El valor mínimo es ${numeroDe(d, 'min') ?? ''}.`,
  max: (d) => `El valor máximo es ${numeroDe(d, 'max') ?? ''}.`,
  documento: () => 'El DNI debe tener 8 dígitos.',
  telefono: () => 'El celular debe tener 9 dígitos y empezar con 9.',
  fecha: () => 'La fecha no es válida.',
  fechaPasada: () => 'La fecha no puede ser anterior a hoy.',
  fechaFutura: () => 'La fecha no puede ser posterior a hoy.',
  clavesDistintas: () => 'Las contraseñas no coinciden.',
  duplicados: () => 'Hay elementos repetidos.',
  correoRegistrado: () => 'El correo ya está registrado.',
  documentoRegistrado: () => 'Ya existe un dueño con ese DNI.',
  horarioOcupado: () => 'Ese horario ya está ocupado para el veterinario.',
};

export function mensajesDe(
  errores: ValidationErrors | null,
  personalizados: Readonly<Record<string, string>> = {},
): string[] {
  if (!errores) {
    return [];
  }
  return Object.keys(errores).map((clave) => {
    const propio = personalizados[clave];
    if (propio) {
      return propio;
    }
    const generador = MENSAJES_ERROR[clave];
    return generador ? generador(errores[clave]) : 'El valor no es válido.';
  });
}
