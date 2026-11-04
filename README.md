# Veterio

Aplicación web en Angular y TypeScript para ordenar la atención de una clínica veterinaria. Permite registrar mascotas con sus dueños, agendar citas sobre un calendario con horarios reales y consultar el historial de atención de cada mascota.

Proyecto definitivo de Desarrollo de Interfaces 3.

## Funcionalidades

- Inicio de sesión con tres roles: administrador, recepción y veterinario.

- Panel de inicio con resumen del día, citas de hoy y próximas citas (las que empiezan pronto se resaltan).

- Mascotas: listado con búsqueda por nombre, raza, dueño o DNI y filtro por especie. Registro y edición de mascota con su dueño (dueño registrado o nuevo) y lista de alergias.

- Citas: agenda mensual hecha con Bootstrap, lista de citas por día, filtro por veterinario, confirmar y cancelar citas. Formulario de nueva cita con horarios libres del veterinario elegido.

- Historial: línea de tiempo de atenciones por mascota, filtro por tipo, detalle en un modal y registro de nuevas atenciones con medicamentos.

- Usuarios (solo administrador): listado, creación, edición y activación o desactivación de cuentas.

- Las horas se muestran en formato de 12 horas (por ejemplo, 3:30 p. m.).

- Avisos tipo toast, modal de confirmación al salir de un formulario con cambios sin guardar y diseño adaptable a celular.

## Requisitos del entorno

Versiones tomadas del package.json y de ng version del equipo donde se probó:

Node.js  24.20.0 
npm  11.19.0 
Angular CLI  22.2.5 - Angular  22.2.4 o superior
TypeScript  6.0.3 o superior
Bootstrap  5.3.8 
Bootstrap Icons  1.13.2 

## Instalación

1 Instalar Node.js 24 .
2 Abrir una terminal en la carpeta del proyecto.
3 Instalar dependencias:

bash
npm install

## Ejecución

bash
npm start

Abrir http://localhost:4200/ la primera vez se cargan los datos de ejemplo.

## Usuarios de prueba

Administrador  admin@veterio.pe  Admin2026 
Recepción  recepcion@veterio.pe  Recepcion2026 
Veterinario  asalazar@veterio.pe  Salazar2026 
Veterinario  mtorres@veterio.pe Torres2026 
Veterinario  cgutierrez@veterio.pe  Gutierrez2026 
Recepción (desactivada)  dparedes@veterio.pe  Paredes2026 

Qué puede hacer cada rol:

- Administrador: todo, más la gestión de usuarios.
- Recepción: registrar y editar mascotas, agendar, confirmar y cancelar citas, ver historiales.
- Veterinario: ver sus citas, consultar historiales y registrar atenciones.

## Datos y sesión

- Todo se guarda en el localStorage del navegador, con claves que empiezan en veterio. (mascotas, dueños, citas, atenciones, usuarios, veterinarios y la sesión).

- Si el almacenamiento está vacío, la app carga los datos de ejemplo de src/app/core/datos/datos-iniciales.ts. Las citas de ejemplo se ubican alrededor de la fecha del día en que se abre la app.

- Las contraseñas se guardan en texto plano..

## Pruebas

Se ejecutan con ng test:

bash
npx ng test 

## Diseño

Bocetos y flujos en Figma: https://www.figma.com/design/YzAjw376SqPLpPRpGSlHuo


