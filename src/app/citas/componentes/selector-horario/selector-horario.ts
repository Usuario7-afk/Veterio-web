import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HorarioDia } from '../../../shared/modelos/cita';

@Component({
  selector: 'app-selector-horario',
  standalone: false,
  templateUrl: './selector-horario.html',
  styleUrls: ['./selector-horario.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorHorario {
  @Input({ required: true }) public horarios: readonly HorarioDia[] = [];
  @Input() public seleccionada = '';
  @Input() public mensajeVacio = 'No hay horarios para mostrar.';
  @Input() public deshabilitado = false;
  @Output() public elegir = new EventEmitter<string>();

  public get libres(): number {
    return this.horarios.filter((horario) => horario.libre).length;
  }

  public seguirPorHora(_indice: number, horario: HorarioDia): string {
    return horario.hora;
  }
}
