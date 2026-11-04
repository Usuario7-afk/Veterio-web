import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Confirmacion } from '../../../core/servicios/confirmacion';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { Sesion } from '../../../core/servicios/sesion';
import { Veterinarios } from '../../../core/servicios/veterinarios';
import { FormularioBase } from '../../../shared/formularios/formulario-base';
import { ETIQUETAS_ROL, Rol } from '../../../shared/modelos/tipos';
import { Usuario } from '../../../shared/modelos/usuario';
import { Veterinario } from '../../../shared/modelos/veterinario';
import { correoUnico } from '../../../shared/validadores/validadores-asincronos';
import { clavesCoinciden, requeridoSi } from '../../../shared/validadores/validadores';
import { LONGITUD_MINIMA_CLAVE, Usuarios } from '../../servicios/usuarios';

interface ControlesClaves {
  clave: FormControl<string>;
  confirmacion: FormControl<string>;
}

interface ControlesUsuario {
  nombre: FormControl<string>;
  correo: FormControl<string>;
  rol: FormControl<Rol | ''>;
  veterinarioId: FormControl<string>;
  activo: FormControl<boolean>;
  claves: FormGroup<ControlesClaves>;
}

@Component({
  selector: 'app-formulario-usuario',
  standalone: false,
  templateUrl: './formulario-usuario.html',
  styleUrls: ['./formulario-usuario.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FormularioUsuario extends FormularioBase<FormGroup<ControlesUsuario>> implements OnInit, OnDestroy {
  public readonly formulario: FormGroup<ControlesUsuario>;
  public readonly roles = Object.entries(ETIQUETAS_ROL) as [Rol, string][];
  public readonly longitudMinima = LONGITUD_MINIMA_CLAVE;
  public veterinariosDisponibles: readonly Veterinario[] = [];
  public usuarioEditado: Usuario | null = null;
  public esCuentaPropia = false;

  private suscripcion: Subscription | null = null;

  constructor(
    router: Router,
    confirmacion: Confirmacion,
    notificaciones: Notificaciones,
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private usuarios: Usuarios,
    private veterinarios: Veterinarios,
    private sesion: Sesion,
  ) {
    super(router, confirmacion, notificaciones);
    this.formulario = this.fb.nonNullable.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      correo: this.fb.nonNullable.control('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [correoUnico(this.usuarios, () => this.usuarioEditado?.id ?? null)],
        updateOn: 'blur',
      }),
      rol: this.fb.nonNullable.control<Rol | ''>('', Validators.required),
      veterinarioId: ['', requeridoSi(() => this.formulario?.controls.rol.value === 'veterinario')],
      activo: [true],
      claves: this.fb.nonNullable.group(
        {
          clave: ['', [requeridoSi(() => this.usuarioEditado === null), Validators.minLength(LONGITUD_MINIMA_CLAVE)]],
          confirmacion: [''],
        },
        { validators: clavesCoinciden('clave', 'confirmacion') },
      ),
    });
  }

  public get titulo(): string {
    return this.usuarioEditado ? 'Editar usuario' : 'Nuevo usuario';
  }

  public get esVeterinario(): boolean {
    return this.formulario.controls.rol.value === 'veterinario';
  }

  public ngOnInit(): void {
    this.veterinariosDisponibles = this.veterinarios.todos;
    const id = this.ruta.snapshot.paramMap.get('id');
    if (id) {
      this.cargar(id);
    }
    this.suscripcion = this.formulario.controls.rol.valueChanges.subscribe(() =>
      this.formulario.controls.veterinarioId.updateValueAndValidity(),
    );
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  protected rutaSalida(): readonly unknown[] {
    return ['/cuenta/usuarios'];
  }

  protected persistir(): boolean {
    const valores = this.formulario.getRawValue();
    if (valores.rol === '') {
      return false;
    }
    const datos = {
      nombre: valores.nombre,
      correo: valores.correo,
      rol: valores.rol,
      activo: valores.activo,
      veterinarioId: valores.rol === 'veterinario' ? valores.veterinarioId : null,
      clave: valores.claves.clave,
    };
    const resultado = this.usuarioEditado
      ? this.usuarios.actualizar(this.usuarioEditado.id, datos)
      : this.usuarios.crear(datos);
    if (!resultado.ok) {
      this.notificaciones.error(resultado.error);
      return false;
    }
    if (resultado.valor.id === this.sesion.usuario?.id) {
      this.sesion.abrir(resultado.valor);
    }
    this.notificaciones.exito(this.usuarioEditado ? 'Usuario actualizado.' : 'Usuario creado.');
    return true;
  }

  private cargar(id: string): void {
    const usuario = this.usuarios.obtener(id);
    if (!usuario) {
      this.notificaciones.error('El usuario no existe.');
      this.salir();
      return;
    }
    this.usuarioEditado = usuario;
    this.esCuentaPropia = usuario.id === this.sesion.usuario?.id;
    this.formulario.patchValue({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      veterinarioId: usuario.veterinarioId ?? '',
      activo: usuario.activo,
    });
    if (this.esCuentaPropia) {
      this.formulario.controls.activo.disable();
      this.formulario.controls.rol.disable();
    }
    this.formulario.controls.claves.controls.clave.updateValueAndValidity();
  }
}
