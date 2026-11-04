import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface ControlesDueno {
  documento: FormControl<string>;
  nombres: FormControl<string>;
  apellidos: FormControl<string>;
  telefono: FormControl<string>;
  correo: FormControl<string>;
  direccion: FormControl<string>;
}

@Component({
  selector: 'app-datos-dueno',
  standalone: false,
  templateUrl: './datos-dueno.html',
  styleUrls: ['./datos-dueno.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatosDueno implements OnChanges, OnDestroy {
  @Input({ required: true }) public grupo!: FormGroup<ControlesDueno>;
  @Input() public prefijo = 'dueno';

  private suscripcion: Subscription | null = null;

  constructor(private cambios: ChangeDetectorRef) {}

  public ngOnChanges(): void {
    this.suscripcion?.unsubscribe();
    this.suscripcion = this.grupo.events.subscribe(() => this.cambios.markForCheck());
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }
}
