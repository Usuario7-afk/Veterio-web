import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, startWith } from 'rxjs';
import { Confirmacion } from '../../../core/servicios/confirmacion';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { FormularioBase } from '../../../shared/formularios/formulario-base';
import { Dueno, NuevoDueno } from '../../../shared/modelos/dueno';
import { ESPECIES, Especie, LISTA_ESPECIES, TipoEspecie } from '../../../shared/modelos/especie';
import { Mascota, NuevaMascota } from '../../../shared/modelos/mascota';
import { Sexo } from '../../../shared/modelos/tipos';
import { normalizarTexto } from '../../../shared/utilidades/colecciones';
import { hoyISO } from '../../../shared/utilidades/fechas';
import {
  documentoValido,
  fechaNoFutura,
  fechaValida,
  requeridoSi,
  sinDuplicados,
  telefonoValido,
} from '../../../shared/validadores/validadores';
import { documentoUnico } from '../../../shared/validadores/validadores-asincronos';
import { ControlesDueno } from '../../componentes/datos-dueno/datos-dueno';
import { Duenos } from '../../servicios/duenos';
import { Mascotas } from '../../servicios/mascotas';

type ModoDueno = 'existente' | 'nuevo';

interface ControlesMascota {
  nombre: FormControl<string>;
  especie: FormControl<TipoEspecie>;
  raza: FormControl<string>;
  sexo: FormControl<Sexo>;
  fechaNacimiento: FormControl<string>;
  peso: FormControl<number | null>;
  color: FormControl<string>;
  alergias: FormArray<FormControl<string>>;
  observaciones: FormControl<string>;
}

interface ControlesFormulario {
  mascota: FormGroup<ControlesMascota>;
  modoDueno: FormControl<ModoDueno>;
  duenoId: FormControl<string>;
  dueno: FormGroup<ControlesDueno>;
}

@Component({
  selector: 'app-formulario-mascota',
  standalone: false,
  templateUrl: './formulario-mascota.html',
  styleUrls: ['./formulario-mascota.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FormularioMascota extends FormularioBase<FormGroup<ControlesFormulario>> implements OnInit, OnDestroy {
  public readonly formulario: FormGroup<ControlesFormulario>;
  public readonly especies: readonly Especie[] = LISTA_ESPECIES;
  public readonly hoy = hoyISO();
  public readonly filtroDueno = new FormControl('', { nonNullable: true });
  public mascotaEditada: Mascota | null = null;
  public duenosVisibles: readonly Dueno[] = [];
  public duenoSeleccionado: Dueno | undefined;

  private readonly suscripciones = new Subscription();

  constructor(
    router: Router,
    confirmacion: Confirmacion,
    notificaciones: Notificaciones,
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private mascotas: Mascotas,
    private duenos: Duenos,
  ) {
    super(router, confirmacion, notificaciones);
    const modoNuevo = (): boolean => this.formulario?.controls.modoDueno.value === 'nuevo';
    this.formulario = this.fb.group({
      mascota: this.fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.maxLength(30)]],
        especie: [TipoEspecie.Perro, Validators.required],
        raza: ['', [Validators.required, Validators.maxLength(40)]],
        sexo: this.fb.nonNullable.control<Sexo>('macho', Validators.required),
        fechaNacimiento: ['', [Validators.required, fechaValida, fechaNoFutura()]],
        peso: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01), Validators.max(120)]),
        color: ['', Validators.maxLength(30)],
        alergias: this.fb.nonNullable.array<FormControl<string>>([], sinDuplicados),
        observaciones: ['', Validators.maxLength(300)],
      }),
      modoDueno: this.fb.nonNullable.control<ModoDueno>('existente'),
      duenoId: this.fb.nonNullable.control('', requeridoSi(() => !modoNuevo())),
      dueno: this.fb.nonNullable.group({
        documento: this.fb.nonNullable.control('', {
          validators: [Validators.required, documentoValido],
          asyncValidators: [documentoUnico(this.duenos)],
        }),
        nombres: ['', [Validators.required, Validators.maxLength(40)]],
        apellidos: ['', [Validators.required, Validators.maxLength(60)]],
        telefono: ['', [Validators.required, telefonoValido]],
        correo: ['', Validators.email],
        direccion: ['', [Validators.required, Validators.maxLength(120)]],
      }),
    });
  }

  public get titulo(): string {
    return this.mascotaEditada ? `Editar a ${this.mascotaEditada.nombre}` : 'Registrar mascota';
  }

  public get datosMascota(): FormGroup<ControlesMascota> {
    return this.formulario.controls.mascota;
  }

  public get alergias(): FormArray<FormControl<string>> {
    return this.datosMascota.controls.alergias;
  }

  public get modoNuevo(): boolean {
    return this.formulario.controls.modoDueno.value === 'nuevo';
  }

  public get razasSugeridas(): readonly string[] {
    return ESPECIES[this.datosMascota.controls.especie.value].razas;
  }

  public ngOnInit(): void {
    const id = this.ruta.snapshot.paramMap.get('id');
    if (id) {
      this.cargar(id);
    }
    this.suscripciones.add(
      this.formulario.controls.modoDueno.valueChanges
        .pipe(startWith(this.formulario.controls.modoDueno.value))
        .subscribe((modo) => this.aplicarModo(modo)),
    );
    this.suscripciones.add(
      this.formulario.controls.duenoId.valueChanges
        .pipe(startWith(this.formulario.controls.duenoId.value))
        .subscribe((duenoId) => (this.duenoSeleccionado = this.duenos.obtenerDueno(duenoId))),
    );
    this.suscripciones.add(
      this.filtroDueno.valueChanges.pipe(startWith('')).subscribe((texto) => this.filtrarDuenos(texto)),
    );
  }

  public ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  public agregarAlergia(valor = ''): void {
    this.alergias.push(this.fb.nonNullable.control(valor, [Validators.required, Validators.maxLength(40)]));
    this.alergias.markAsDirty();
  }

  public quitarAlergia(indice: number): void {
    this.alergias.removeAt(indice);
    this.alergias.markAsDirty();
  }

  protected rutaSalida(): readonly unknown[] {
    return this.mascotaEditada ? ['/historial', this.mascotaEditada.id] : ['/mascotas'];
  }

  protected persistir(): boolean {
    const valores = this.formulario.getRawValue();
    let duenoId = valores.duenoId;
    if (valores.modoDueno === 'nuevo') {
      const datosDueno: NuevoDueno = { ...valores.dueno };
      duenoId = this.duenos.registrar(datosDueno).id;
    }
    const datos: NuevaMascota = {
      ...valores.mascota,
      peso: Number(valores.mascota.peso ?? 0),
      duenoId,
    };
    if (this.mascotaEditada) {
      this.mascotas.actualizar(this.mascotaEditada.id, datos);
      this.notificaciones.exito(`Se guardaron los cambios de ${datos.nombre}.`);
    } else {
      const mascota = this.mascotas.registrar(datos);
      this.notificaciones.exito(`${mascota.nombre} quedó registrada.`);
    }
    return true;
  }

  private aplicarModo(modo: ModoDueno): void {
    const { dueno, duenoId } = this.formulario.controls;
    if (modo === 'nuevo') {
      dueno.enable({ emitEvent: false });
    } else {
      dueno.disable({ emitEvent: false });
    }
    duenoId.updateValueAndValidity({ emitEvent: false });
  }

  private filtrarDuenos(texto: string): void {
    const buscado = normalizarTexto(texto);
    const todos = this.duenos.todos;
    this.duenosVisibles = buscado
      ? todos.filter((dueno) => normalizarTexto(`${dueno.nombreCompleto} ${dueno.documento}`).includes(buscado))
      : todos;
  }

  private cargar(id: string): void {
    const mascota = this.mascotas.obtener(id);
    if (!mascota) {
      this.notificaciones.error('La mascota no existe.');
      void this.router.navigate(['/mascotas']);
      return;
    }
    this.mascotaEditada = mascota;
    this.datosMascota.patchValue({
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      sexo: mascota.sexo,
      fechaNacimiento: mascota.fechaNacimiento,
      peso: mascota.peso,
      color: mascota.color,
      observaciones: mascota.observaciones,
    });
    for (const alergia of mascota.alergias) {
      this.alergias.push(this.fb.nonNullable.control(alergia, [Validators.required, Validators.maxLength(40)]));
    }
    this.formulario.patchValue({ modoDueno: 'existente', duenoId: mascota.duenoId });
    this.formulario.markAsPristine();
  }
}
