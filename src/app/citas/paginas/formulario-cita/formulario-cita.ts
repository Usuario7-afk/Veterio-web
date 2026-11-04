import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, merge, startWith } from 'rxjs';
import { Confirmacion } from '../../../core/servicios/confirmacion';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { Veterinarios } from '../../../core/servicios/veterinarios';
import { Mascotas } from '../../../mascotas/servicios/mascotas';
import { FormularioBase } from '../../../shared/formularios/formulario-base';
import { HorarioDia, NuevaCita } from '../../../shared/modelos/cita';
import { Dueno } from '../../../shared/modelos/dueno';
import { MascotaConDueno } from '../../../shared/modelos/mascota';
import { ETIQUETAS_SERVICIO, TipoServicio } from '../../../shared/modelos/tipos';
import { Veterinario } from '../../../shared/modelos/veterinario';
import { normalizarTexto } from '../../../shared/utilidades/colecciones';
import { NOMBRES_DIAS, aHora12, desdeISO, esFechaISO, hoyISO } from '../../../shared/utilidades/fechas';
import { fechaNoPasada, fechaValida } from '../../../shared/validadores/validadores';
import { horarioDisponible } from '../../../shared/validadores/validadores-asincronos';
import { Citas } from '../../servicios/citas';

interface ControlesCita {
  mascotaId: FormControl<string>;
  motivo: FormControl<TipoServicio>;
  veterinarioId: FormControl<string>;
  fecha: FormControl<string>;
  hora: FormControl<string>;
  notas: FormControl<string>;
}

@Component({
  selector: 'app-formulario-cita',
  standalone: false,
  templateUrl: './formulario-cita.html',
  styleUrls: ['./formulario-cita.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FormularioCita extends FormularioBase<FormGroup<ControlesCita>> implements OnInit, OnDestroy {
  public readonly titulo = 'Nueva cita';
  public readonly formulario: FormGroup<ControlesCita>;
  public readonly motivos = Object.entries(ETIQUETAS_SERVICIO) as [TipoServicio, string][];
  public readonly hoy = hoyISO();
  public readonly filtroMascota = new FormControl('', { nonNullable: true });
  public veterinarios: readonly Veterinario[] = [];
  public mascotasVisibles: MascotaConDueno[] = [];
  public seleccion: MascotaConDueno | undefined;
  public horarios: HorarioDia[] = [];
  public mensajeHorario = 'Elige la fecha y el veterinario para ver los horarios.';

  private readonly suscripciones = new Subscription();

  constructor(
    router: Router,
    confirmacion: Confirmacion,
    notificaciones: Notificaciones,
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private citas: Citas,
    private mascotas: Mascotas,
    private servicioVeterinarios: Veterinarios,
  ) {
    super(router, confirmacion, notificaciones);
    this.formulario = this.fb.nonNullable.group(
      {
        mascotaId: ['', Validators.required],
        motivo: this.fb.nonNullable.control<TipoServicio>('consulta', Validators.required),
        veterinarioId: ['', Validators.required],
        fecha: [this.hoy, [Validators.required, fechaValida, fechaNoPasada()]],
        hora: ['', Validators.required],
        notas: ['', Validators.maxLength(250)],
      },
      { asyncValidators: [horarioDisponible(this.citas)] },
    );
  }

  public get dueno(): Dueno | undefined {
    return this.seleccion?.dueno;
  }

  public ngOnInit(): void {
    this.veterinarios = this.servicioVeterinarios.todos;
    this.aplicarParametros();
    const { fecha, veterinarioId, mascotaId } = this.formulario.controls;
    this.suscripciones.add(
      merge(fecha.valueChanges, veterinarioId.valueChanges)
        .pipe(startWith(null))
        .subscribe(() => this.actualizarHorarios()),
    );
    this.suscripciones.add(
      mascotaId.valueChanges
        .pipe(startWith(mascotaId.value))
        .subscribe((id) => (this.seleccion = id ? this.mascotas.obtenerConDueno(id) : undefined)),
    );
    this.suscripciones.add(
      this.filtroMascota.valueChanges.pipe(startWith('')).subscribe((texto) => this.filtrarMascotas(texto)),
    );
  }

  public ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  public elegirHora(hora: string): void {
    const control = this.formulario.controls.hora;
    control.setValue(hora);
    control.markAsDirty();
    control.markAsTouched();
  }

  protected rutaSalida(): readonly unknown[] {
    return ['/citas'];
  }

  protected override salir(): void {
    const fecha = this.formulario.controls.fecha.value;
    void this.router.navigate([...this.rutaSalida()], {
      queryParams: esFechaISO(fecha) ? { fecha } : {},
    });
  }

  protected persistir(): boolean {
    const datos: NuevaCita = this.formulario.getRawValue();
    const resultado = this.citas.agendar(datos);
    if (!resultado.ok) {
      this.notificaciones.error(resultado.error);
      this.actualizarHorarios();
      return false;
    }
    const nombre = this.mascotas.nombreDe(resultado.valor.mascotaId);
    this.notificaciones.exito(`Cita de ${nombre} agendada a las ${aHora12(resultado.valor.hora)}.`);
    return true;
  }

  private aplicarParametros(): void {
    const parametros = this.ruta.snapshot.queryParamMap;
    const fecha = parametros.get('fecha');
    const mascota = parametros.get('mascota');
    const veterinario = parametros.get('veterinario');
    if (fecha && esFechaISO(fecha) && fecha >= this.hoy) {
      this.formulario.controls.fecha.setValue(fecha);
    }
    if (mascota && this.mascotas.obtener(mascota)) {
      this.formulario.controls.mascotaId.setValue(mascota);
    }
    if (veterinario && this.servicioVeterinarios.obtenerVeterinario(veterinario)) {
      this.formulario.controls.veterinarioId.setValue(veterinario);
    }
  }

  private filtrarMascotas(texto: string): void {
    const buscado = normalizarTexto(texto);
    const todas = this.mascotas.filtrar({ texto: '', especie: 'todas' });
    this.mascotasVisibles = buscado
      ? todas.filter(({ mascota, dueno }) =>
          normalizarTexto(`${mascota.nombre} ${dueno?.nombreCompleto ?? ''} ${dueno?.documento ?? ''}`).includes(buscado),
        )
      : todas;
  }

  private actualizarHorarios(): void {
    const { fecha, veterinarioId, hora } = this.formulario.controls;
    const veterinario = this.servicioVeterinarios.obtenerVeterinario(veterinarioId.value);
    if (!veterinario || !esFechaISO(fecha.value) || fecha.invalid) {
      this.horarios = [];
      this.mensajeHorario = 'Elige una fecha válida y el veterinario para ver los horarios.';
    } else if (!veterinario.atiendeEl(desdeISO(fecha.value))) {
      this.horarios = [];
      this.mensajeHorario = `${veterinario.nombreCorto} no atiende los ${NOMBRES_DIAS[desdeISO(fecha.value).getDay()]}.`;
    } else {
      this.horarios = this.citas.horariosDelDia(fecha.value, veterinario.id);
    }
    const sigueLibre = this.horarios.some((horario) => horario.hora === hora.value && horario.libre);
    if (hora.value && !sigueLibre) {
      hora.setValue('');
    }
  }
}
