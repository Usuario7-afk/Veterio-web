import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DiaCalendario, ENCABEZADOS_SEMANA, construirMes } from '../../../shared/utilidades/calendario';
import { nombreMes } from '../../../shared/utilidades/fechas';

@Component({
  selector: 'app-calendario-mensual',
  standalone: false,
  templateUrl: './calendario-mensual.html',
  styleUrls: ['./calendario-mensual.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarioMensual implements OnChanges {
  @Input({ required: true }) public anio = new Date().getFullYear();
  @Input({ required: true }) public mes = new Date().getMonth();
  @Input() public seleccionada = '';
  @Input() public hoy = '';
  @Input() public conteos: Readonly<Record<string, number>> = {};
  @Output() public seleccionar = new EventEmitter<string>();
  @Output() public cambiarMes = new EventEmitter<number>();

  public readonly encabezados = ENCABEZADOS_SEMANA;
  public semanas: DiaCalendario[][] = [];
  public titulo = '';

  public ngOnChanges(): void {
    this.semanas = construirMes(this.anio, this.mes);
    const mes = nombreMes(this.mes);
    this.titulo = `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${this.anio}`;
  }

  public cantidad(dia: DiaCalendario): number {
    return this.conteos[dia.fecha] ?? 0;
  }

  public etiqueta(dia: DiaCalendario): string {
    const cantidad = this.cantidad(dia);
    const texto = cantidad === 0 ? 'sin citas' : `${cantidad} cita${cantidad === 1 ? '' : 's'}`;
    return `${dia.numero} de ${nombreMes(this.mes)}, ${texto}`;
  }
}
