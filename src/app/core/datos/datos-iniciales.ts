import { Atencion, Medicamento } from '../../shared/modelos/atencion';
import { Cita } from '../../shared/modelos/cita';
import { DatosDueno } from '../../shared/modelos/dueno';
import { TipoEspecie } from '../../shared/modelos/especie';
import { Mascota } from '../../shared/modelos/mascota';
import { EstadoCita, TipoServicio } from '../../shared/modelos/tipos';
import { Usuario } from '../../shared/modelos/usuario';
import { DatosVeterinario } from '../../shared/modelos/veterinario';
import { hoyISO, sumarDias } from '../../shared/utilidades/fechas';

export interface DatosIniciales {
  usuarios: Usuario[];
  veterinarios: DatosVeterinario[];
  duenos: DatosDueno[];
  mascotas: Mascota[];
  citas: Cita[];
  atenciones: Atencion[];
}

const veterinarios: DatosVeterinario[] = [
  {
    id: 'vet-1',
    tratamiento: 'Dra.',
    nombres: 'Andrea',
    apellidos: 'Salazar Ríos',
    documento: '41258963',
    telefono: '984512367',
    correo: 'asalazar@veterio.pe',
    colegiatura: '8421',
    especialidad: 'Medicina general',
    diasAtencion: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'vet-2',
    tratamiento: 'Dr.',
    nombres: 'Miguel',
    apellidos: 'Torres Castillo',
    documento: '40716358',
    telefono: '976284153',
    correo: 'mtorres@veterio.pe',
    colegiatura: '7310',
    especialidad: 'Cirugía y traumatología',
    diasAtencion: [1, 2, 3, 4, 5],
  },
  {
    id: 'vet-3',
    tratamiento: 'Dra.',
    nombres: 'Carmen',
    apellidos: 'Gutiérrez Soto',
    documento: '45893217',
    telefono: '962731845',
    correo: 'cgutierrez@veterio.pe',
    colegiatura: '9156',
    especialidad: 'Animales exóticos',
    diasAtencion: [1, 2, 3, 4, 5, 6],
  },
];

const duenos: DatosDueno[] = [
  { id: 'due-1', nombres: 'Jorge', apellidos: 'Huamán Torres', documento: '45781236', telefono: '987654321', correo: 'jhuaman@gmail.com', direccion: 'Av. Arequipa 1520, Lince' },
  { id: 'due-2', nombres: 'Lucía', apellidos: 'Fernández Rojas', documento: '72318456', telefono: '956123478', correo: 'lucia.fernandez@hotmail.com', direccion: 'Calle Los Pinos 128, Miraflores' },
  { id: 'due-3', nombres: 'Carlos', apellidos: 'Mendoza Paredes', documento: '10482735', telefono: '945332190', correo: 'cmendoza@gmail.com', direccion: 'Jr. Huancavelica 340, Cercado de Lima' },
  { id: 'due-4', nombres: 'Milagros', apellidos: 'Chávez Vargas', documento: '70925143', telefono: '912870455', correo: 'milagros.chavez@gmail.com', direccion: 'Av. La Marina 2450, San Miguel' },
  { id: 'due-5', nombres: 'Luis', apellidos: 'Ramírez Flores', documento: '46201789', telefono: '998201736', correo: 'lramirez@outlook.com', direccion: 'Av. Universitaria 1785, Los Olivos' },
  { id: 'due-6', nombres: 'Ana Lucía', apellidos: 'Torres Ccori', documento: '73651204', telefono: '965478120', correo: 'anatorres@gmail.com', direccion: 'Jr. Junín 215, Barranco' },
  { id: 'due-7', nombres: 'Ricardo', apellidos: 'Vílchez Paz', documento: '42876391', telefono: '943765218', correo: 'rvilchez@gmail.com', direccion: 'Av. Benavides 3890, Santiago de Surco' },
];

const usuarios = (registro: string): Usuario[] => [
  { id: 'usr-1', nombre: 'Patricia Rojas Medina', correo: 'admin@veterio.pe', clave: 'Admin2026', rol: 'administrador', activo: true, veterinarioId: null, creadoEn: registro },
  { id: 'usr-2', nombre: 'Rosa Quispe Mamani', correo: 'recepcion@veterio.pe', clave: 'Recepcion2026', rol: 'recepcion', activo: true, veterinarioId: null, creadoEn: registro },
  { id: 'usr-3', nombre: 'Andrea Salazar Ríos', correo: 'asalazar@veterio.pe', clave: 'Salazar2026', rol: 'veterinario', activo: true, veterinarioId: 'vet-1', creadoEn: registro },
  { id: 'usr-4', nombre: 'Miguel Torres Castillo', correo: 'mtorres@veterio.pe', clave: 'Torres2026', rol: 'veterinario', activo: true, veterinarioId: 'vet-2', creadoEn: registro },
  { id: 'usr-5', nombre: 'Carmen Gutiérrez Soto', correo: 'cgutierrez@veterio.pe', clave: 'Gutierrez2026', rol: 'veterinario', activo: true, veterinarioId: 'vet-3', creadoEn: registro },
  { id: 'usr-6', nombre: 'Diego Paredes Luna', correo: 'dparedes@veterio.pe', clave: 'Paredes2026', rol: 'recepcion', activo: false, veterinarioId: null, creadoEn: registro },
];

export function crearDatosIniciales(referencia: Date = new Date()): DatosIniciales {
  const hoy = hoyISO(referencia);
  const dia = (desplazamiento: number): string => sumarDias(hoy, desplazamiento);

  const mascota = (
    id: string,
    nombre: string,
    especie: TipoEspecie,
    raza: string,
    sexo: Mascota['sexo'],
    fechaNacimiento: string,
    peso: number,
    color: string,
    duenoId: string,
    registro: number,
    alergias: string[] = [],
    observaciones = '',
  ): Mascota => ({
    id,
    nombre,
    especie,
    raza,
    sexo,
    fechaNacimiento,
    peso,
    color,
    alergias,
    observaciones,
    duenoId,
    fechaRegistro: dia(registro),
  });

  const mascotas: Mascota[] = [
    mascota('mas-1', 'Rocky', TipoEspecie.Perro, 'Labrador', 'macho', '2021-03-12', 28.5, 'Dorado', 'due-1', -620, ['Penicilina'], 'Se pone nervioso en las vacunas.'),
    mascota('mas-2', 'Luna', TipoEspecie.Gato, 'Mestizo', 'hembra', '2024-01-20', 4.2, 'Atigrado', 'due-2', -400),
    mascota('mas-3', 'Max', TipoEspecie.Perro, 'Schnauzer', 'macho', '2019-06-05', 9.8, 'Sal y pimienta', 'due-3', -700),
    mascota('mas-4', 'Mía', TipoEspecie.Gato, 'Siamés', 'hembra', '2022-09-14', 3.6, 'Crema', 'due-2', -400),
    mascota('mas-5', 'Toby', TipoEspecie.Perro, 'Shih Tzu', 'macho', '2020-11-30', 6.4, 'Blanco y marrón', 'due-6', -350, ['Pollo'], 'Dieta hipoalergénica.'),
    mascota('mas-6', 'Kiwi', TipoEspecie.Ave, 'Periquito', 'macho', '2025-02-10', 0.04, 'Verde', 'due-4', -180),
    mascota('mas-7', 'Copito', TipoEspecie.Conejo, 'Cabeza de león', 'macho', '2023-05-22', 1.6, 'Blanco', 'due-5', -300),
    mascota('mas-8', 'Bruno', TipoEspecie.Perro, 'Pastor alemán', 'macho', '2018-08-03', 34, 'Negro y fuego', 'due-7', -800, ['Ivermectina']),
    mascota('mas-9', 'Nala', TipoEspecie.Perro, 'Mestizo', 'hembra', '2023-12-01', 12.3, 'Marrón', 'due-5', -120),
    mascota('mas-10', 'Pelusa', TipoEspecie.Otro, 'Cuy', 'hembra', '2024-07-18', 0.9, 'Blanco y marrón', 'due-6', -60),
  ];

  const cita = (
    id: string,
    mascotaId: string,
    veterinarioId: string,
    desplazamiento: number,
    hora: string,
    motivo: TipoServicio,
    estado: EstadoCita,
    notas = '',
  ): Cita => ({
    id,
    mascotaId,
    veterinarioId,
    fecha: dia(desplazamiento),
    hora,
    motivo,
    estado,
    notas,
    creadaEn: dia(Math.min(desplazamiento, 0) - 3),
  });

  const citas: Cita[] = [
    cita('cit-1', 'mas-8', 'vet-2', -8, '10:00', 'control', 'cancelada', 'El dueño pidió reprogramar.'),
    cita('cit-2', 'mas-2', 'vet-1', -6, '11:30', 'consulta', 'atendida'),
    cita('cit-3', 'mas-3', 'vet-1', -2, '09:30', 'vacunacion', 'atendida'),
    cita('cit-4', 'mas-5', 'vet-2', -1, '16:00', 'desparasitacion', 'atendida'),
    cita('cit-5', 'mas-1', 'vet-1', 0, '09:00', 'consulta', 'atendida', 'Revisión del oído derecho.'),
    cita('cit-6', 'mas-2', 'vet-2', 0, '10:30', 'control', 'confirmada'),
    cita('cit-7', 'mas-3', 'vet-1', 0, '11:00', 'vacunacion', 'pendiente', 'Refuerzo de séxtuple.'),
    cita('cit-8', 'mas-4', 'vet-2', 0, '12:00', 'control', 'cancelada'),
    cita('cit-9', 'mas-6', 'vet-3', 0, '15:30', 'control', 'pendiente', 'Revisar pico y uñas.'),
    cita('cit-10', 'mas-5', 'vet-1', 0, '17:00', 'consulta', 'confirmada', 'Picazón en orejas.'),
    cita('cit-11', 'mas-8', 'vet-2', 1, '09:30', 'cirugia', 'confirmada', 'Evaluación prequirúrgica de cadera.'),
    cita('cit-12', 'mas-7', 'vet-3', 1, '10:00', 'consulta', 'pendiente'),
    cita('cit-13', 'mas-9', 'vet-1', 1, '17:00', 'vacunacion', 'pendiente', 'Vacuna antirrábica.'),
    cita('cit-14', 'mas-10', 'vet-3', 2, '11:30', 'control', 'pendiente'),
    cita('cit-15', 'mas-1', 'vet-1', 3, '09:00', 'control', 'pendiente', 'Control de otitis.'),
    cita('cit-16', 'mas-4', 'vet-2', 5, '15:00', 'consulta', 'pendiente'),
    cita('cit-17', 'mas-3', 'vet-1', 7, '10:30', 'desparasitacion', 'pendiente'),
    cita('cit-18', 'mas-9', 'vet-2', 9, '14:30', 'control', 'pendiente'),
  ];

  const med = (nombre: string, dosis: string, frecuencia: string, dias: number): Medicamento => ({
    nombre,
    dosis,
    frecuencia,
    dias,
  });

  const atencion = (
    id: string,
    mascotaId: string,
    veterinarioId: string,
    desplazamiento: number,
    tipo: TipoServicio,
    datos: Pick<Atencion, 'motivo' | 'diagnostico' | 'tratamiento' | 'peso' | 'temperatura' | 'costo'>,
    medicamentos: Medicamento[] = [],
    citaId: string | null = null,
    proximoControl: number | null = null,
  ): Atencion => ({
    id,
    mascotaId,
    veterinarioId,
    citaId,
    fecha: dia(desplazamiento),
    tipo,
    ...datos,
    medicamentos,
    proximoControl: proximoControl === null ? null : dia(proximoControl),
  });

  const atenciones: Atencion[] = [
    atencion('ate-1', 'mas-1', 'vet-1', -245, 'control', { motivo: 'Control de peso', diagnostico: 'Sobrepeso leve, 31 kg.', tratamiento: 'Cambio a alimento light y paseos diarios de 40 minutos.', peso: 31, temperatura: 38.6, costo: 45 }),
    atencion('ate-2', 'mas-1', 'vet-1', -110, 'vacunacion', { motivo: 'Vacuna antirrábica anual', diagnostico: 'Paciente sano, apto para vacunación.', tratamiento: 'Se aplicó vacuna antirrábica. Sin reacciones.', peso: 29.2, temperatura: 38.4, costo: 60 }),
    atencion('ate-3', 'mas-1', 'vet-1', 0, 'consulta', { motivo: 'Se rasca el oído derecho', diagnostico: 'Otitis externa en oído derecho.', tratamiento: 'Limpieza de conducto auditivo y gotas óticas.', peso: 28.5, temperatura: 38.9, costo: 85 }, [med('Otomax gotas', '5 gotas', 'Cada 12 horas', 7)], 'cit-5', 3),
    atencion('ate-4', 'mas-2', 'vet-1', -6, 'consulta', { motivo: 'Vómitos ocasionales', diagnostico: 'Gastritis leve por cambio de alimento.', tratamiento: 'Dieta blanda por 5 días y volver al alimento anterior.', peso: 4.2, temperatura: 38.7, costo: 70 }, [med('Omeprazol', '5 mg', 'Cada 24 horas', 5)], 'cit-2'),
    atencion('ate-5', 'mas-3', 'vet-1', -2, 'vacunacion', { motivo: 'Vacuna séxtuple', diagnostico: 'Paciente sano.', tratamiento: 'Primera dosis de refuerzo séxtuple.', peso: 9.8, temperatura: 38.5, costo: 65 }, [], 'cit-3', 21),
    atencion('ate-6', 'mas-5', 'vet-2', -1, 'desparasitacion', { motivo: 'Desparasitación trimestral', diagnostico: 'Sin parásitos visibles.', tratamiento: 'Desparasitación interna oral.', peso: 6.4, temperatura: 38.3, costo: 40 }, [med('Drontal Plus', '1 tableta', 'Dosis única', 1)], 'cit-4'),
    atencion('ate-7', 'mas-8', 'vet-2', -40, 'consulta', { motivo: 'Cojera en pata trasera izquierda', diagnostico: 'Displasia de cadera en grado leve.', tratamiento: 'Antiinflamatorio, reposo y evaluación quirúrgica.', peso: 34, temperatura: 38.8, costo: 120 }, [med('Meloxicam', '1.5 mg', 'Cada 24 horas', 10), med('Condroprotector', '1 tableta', 'Cada 24 horas', 30)]),
    atencion('ate-8', 'mas-6', 'vet-3', -30, 'control', { motivo: 'Control general', diagnostico: 'Plumaje en buen estado. Uñas largas.', tratamiento: 'Corte de uñas y recomendaciones de alimentación.', peso: 0.04, temperatura: 41, costo: 35 }),
    atencion('ate-9', 'mas-7', 'vet-3', -90, 'consulta', { motivo: 'Falta de apetito', diagnostico: 'Crecimiento dental excesivo.', tratamiento: 'Limado dental y heno a libre disposición.', peso: 1.5, temperatura: 39.2, costo: 90 }),
    atencion('ate-10', 'mas-4', 'vet-2', -150, 'cirugia', { motivo: 'Esterilización', diagnostico: 'Paciente apta para cirugía.', tratamiento: 'Ovariohisterectomía sin complicaciones.', peso: 3.5, temperatura: 38.4, costo: 280 }, [med('Tramadol', '4 mg', 'Cada 12 horas', 3), med('Amoxicilina', '50 mg', 'Cada 12 horas', 7)]),
  ];

  return {
    usuarios: usuarios(dia(-900)),
    veterinarios,
    duenos,
    mascotas,
    citas,
    atenciones,
  };
}

let cache: DatosIniciales | null = null;

export function datosIniciales(): DatosIniciales {
  if (cache === null) {
    cache = crearDatosIniciales();
  }
  return cache;
}
