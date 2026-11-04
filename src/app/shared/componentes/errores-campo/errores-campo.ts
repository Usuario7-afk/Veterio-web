import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { mensajesDe } from '../../validadores/mensajes';

@Component({
  selector: 'app-errores-campo',
  standalone: false,
  templateUrl: './errores-campo.html',
  styleUrls: ['./errores-campo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErroresCampo implements OnChanges, OnDestroy {
  @Input({ required: true }) public control: AbstractControl | null = null;
  @Input() public mensajes: Readonly<Record<string, string>> = {};
  @Input() public textoPendiente = 'Verificando...';

  private suscripcion: Subscription | null = null;

  constructor(private cambios: ChangeDetectorRef) {}

  public get visibles(): string[] {
    const control = this.control;
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return [];
    }
    return mensajesDe(control.errors, this.mensajes);
  }

  public get pendiente(): boolean {
    return this.control?.pending ?? false;
  }

  public ngOnChanges(): void {
    this.suscripcion?.unsubscribe();
    this.suscripcion = this.control?.events.subscribe(() => this.cambios.markForCheck()) ?? null;
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }
}
