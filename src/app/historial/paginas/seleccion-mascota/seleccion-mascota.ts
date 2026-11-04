import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { Mascotas } from '../../../mascotas/servicios/mascotas';
import { Duenos } from '../../../mascotas/servicios/duenos';
import { MascotaConDueno } from '../../../shared/modelos/mascota';
import { Atenciones } from '../../servicios/atenciones';

interface MascotaConUltimaAtencion extends MascotaConDueno {
  ultimaAtencion: string | null;
}

@Component({
  selector: 'app-seleccion-mascota',
  standalone: false,
  templateUrl: './seleccion-mascota.html',
  styleUrls: ['./seleccion-mascota.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SeleccionMascota implements OnInit, OnDestroy {
  public items: MascotaConUltimaAtencion[] = [];
  private texto = '';
  private suscripcion: Subscription | null = null;

  constructor(
    private mascotas: Mascotas,
    private duenos: Duenos,
    private atenciones: Atenciones,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.suscripcion = combineLatest([this.mascotas.lista$, this.duenos.lista$, this.atenciones.lista$]).subscribe(() =>
      this.filtrar(),
    );
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  public buscar(texto: string): void {
    this.texto = texto;
    this.filtrar();
  }

  public abrir(id: string): void {
    void this.router.navigate(['/historial', id]);
  }

  public seguirPorId(_indice: number, item: MascotaConUltimaAtencion): string {
    return item.mascota.id;
  }

  private filtrar(): void {
    this.items = this.mascotas.filtrar({ texto: this.texto, especie: 'todas' }).map((item) => ({
      ...item,
      ultimaAtencion: this.atenciones.ultimaDe(item.mascota.id)?.fecha ?? null,
    }));
  }
}
