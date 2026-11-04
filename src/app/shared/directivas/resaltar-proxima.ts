import { ChangeDetectorRef, Directive, HostBinding, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Cita } from '../modelos/cita';
import { combinarFechaHora, minutosEntre } from '../utilidades/fechas';

export type CitaResaltable = Pick<Cita, 'fecha' | 'hora' | 'estado'>;

@Directive({
  selector: '[resaltarProxima]',
  standalone: false,
})
export class ResaltarProxima implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) public resaltarProxima!: CitaResaltable;
  @Input() public minutosAviso = 60;
  @Input() public referencia: Date | null = null;

  @HostBinding('class.cita-proxima') public proxima = false;
  @HostBinding('class.cita-en-curso') public enCurso = false;
  @HostBinding('attr.title') public aviso: string | null = null;

  private intervalo: ReturnType<typeof setInterval> | null = null;

  constructor(private cambios: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.evaluar();
    if (this.referencia === null) {
      this.intervalo = setInterval(() => {
        this.evaluar();
        this.cambios.markForCheck();
      }, 60000);
    }
  }

  public ngOnChanges(): void {
    this.evaluar();
  }

  public ngOnDestroy(): void {
    if (this.intervalo !== null) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  private evaluar(): void {
    const cita = this.resaltarProxima;
    if (!cita || (cita.estado !== 'pendiente' && cita.estado !== 'confirmada')) {
      this.proxima = false;
      this.enCurso = false;
      this.aviso = null;
      return;
    }
    const ahora = this.referencia ?? new Date();
    const minutos = minutosEntre(ahora, combinarFechaHora(cita.fecha, cita.hora));
    this.enCurso = minutos <= 0 && minutos > -30;
    this.proxima = minutos > 0 && minutos <= this.minutosAviso;
    if (this.proxima) {
      this.aviso = `Empieza en ${minutos} min`;
    } else if (this.enCurso) {
      this.aviso = 'En curso';
    } else {
      this.aviso = null;
    }
  }
}
