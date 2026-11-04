import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { Sesion } from '../../../core/servicios/sesion';
import { Citas } from '../../../citas/servicios/citas';
import { Mascotas } from '../../../mascotas/servicios/mascotas';
import { AtencionVista } from '../../../shared/modelos/atencion';
import { CitaDetallada } from '../../../shared/modelos/cita';
import { MascotaConDueno } from '../../../shared/modelos/mascota';
import { ETIQUETAS_SERVICIO, TipoServicio } from '../../../shared/modelos/tipos';
import { combinarFechaHora } from '../../../shared/utilidades/fechas';
import { Atenciones } from '../../servicios/atenciones';

type FiltroTipo = TipoServicio | 'todas';

interface OpcionFiltro {
  valor: FiltroTipo;
  texto: string;
  cantidad: number;
}

@Component({
  selector: 'app-historial-mascota',
  standalone: false,
  templateUrl: './historial-mascota.html',
  styleUrls: ['./historial-mascota.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HistorialMascota implements OnInit, OnDestroy {
  public datos: MascotaConDueno | undefined;
  public atenciones: AtencionVista[] = [];
  public visibles: AtencionVista[] = [];
  public proximasCitas: CitaDetallada[] = [];
  public filtros: OpcionFiltro[] = [];
  public filtro: FiltroTipo = 'todas';
  public seleccionada: AtencionVista | null = null;
  public totalGastado = 0;
  public puedeEditar = false;
  public puedeAgendar = false;

  private mascotaId = '';
  private readonly suscripciones = new Subscription();

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private mascotas: Mascotas,
    private atencionesServicio: Atenciones,
    private citas: Citas,
    private sesion: Sesion,
  ) {}

  public ngOnInit(): void {
    this.puedeEditar = this.sesion.tieneRol(['administrador', 'recepcion']);
    this.puedeAgendar = this.puedeEditar;
    this.suscripciones.add(
      this.ruta.paramMap.subscribe((parametros) => {
        this.mascotaId = parametros.get('mascotaId') ?? '';
        this.filtro = 'todas';
        this.cargar();
      }),
    );
    this.suscripciones.add(
      combineLatest([this.mascotas.lista$, this.atencionesServicio.lista$, this.citas.lista$]).subscribe(() =>
        this.cargar(),
      ),
    );
  }

  public ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  public filtrar(valor: FiltroTipo): void {
    this.filtro = valor;
    this.visibles = valor === 'todas' ? this.atenciones : this.atenciones.filter((atencion) => atencion.tipo === valor);
  }

  public volver(): void {
    void this.router.navigate(['/historial']);
  }

  public registrarAtencion(): void {
    void this.router.navigate(['/historial', this.mascotaId, 'nueva']);
  }

  public agendar(): void {
    void this.router.navigate(['/citas/nueva'], { queryParams: { mascota: this.mascotaId } });
  }

  public editar(id: string): void {
    void this.router.navigate(['/mascotas', id, 'editar']);
  }

  public verDetalle(atencion: AtencionVista): void {
    this.seleccionada = atencion;
  }

  public cerrarDetalle(): void {
    this.seleccionada = null;
  }

  public seguirPorId(_indice: number, cita: CitaDetallada): string {
    return cita.id;
  }

  private cargar(): void {
    this.datos = this.mascotas.obtenerConDueno(this.mascotaId);
    if (!this.datos) {
      this.atenciones = [];
      this.visibles = [];
      this.proximasCitas = [];
      return;
    }
    this.atenciones = this.atencionesServicio.porMascota(this.mascotaId);
    this.totalGastado = this.atenciones.reduce((total, atencion) => total + atencion.costo, 0);
    const ahora = new Date();
    this.proximasCitas = this.citas
      .porMascota(this.mascotaId)
      .filter(
        (cita) =>
          (cita.estado === 'pendiente' || cita.estado === 'confirmada') &&
          combinarFechaHora(cita.fecha, cita.hora) >= ahora,
      );
    const tipos = [...new Set(this.atenciones.map((atencion) => atencion.tipo))];
    this.filtros = [
      { valor: 'todas', texto: 'Todas', cantidad: this.atenciones.length },
      ...tipos.map((tipo) => ({
        valor: tipo,
        texto: ETIQUETAS_SERVICIO[tipo],
        cantidad: this.atenciones.filter((atencion) => atencion.tipo === tipo).length,
      })),
    ];
    if (!tipos.some((tipo) => tipo === this.filtro)) {
      this.filtro = 'todas';
    }
    this.filtrar(this.filtro);
  }
}
