import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

let contador = 0;

@Component({
  selector: 'app-buscador-texto',
  standalone: false,
  templateUrl: './buscador-texto.html',
  styleUrls: ['./buscador-texto.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuscadorTexto implements OnInit, OnDestroy {
  @Input() public etiqueta = 'Buscar';
  @Input() public placeholder = 'Escribe para buscar';
  @Input() public retraso = 250;
  @Input() public set valor(texto: string) {
    this.campo.setValue(texto, { emitEvent: false });
  }
  @Output() public buscar = new EventEmitter<string>();

  public readonly campo = new FormControl('', { nonNullable: true });
  public readonly idCampo = `buscador-${++contador}`;
  private suscripcion: Subscription | null = null;

  public ngOnInit(): void {
    this.suscripcion = this.campo.valueChanges
      .pipe(debounceTime(this.retraso), distinctUntilChanged())
      .subscribe((texto) => this.buscar.emit(texto.trim()));
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  public limpiar(): void {
    this.campo.setValue('');
  }
}
