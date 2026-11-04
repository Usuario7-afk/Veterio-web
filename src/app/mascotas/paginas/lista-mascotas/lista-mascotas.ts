import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, combineLatest, startWith } from 'rxjs';
import { Sesion } from '../../../core/servicios/sesion';
import { Especie, LISTA_ESPECIES, TipoEspecie } from '../../../shared/modelos/especie';
import { MascotaConDueno } from '../../../shared/modelos/mascota';
import { Duenos } from '../../servicios/duenos';
import { Mascotas } from '../../servicios/mascotas';

type FiltroEspecie = TipoEspecie | 'todas';

@Component({
  selector: 'app-lista-mascotas',
  standalone: false,
  templateUrl: './lista-mascotas.html',
  styleUrls: ['./lista-mascotas.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ListaMascotas implements OnInit, OnDestroy {
  public items: MascotaConDueno[] = [];
  public total = 0;
  public texto = '';
  public puedeEditar = false;
  public readonly especies: readonly Especie[] = LISTA_ESPECIES;
  public readonly filtroEspecie = new FormControl<FiltroEspecie>('todas', { nonNullable: true });

  private suscripcion: Subscription | null = null;

  constructor(
    private mascotas: Mascotas,
    private duenos: Duenos,
    private sesion: Sesion,
    private router: Router,
  ) {}

  public get hayFiltros(): boolean {
    return this.texto !== '' || this.filtroEspecie.value !== 'todas';
  }

  public ngOnInit(): void {
    this.puedeEditar = this.sesion.tieneRol(['administrador', 'recepcion']);
    this.suscripcion = combineLatest([
      this.mascotas.lista$,
      this.duenos.lista$,
      this.filtroEspecie.valueChanges.pipe(startWith(this.filtroEspecie.value)),
    ]).subscribe(() => this.filtrar());
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  public buscar(texto: string): void {
    this.texto = texto;
    this.filtrar();
  }

  public limpiarFiltros(): void {
    this.texto = '';
    this.filtroEspecie.setValue('todas');
  }

  public registrar(): void {
    void this.router.navigate(['/mascotas/nueva']);
  }

  public editar(id: string): void {
    void this.router.navigate(['/mascotas', id, 'editar']);
  }

  public verHistorial(id: string): void {
    void this.router.navigate(['/historial', id]);
  }

  public agendar(id: string): void {
    void this.router.navigate(['/citas/nueva'], { queryParams: { mascota: id } });
  }

  public seguirPorId(_indice: number, item: MascotaConDueno): string {
    return item.mascota.id;
  }

  private filtrar(): void {
    this.total = this.mascotas.lista.length;
    this.items = this.mascotas.filtrar({ texto: this.texto, especie: this.filtroEspecie.value });
  }
}
