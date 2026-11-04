export enum TipoEspecie {
  Perro = 'perro',
  Gato = 'gato',
  Ave = 'ave',
  Conejo = 'conejo',
  Otro = 'otro',
}

export interface Especie {
  readonly codigo: TipoEspecie;
  readonly nombre: string;
  readonly imagen: string;
  readonly razas: readonly string[];
}

export const ESPECIES: Readonly<Record<TipoEspecie, Especie>> = {
  [TipoEspecie.Perro]: {
    codigo: TipoEspecie.Perro,
    nombre: 'Perro',
    imagen: 'imagenes/especies/perro.jpg',
    razas: ['Mestizo', 'Labrador', 'Schnauzer', 'Shih Tzu', 'Pastor alemán', 'Golden retriever', 'Pug', 'Bulldog francés'],
  },
  [TipoEspecie.Gato]: {
    codigo: TipoEspecie.Gato,
    nombre: 'Gato',
    imagen: 'imagenes/especies/gato.jpg',
    razas: ['Mestizo', 'Siamés', 'Persa', 'Angora', 'Bengalí'],
  },
  [TipoEspecie.Ave]: {
    codigo: TipoEspecie.Ave,
    nombre: 'Ave',
    imagen: 'imagenes/especies/ave.jpg',
    razas: ['Periquito', 'Canario', 'Cacatúa', 'Loro'],
  },
  [TipoEspecie.Conejo]: {
    codigo: TipoEspecie.Conejo,
    nombre: 'Conejo',
    imagen: 'imagenes/especies/conejo.jpg',
    razas: ['Cabeza de león', 'Mini lop', 'Rex', 'Mestizo'],
  },
  [TipoEspecie.Otro]: {
    codigo: TipoEspecie.Otro,
    nombre: 'Otro',
    imagen: 'imagenes/especies/otro.jpg',
    razas: ['Hámster', 'Cuy', 'Tortuga', 'Hurón'],
  },
};

export const LISTA_ESPECIES: readonly Especie[] = Object.values(ESPECIES);
