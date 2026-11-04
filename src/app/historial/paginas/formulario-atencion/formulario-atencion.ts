import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Confirmacion } from '../../../core/servicios/confirmacion';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { Sesion } from '../../../core/servicios/sesion';
import { Veterinarios } from '../../../core/servicios/veterinarios';
import { Citas } from '../../../citas/servicios/citas';
import { Mascotas } from '../../../mascotas/servicios/mascotas';
import { FormularioBase } from '../../../shared/formularios/formulario-base';
import { Medicamento, NuevaAtencion } from '../../../shared/modelos/atencion';
import { Cita } from '../../../shared/modelos/cita';
import { MascotaConDueno } from '../../../shared/modelos/mascota';
import { ETIQUETAS_SERVICIO, TipoServicio } from '../../../shared/modelos/tipos';
import { Veterinario } from '../../../shared/modelos/veterinario';
import { hoyISO, sumarDias } from '../../../shared/utilidades/fechas';
import { fechaNoFutura, fechaNoPasada, fechaValida, requeridoSi } from '../../../shared/validadores/validadores';
import { Atenciones } from '../../servicios/atenciones';

type ControlesMedicamento = { [K in keyof Medicamento]: FormControl<Medicamento[K]> };

interface ControlesAtencion {
  fecha: FormControl<string>;
  tipo: FormControl<TipoServicio>;
  veterinarioId: FormControl<string>;
  motivo: FormControl<string>;
  diagnostico: FormControl<string>;
  tratamiento: FormControl<string>;
  peso: FormControl<number | null>;
  temperatura: FormControl<number | null>;
  costo: FormControl<number | null>;
  medicamentos: FormArray<FormGroup<ControlesMedicamento>>;
  programarControl: FormControl<boolean>;
  proximoControl: FormControl<string>;
}

@Component({
  selector: 'app-formulario-atencion',
  standalone: false,
  templateUrl: './formulario-atencion.html',
  styleUrls: ['./formulario-atencion.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FormularioAtencion extends FormularioBase<FormGroup<ControlesAtencion>> implements OnInit, OnDestroy {
  public readonly titulo = 'Registrar atención';
  public readonly formulario: FormGroup<ControlesAtencion>;
  public readonly tipos = Object.entries(ETIQUETAS_SERVICIO) as [TipoServicio, string][];
  public readonly hoy = hoyISO();
  public veterinarios: readonly Veterinario[] = [];
  public datos: MascotaConDueno | undefined;
  public cita: Cita | undefined;

  private mascotaId = '';
  private suscripcion: Subscription | null = null;

  constructor(
    router: Router,
    confirmacion: Confirmacion,
    notificaciones: Notificaciones,
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private atenciones: Atenciones,
    private mascotas: Mascotas,
    private citas: Citas,
    private servicioVeterinarios: Veterinarios,
    private sesion: Sesion,
  ) {
    super(router, confirmacion, notificaciones);
    this.formulario = this.fb.nonNullable.group({
      fecha: [this.hoy, [Validators.required, fechaValida, fechaNoFutura()]],
      tipo: this.fb.nonNullable.control<TipoServicio>('consulta', Validators.required),
      veterinarioId: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(120)]],
      diagnostico: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      tratamiento: ['', [Validators.required, Validators.maxLength(500)]],
      peso: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01), Validators.max(120)]),
      temperatura: this.fb.control<number | null>(null, [Validators.required, Validators.min(34), Validators.max(44)]),
      costo: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      medicamentos: this.fb.array<FormGroup<ControlesMedicamento>>([]),
      programarControl: [false],
      proximoControl: [
        '',
        [requeridoSi(() => this.formulario?.controls.programarControl.value === true), fechaValida, fechaNoPasada()],
      ],
    });
  }

  public get medicamentos(): FormArray<FormGroup<ControlesMedicamento>> {
    return this.formulario.controls.medicamentos;
  }

  public ngOnInit(): void {
    this.veterinarios = this.servicioVeterinarios.todos;
    this.mascotaId = this.ruta.snapshot.paramMap.get('mascotaId') ?? '';
    this.datos = this.mascotas.obtenerConDueno(this.mascotaId);
    if (!this.datos) {
      this.notificaciones.error('La mascota no existe.');
      void this.router.navigate(['/historial']);
      return;
    }
    const usuario = this.sesion.usuario;
    this.formulario.patchValue({
      peso: this.datos.mascota.peso,
      veterinarioId: usuario?.rol === 'veterinario' ? (usuario.veterinarioId ?? '') : '',
    });
    const citaId = this.ruta.snapshot.queryParamMap.get('cita');
    this.cita = citaId ? this.citas.obtener(citaId) : undefined;
    if (this.cita && this.cita.mascotaId === this.mascotaId) {
      this.formulario.patchValue({
        tipo: this.cita.motivo,
        veterinarioId: this.cita.veterinarioId,
        motivo: this.cita.notas || ETIQUETAS_SERVICIO[this.cita.motivo],
      });
    } else {
      this.cita = undefined;
    }
    this.suscripcion = this.formulario.controls.programarControl.valueChanges.subscribe((programar) => {
      const control = this.formulario.controls.proximoControl;
      if (programar && !control.value) {
        control.setValue(sumarDias(this.hoy, 15));
      }
      control.updateValueAndValidity();
    });
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  public agregarMedicamento(): void {
    this.medicamentos.push(
      this.fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.maxLength(60)]],
        dosis: ['', [Validators.required, Validators.maxLength(30)]],
        frecuencia: ['Cada 12 horas', [Validators.required, Validators.maxLength(40)]],
        dias: [5, [Validators.required, Validators.min(1), Validators.max(90)]],
      }),
    );
    this.medicamentos.markAsDirty();
  }

  public quitarMedicamento(indice: number): void {
    this.medicamentos.removeAt(indice);
    this.medicamentos.markAsDirty();
  }

  protected rutaSalida(): readonly unknown[] {
    return ['/historial', this.mascotaId];
  }

  protected persistir(): boolean {
    const valores = this.formulario.getRawValue();
    const datos: NuevaAtencion = {
      mascotaId: this.mascotaId,
      citaId: this.cita?.id ?? null,
      fecha: valores.fecha,
      tipo: valores.tipo,
      veterinarioId: valores.veterinarioId,
      motivo: valores.motivo.trim(),
      diagnostico: valores.diagnostico.trim(),
      tratamiento: valores.tratamiento.trim(),
      peso: Number(valores.peso ?? 0),
      temperatura: Number(valores.temperatura ?? 0),
      costo: Number(valores.costo ?? 0),
      medicamentos: valores.medicamentos,
      proximoControl: valores.programarControl ? valores.proximoControl : null,
    };
    const resultado = this.atenciones.registrar(datos);
    if (!resultado.ok) {
      this.notificaciones.error(resultado.error);
      return false;
    }
    this.notificaciones.exito('Atención registrada en el historial.');
    return true;
  }
}
