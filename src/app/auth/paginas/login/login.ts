import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { Sesion } from '../../../core/servicios/sesion';
import { UsuarioSesion } from '../../../shared/modelos/usuario';
import { Autenticacion } from '../../servicios/autenticacion';
import { LONGITUD_MINIMA_CLAVE } from '../../servicios/usuarios';

interface ControlesLogin {
  correo: FormControl<string>;
  clave: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Login implements OnInit {
  public readonly formulario: FormGroup<ControlesLogin>;
  public error = '';
  public mostrarClave = false;
  public usuarioActual: UsuarioSesion | null = null;

  constructor(
    private fb: FormBuilder,
    private autenticacion: Autenticacion,
    private sesion: Sesion,
    private router: Router,
    private notificaciones: Notificaciones,
  ) {
    this.formulario = this.fb.nonNullable.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(LONGITUD_MINIMA_CLAVE)]],
    });
  }

  public ngOnInit(): void {
    this.usuarioActual = this.sesion.usuario;
  }

  public ingresar(): void {
    this.error = '';
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const resultado = this.autenticacion.iniciarSesion(this.formulario.getRawValue());
    if (!resultado.ok) {
      this.error = resultado.error;
      this.formulario.controls.clave.reset();
      return;
    }
    this.notificaciones.exito(`Sesión iniciada como ${resultado.valor.nombre}.`);
    void this.router.navigate(['/inicio']);
  }

  public alternarClave(): void {
    this.mostrarClave = !this.mostrarClave;
  }

  public cerrarSesionActual(): void {
    this.autenticacion.cerrarSesion();
    this.usuarioActual = null;
  }
}
