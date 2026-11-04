import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { PROVEEDORES_MEMORIA } from '../../../testing/proveedores-prueba';
import { Dueno } from '../modelos/dueno';
import { CitaDetallada } from '../modelos/cita';
import { SharedModule } from '../shared-module';
import { ErroresCampo } from './errores-campo/errores-campo';
import { EstadoVacio } from './estado-vacio/estado-vacio';
import { ModalConfirmacion } from './modal-confirmacion/modal-confirmacion';
import { TarjetaCita } from './tarjeta-cita/tarjeta-cita';
import { TarjetaPersona } from './tarjeta-persona/tarjeta-persona';

const cita: CitaDetallada = {
  id: 'cit-1',
  mascotaId: 'mas-1',
  veterinarioId: 'vet-1',
  fecha: '2026-11-03',
  hora: '11:00',
  motivo: 'vacunacion',
  estado: 'pendiente',
  notas: 'Refuerzo de séxtuple.',
  creadaEn: '2026-10-30',
  mascota: undefined,
  dueno: undefined,
  veterinario: undefined,
};

describe('Componentes compartidos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedModule], providers: [...PROVEEDORES_MEMORIA, provideRouter([])] });
  });

  it('ErroresCampo muestra mensajes solo cuando el campo fue tocado', () => {
    const fixture = TestBed.createComponent(ErroresCampo);
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.textContent?.trim()).toBe('');
    control.markAsTouched();
    fixture.detectChanges();
    expect(elemento.textContent).toContain('Este campo es obligatorio.');
  });

  it('EstadoVacio emite la acción', () => {
    const fixture = TestBed.createComponent(EstadoVacio);
    fixture.componentRef.setInput('titulo', 'Aún no hay mascotas');
    fixture.componentRef.setInput('textoAccion', 'Registrar mascota');
    fixture.detectChanges();
    let llamadas = 0;
    fixture.componentInstance.accion.subscribe(() => llamadas++);
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(llamadas).toBe(1);
  });

  it('ModalConfirmacion se muestra y responde', () => {
    const fixture = TestBed.createComponent(ModalConfirmacion);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mensaje', 'Hay cambios sin guardar.');
    fixture.componentRef.setInput('variante', 'danger');
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('.modal')).not.toBeNull();
    expect(elemento.querySelector('.btn-danger')).not.toBeNull();
    let confirmado = false;
    fixture.componentInstance.confirmar.subscribe(() => (confirmado = true));
    (elemento.querySelector('.btn-danger') as HTMLButtonElement).click();
    expect(confirmado).toBe(true);
  });

  it('TarjetaPersona usa la descripción de cada clase', () => {
    const fixture = TestBed.createComponent(TarjetaPersona);
    fixture.componentRef.setInput(
      'persona',
      new Dueno({
        id: 'due-9',
        nombres: 'Lucía',
        apellidos: 'Fernández Rojas',
        documento: '72318456',
        telefono: '956123478',
        correo: '',
        direccion: 'Calle Los Pinos 128, Miraflores',
      }),
    );
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Dueño');
    expect(texto).toContain('DNI 72318456');
    expect(texto).toContain('956 123 478');
  });

  it('TarjetaCita muestra acciones según la configuración', () => {
    const fixture = TestBed.createComponent(TarjetaCita);
    fixture.componentRef.setInput('cita', cita);
    fixture.componentRef.setInput('acciones', { confirmar: true, cancelar: false, atender: false });
    fixture.detectChanges();
    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.textContent).toContain('Vacunación');
    expect(elemento.textContent).toContain('Pendiente');
    expect(elemento.textContent).toContain('11:00 a. m.');
    const cambios: string[] = [];
    fixture.componentInstance.cambiarEstado.subscribe((cambio) => cambios.push(cambio.estado));
    const botones = Array.from(elemento.querySelectorAll('button'));
    expect(botones.map((boton) => boton.textContent?.trim())).toEqual(['Confirmar']);
    botones[0].click();
    expect(cambios).toEqual(['confirmada']);
  });
});
