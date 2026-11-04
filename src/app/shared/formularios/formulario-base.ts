import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Confirmacion } from '../../core/servicios/confirmacion';
import { Notificaciones } from '../../core/servicios/notificaciones';

export abstract class FormularioBase<F extends FormGroup> {
  public guardando = false;

  protected constructor(
    protected readonly router: Router,
    protected readonly confirmacion: Confirmacion,
    protected readonly notificaciones: Notificaciones,
  ) {}

  public abstract readonly formulario: F;

  public abstract readonly titulo: string;

  protected abstract rutaSalida(): readonly unknown[];

  protected abstract persistir(): boolean;

  public control(ruta: string): AbstractControl | null {
    return this.formulario.get(ruta);
  }

  public invalido(ruta: string): boolean {
    const control = this.control(ruta);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  public guardar(): void {
    if (this.guardando) {
      return;
    }
    if (this.formulario.pending) {
      this.notificaciones.mostrar('Espera a que termine la verificación de los datos.', 'info');
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.notificaciones.mostrar('Revisa los campos marcados en rojo.', 'error');
      return;
    }
    this.guardando = true;
    const guardado = this.persistir();
    this.guardando = false;
    if (guardado) {
      this.formulario.markAsPristine();
      this.salir();
    }
  }

  public async cancelar(): Promise<void> {
    if (this.formulario.dirty) {
      const salir = await this.confirmacion.preguntar({
        titulo: 'Cambios sin guardar',
        mensaje: 'Hay cambios que no se han guardado. Si sales ahora se perderán.',
        textoConfirmar: 'Salir sin guardar',
        textoCancelar: 'Seguir editando',
        variante: 'danger',
      });
      if (!salir) {
        return;
      }
    }
    this.salir();
  }

  protected salir(): void {
    void this.router.navigate([...this.rutaSalida()]);
  }
}
