import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { PROVEEDORES_MEMORIA } from '../../../testing/proveedores-prueba';
import { Confirmacion } from '../../core/servicios/confirmacion';
import { Sesion } from '../../core/servicios/sesion';
import { Rol } from '../modelos/tipos';
import { UsuarioSesion } from '../modelos/usuario';
import { SharedModule } from '../shared-module';
import { CitaResaltable } from './resaltar-proxima';

const usuario = (rol: Rol): UsuarioSesion => ({
  id: 'usr-x',
  nombre: 'Prueba',
  correo: 'prueba@veterio.pe',
  rol,
  activo: true,
  veterinarioId: null,
  creadoEn: '2026-01-01',
});

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <button *tieneRol="['administrador', 'recepcion']; sino: bloqueado" id="accion">Registrar</button>
    <ng-template #bloqueado><span id="bloqueado">Sin permiso</span></ng-template>
    <div id="cita" [resaltarProxima]="cita" [referencia]="ahora" [minutosAviso]="60"></div>
    <input id="dni" [formControl]="dni" [soloNumeros]="8" />
    <input id="foco" autoenfoque />
    <button id="borrar" confirmarAccion="¿Eliminar?" (confirmado)="confirmados = confirmados + 1">Borrar</button>
  `,
})
class AnfitrionPrueba {
  public ahora = new Date(2026, 10, 3, 10, 0);
  public cita: CitaResaltable = { fecha: '2026-11-03', hora: '10:30', estado: 'pendiente' };
  public dni = new FormControl('', { nonNullable: true });
  public confirmados = 0;
}

@NgModule({ declarations: [AnfitrionPrueba], imports: [SharedModule] })
class ModuloPrueba {}

describe('Directivas personalizadas', () => {
  let fixture: ComponentFixture<AnfitrionPrueba>;
  let sesion: Sesion;
  let elemento: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModuloPrueba],
      providers: PROVEEDORES_MEMORIA,
    });
    sesion = TestBed.inject(Sesion);
    fixture = TestBed.createComponent(AnfitrionPrueba);
    elemento = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('tieneRol muestra la plantilla alterna sin sesión', () => {
    expect(elemento.querySelector('#accion')).toBeNull();
    expect(elemento.querySelector('#bloqueado')).not.toBeNull();
  });

  it('tieneRol reacciona a los cambios de sesión', () => {
    sesion.abrir(usuario('recepcion'));
    fixture.detectChanges();
    expect(elemento.querySelector('#accion')).not.toBeNull();
    sesion.abrir(usuario('veterinario'));
    fixture.detectChanges();
    expect(elemento.querySelector('#accion')).toBeNull();
  });

  it('resaltarProxima marca citas que empiezan pronto', () => {
    const cita = elemento.querySelector('#cita') as HTMLElement;
    expect(cita.classList.contains('cita-proxima')).toBe(true);
    expect(cita.getAttribute('title')).toBe('Empieza en 30 min');
    fixture.componentInstance.cita = { fecha: '2026-11-03', hora: '10:30', estado: 'cancelada' };
    fixture.detectChanges();
    expect(cita.classList.contains('cita-proxima')).toBe(false);
    fixture.componentInstance.cita = { fecha: '2026-11-03', hora: '09:50', estado: 'confirmada' };
    fixture.detectChanges();
    expect(cita.classList.contains('cita-en-curso')).toBe(true);
  });

  it('soloNumeros limpia letras y respeta el máximo', () => {
    const entrada = elemento.querySelector('#dni') as HTMLInputElement;
    entrada.value = '45a78-1236999';
    entrada.dispatchEvent(new Event('input'));
    expect(entrada.value).toBe('45781236');
    expect(fixture.componentInstance.dni.value).toBe('45781236');
    expect(entrada.getAttribute('inputmode')).toBe('numeric');
  });

  it('autoenfoque coloca el cursor en el campo', async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(document.activeElement?.id).toBe('foco');
  });

  it('confirmarAccion solo emite si el usuario acepta', async () => {
    const confirmacion = TestBed.inject(Confirmacion);
    const boton = elemento.querySelector('#borrar') as HTMLButtonElement;
    boton.click();
    expect(confirmacion.abierta).toBe(true);
    confirmacion.responder(false);
    await Promise.resolve();
    expect(fixture.componentInstance.confirmados).toBe(0);
    boton.click();
    confirmacion.responder(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(fixture.componentInstance.confirmados).toBe(1);
  });
});
