import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { PROVEEDORES_MEMORIA, sinRetardos } from '../testing/proveedores-prueba';
import { AuthModule } from './auth/auth-module';
import { Login } from './auth/paginas/login/login';
import { CitasModule } from './citas/citas-module';
import { FormularioCita } from './citas/paginas/formulario-cita/formulario-cita';
import { Citas } from './citas/servicios/citas';
import { Confirmacion } from './core/servicios/confirmacion';
import { Sesion } from './core/servicios/sesion';
import { HistorialModule } from './historial/historial-module';
import { HistorialMascota } from './historial/paginas/historial-mascota/historial-mascota';
import { MascotasModule } from './mascotas/mascotas-module';
import { FormularioMascota } from './mascotas/paginas/formulario-mascota/formulario-mascota';
import { Duenos } from './mascotas/servicios/duenos';
import { Mascotas } from './mascotas/servicios/mascotas';
import { TipoEspecie } from './shared/modelos/especie';
import { aISO } from './shared/utilidades/fechas';

function rutaCon(parametros: Record<string, string> = {}, consulta: Record<string, string> = {}): object {
  return {
    snapshot: { paramMap: convertToParamMap(parametros), queryParamMap: convertToParamMap(consulta) },
    paramMap: { subscribe: (fn: (mapa: ReturnType<typeof convertToParamMap>) => void) => {
      fn(convertToParamMap(parametros));
      return { unsubscribe: () => undefined };
    } },
  };
}

function iniciarComo(correo: string): void {
  const sesion = TestBed.inject(Sesion);
  sesion.abrir({
    id: 'usr-prueba',
    nombre: 'Usuario de prueba',
    correo,
    rol: correo.startsWith('admin') ? 'administrador' : 'recepcion',
    activo: true,
    veterinarioId: null,
    creadoEn: '2026-01-01',
  });
}

describe('Login', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AuthModule], providers: [...PROVEEDORES_MEMORIA, provideRouter([])] });
  });

  it('valida el formulario antes de intentar ingresar', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.ingresar();
    fixture.detectChanges();
    expect(fixture.componentInstance.formulario.touched).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Este campo es obligatorio.');
  });

  it('muestra un error con credenciales incorrectas', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.formulario.setValue({ correo: 'admin@veterio.pe', clave: 'Incorrecta1' });
    fixture.componentInstance.ingresar();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.alert-danger')?.textContent).toContain(
      'Correo o contraseña incorrectos.',
    );
  });

  it('abre la sesión y navega al inicio', () => {
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.formulario.setValue({ correo: 'recepcion@veterio.pe', clave: 'Recepcion2026' });
    fixture.componentInstance.ingresar();
    expect(TestBed.inject(Sesion).rol).toBe('recepcion');
    expect(navegar).toHaveBeenCalledWith(['/inicio']);
  });
});

describe('FormularioMascota', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MascotasModule],
      providers: [...PROVEEDORES_MEMORIA, provideRouter([]), { provide: ActivatedRoute, useValue: rutaCon() }],
    });
    iniciarComo('recepcion@veterio.pe');
    sinRetardos(TestBed.inject(Duenos));
  });

  it('usa FormArray para las alergias y detecta repetidas', () => {
    const fixture = TestBed.createComponent(FormularioMascota);
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    componente.agregarAlergia('Penicilina');
    componente.agregarAlergia('penicilina');
    expect(componente.alergias.length).toBe(2);
    expect(componente.alergias.hasError('duplicados')).toBe(true);
    componente.quitarAlergia(1);
    expect(componente.alergias.valid).toBe(true);
  });

  it('cambia la validación según el modo del dueño', () => {
    const fixture = TestBed.createComponent(FormularioMascota);
    fixture.detectChanges();
    const { dueno, duenoId, modoDueno } = fixture.componentInstance.formulario.controls;
    expect(dueno.disabled).toBe(true);
    expect(duenoId.hasError('required')).toBe(true);
    modoDueno.setValue('nuevo');
    expect(dueno.enabled).toBe(true);
    expect(duenoId.valid).toBe(true);
    dueno.controls.documento.setValue('1234');
    expect(dueno.controls.documento.hasError('documento')).toBe(true);
  });

  it('registra la mascota con un dueño nuevo', async () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(FormularioMascota);
    fixture.detectChanges();
    const formulario = fixture.componentInstance.formulario;
    formulario.controls.mascota.patchValue({
      nombre: 'Canela',
      especie: TipoEspecie.Perro,
      raza: 'Beagle',
      sexo: 'hembra',
      fechaNacimiento: '2024-04-10',
      peso: 11.2,
    });
    formulario.controls.modoDueno.setValue('nuevo');
    formulario.controls.dueno.setValue({
      documento: '70123456',
      nombres: 'Martín',
      apellidos: 'Salas Huerta',
      telefono: '951357246',
      correo: 'msalas@gmail.com',
      direccion: 'Av. Brasil 2010, Pueblo Libre',
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(formulario.valid).toBe(true);
    fixture.componentInstance.guardar();
    const registrada = TestBed.inject(Mascotas).lista.find((mascota) => mascota.nombre === 'Canela');
    expect(registrada).toBeDefined();
    expect(TestBed.inject(Duenos).obtenerDueno(registrada?.duenoId)?.documento).toBe('70123456');
  });

  it('pide confirmación al cancelar con cambios sin guardar', async () => {
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const confirmacion = TestBed.inject(Confirmacion);
    const fixture = TestBed.createComponent(FormularioMascota);
    fixture.detectChanges();
    fixture.componentInstance.formulario.controls.mascota.controls.nombre.setValue('Toby');
    fixture.componentInstance.formulario.markAsDirty();
    const cancelacion = fixture.componentInstance.cancelar();
    expect(confirmacion.abierta).toBe(true);
    confirmacion.responder(false);
    await cancelacion;
    expect(navegar).not.toHaveBeenCalled();
  });
});

describe('FormularioCita', () => {
  function crear(consulta: Record<string, string>) {
    TestBed.configureTestingModule({
      imports: [CitasModule],
      providers: [...PROVEEDORES_MEMORIA, provideRouter([]), { provide: ActivatedRoute, useValue: rutaCon({}, consulta) }],
    });
    iniciarComo('recepcion@veterio.pe');
    sinRetardos(TestBed.inject(Citas));
    const fixture = TestBed.createComponent(FormularioCita);
    fixture.detectChanges();
    return fixture;
  }

  function proximoMartes(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 14);
    while (fecha.getDay() !== 2) {
      fecha.setDate(fecha.getDate() + 1);
    }
    return aISO(fecha);
  }

  it('toma mascota, fecha y veterinario de la URL y lista horarios', () => {
    const fecha = proximoMartes();
    const fixture = crear({ mascota: 'mas-1', fecha, veterinario: 'vet-1' });
    const componente = fixture.componentInstance;
    expect(componente.formulario.controls.mascotaId.value).toBe('mas-1');
    expect(componente.seleccion?.mascota.nombre).toBe('Rocky');
    expect(componente.horarios.length).toBe(16);
  });

  it('detecta el choque de horario con el validador asíncrono de grupo', async () => {
    const fecha = proximoMartes();
    const fixture = crear({ mascota: 'mas-2', fecha, veterinario: 'vet-1' });
    TestBed.inject(Citas).agendar({ mascotaId: 'mas-3', veterinarioId: 'vet-1', fecha, hora: '10:00', motivo: 'control', notas: '' });
    const formulario = fixture.componentInstance.formulario;
    formulario.controls.hora.setValue('10:00');
    expect(formulario.pending).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(formulario.hasError('horarioOcupado')).toBe(true);
  });

  it('agenda la cita cuando todo es válido', async () => {
    const fecha = proximoMartes();
    const fixture = crear({ mascota: 'mas-2', fecha, veterinario: 'vet-2' });
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.componentInstance.elegirHora('16:30');
    await new Promise((resolve) => setTimeout(resolve, 5));
    fixture.componentInstance.guardar();
    expect(TestBed.inject(Citas).horarioOcupado({ fecha, hora: '16:30', veterinarioId: 'vet-2' })).toBe(true);
    expect(navegar).toHaveBeenCalledWith(['/citas'], { queryParams: { fecha } });
  });
});

describe('HistorialMascota', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HistorialModule],
      providers: [...PROVEEDORES_MEMORIA, provideRouter([]), { provide: ActivatedRoute, useValue: rutaCon({ mascotaId: 'mas-1' }) }],
    });
    iniciarComo('admin@veterio.pe');
  });

  it('muestra la línea de tiempo y filtra por tipo', () => {
    const fixture = TestBed.createComponent(HistorialMascota);
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    const elemento = fixture.nativeElement as HTMLElement;
    expect(componente.datos?.mascota.nombre).toBe('Rocky');
    expect(elemento.querySelectorAll('.evento').length).toBe(componente.atenciones.length);
    componente.filtrar('vacunacion');
    fixture.detectChanges();
    expect(elemento.querySelectorAll('.evento').length).toBe(1);
  });

  it('abre el detalle de una atención en un modal', () => {
    const fixture = TestBed.createComponent(HistorialMascota);
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;
    (elemento.querySelector('.evento button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(elemento.querySelector('.modal')).not.toBeNull();
    fixture.componentInstance.cerrarDetalle();
    fixture.detectChanges();
    expect(elemento.querySelector('.modal')).toBeNull();
  });
});
