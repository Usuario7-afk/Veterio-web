import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PROVEEDORES_MEMORIA } from '../../../testing/proveedores-prueba';
import { CitasModule } from '../citas-module';
import { CalendarioMensual } from './calendario-mensual/calendario-mensual';
import { SelectorHorario } from './selector-horario/selector-horario';

describe('Componentes de citas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CitasModule],
      providers: [...PROVEEDORES_MEMORIA, provideRouter([])],
    });
  });

  describe('CalendarioMensual', () => {
    let fixture: ComponentFixture<CalendarioMensual>;
    let elemento: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarioMensual);
      fixture.componentRef.setInput('anio', 2026);
      fixture.componentRef.setInput('mes', 10);
      fixture.componentRef.setInput('hoy', '2026-11-03');
      fixture.componentRef.setInput('seleccionada', '2026-11-05');
      fixture.componentRef.setInput('conteos', { '2026-11-03': 6, '2026-11-05': 1 });
      fixture.detectChanges();
      elemento = fixture.nativeElement as HTMLElement;
    });

    it('muestra el mes con 42 días y su título', () => {
      expect(elemento.querySelectorAll('button.dia').length).toBe(42);
      expect(elemento.querySelector('h2')?.textContent).toContain('Noviembre 2026');
    });

    it('marca hoy, el día seleccionado y la cantidad de citas', () => {
      const hoy = elemento.querySelector('button.dia.hoy');
      const seleccionado = elemento.querySelector('button.dia.seleccionado');
      expect(hoy?.textContent).toContain('3');
      expect(hoy?.textContent).toContain('6 citas');
      expect(seleccionado?.getAttribute('aria-label')).toBe('5 de noviembre, 1 cita');
    });

    it('emite la fecha al hacer clic y el cambio de mes', () => {
      const fechas: string[] = [];
      const cambios: number[] = [];
      fixture.componentInstance.seleccionar.subscribe((fecha) => fechas.push(fecha));
      fixture.componentInstance.cambiarMes.subscribe((delta) => cambios.push(delta));
      (elemento.querySelectorAll('button.dia')[10] as HTMLButtonElement).click();
      (elemento.querySelector('[aria-label="Mes siguiente"]') as HTMLButtonElement).click();
      expect(fechas).toEqual(['2026-11-05']);
      expect(cambios).toEqual([1]);
    });
  });

  describe('SelectorHorario', () => {
    it('deshabilita horarios ocupados y emite el elegido', () => {
      const fixture = TestBed.createComponent(SelectorHorario);
      fixture.componentRef.setInput('horarios', [
        { hora: '09:00', libre: true },
        { hora: '09:30', libre: false },
      ]);
      fixture.componentRef.setInput('seleccionada', '09:00');
      fixture.detectChanges();
      const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
      expect(botones[0].classList.contains('btn-primary')).toBe(true);
      expect(botones[1].disabled).toBe(true);
      expect(botones[0].textContent?.trim()).toBe('9:00 a. m.');
      const elegidas: string[] = [];
      fixture.componentInstance.elegir.subscribe((hora) => elegidas.push(hora));
      botones[0].click();
      expect(elegidas).toEqual(['09:00']);
    });

    it('muestra el mensaje cuando no hay horarios', () => {
      const fixture = TestBed.createComponent(SelectorHorario);
      fixture.componentRef.setInput('horarios', []);
      fixture.componentRef.setInput('mensajeVacio', 'La Dra. Gutiérrez no atiende los domingos.');
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('no atiende los domingos');
    });
  });
});
