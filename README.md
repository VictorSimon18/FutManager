# FutManager

Aplicación móvil para la gestión de equipos de fútbol amateur. Permite a entrenadores, jugadores y aficionados llevar el seguimiento completo de la temporada desde el móvil.

---

## Pantallas de la app

### Inicio de sesión
Pantalla de bienvenida con fondo animado tipo aurora. El usuario introduce su email y contraseña para acceder. Si las credenciales son correctas, la sesión queda guardada en el dispositivo para no tener que volver a iniciar sesión la próxima vez.

### Selección de rol
Una vez identificado, el usuario elige con qué rol quiere entrar: **Entrenador**, **Jugador** o **Aficionado**. Cada rol da acceso a una experiencia diferente dentro de la app.

---

## Rol: Entrenador

### Panel principal
Vista general del equipo con tres contadores rápidos (jugadores en plantilla, entrenamientos y partidos). Muestra el próximo evento en el calendario, ya sea un partido o un entrenamiento. Desde aquí se puede acceder directamente a cualquier sección mediante los botones de acción rápida.

### Plantilla de jugadores
Lista completa de los jugadores activos del equipo. Permite buscar por nombre y ver de un vistazo el dorsal y la posición de cada jugador. Se puede dar de baja a un jugador deslizando o pulsando el icono de eliminar, siempre con una confirmación previa.

### Ficha del jugador
Perfil detallado de un jugador: nombre, posición, dorsal, pie dominante, sexo, fecha de nacimiento, altura y peso. Incluye un resumen de sus estadísticas de la temporada (partidos jugados, goles, asistencias, minutos, tarjetas y valoración media) y el historial de sus últimos partidos con el resultado individual. Desde esta pantalla se puede editar al jugador o darle de baja.

### Crear / Editar jugador
Formulario para añadir un jugador nuevo o modificar los datos de uno existente. Campos disponibles: nombre, sexo, fecha de nacimiento, dorsal, posición (13 opciones), pie dominante, altura y peso. La posición se selecciona pulsando sobre chips visuales. El formulario valida que el nombre esté relleno y que el dorsal sea un número positivo antes de guardar.

### Partidos
Lista de partidos del equipo separada en dos pestañas: **Próximos** (ordenados del más cercano al más lejano) y **Jugados** (con el resultado y un indicador de Victoria, Derrota o Empate en color). Cada partido muestra el rival, la fecha, la hora, la ubicación y si el equipo juega como local o visitante.

### Detalle del partido
Vista completa de un partido. Si el partido está pendiente, aparece un botón para registrar el resultado mediante un diálogo rápido. Una vez finalizado, muestra el marcador final destacado y la sección de estadísticas individuales por jugador. Para añadir estadísticas de un jugador, primero se selecciona de la lista del equipo y luego se rellenan sus datos (minutos, goles, asistencias, tarjetas, si fue titular y la valoración). Incluye botones para editar el partido, eliminarlo (con confirmación) y un botón verde de "Guardar partido" para volver a la lista.

### Crear / Editar partido
Formulario para programar o modificar un partido. Campos: rival, fecha, hora, ubicación, tipo (Liga, Copa, Amistoso o Torneo), modalidad (7 vs 7, 11 vs 11, Fútbol sala o Fútbol playa) y si el equipo juega en casa o fuera. También acepta notas adicionales.

### Entrenamientos
Lista de sesiones de entrenamiento separada en **Próximos** y **Pasados**. Cada entrenamiento muestra el tipo de sesión con un color diferente (Técnico, Táctico, Físico, etc.), la fecha, el horario y la ubicación. Los entrenamientos ya completados aparecen con un icono de verificación verde y se muestran automáticamente en la pestaña "Pasados".

### Detalle del entrenamiento
Vista completa de una sesión con todos sus datos. La sección principal es la **lista de asistencia**: aparece cada jugador de la plantilla con un interruptor que el entrenador puede activar o desactivar para marcar si asistió. Un contador muestra en tiempo real cuántos jugadores han asistido sobre el total. El botón verde "Guardar entrenamiento" marca la sesión como realizada y la mueve a la pestaña de pasados. También permite editar o eliminar el entrenamiento.

### Crear / Editar entrenamiento
Formulario para programar o modificar una sesión. Campos: fecha, hora de inicio, hora de fin, ubicación, tipo de sesión (Técnico, Táctico, Físico, Técnico-táctico, Preparación de partido o Recuperación) y un espacio para describir los objetivos de la sesión.

---

## Rol: Jugador

### Mi perfil
Vista personal del jugador con sus datos de temporada: partidos jugados, goles, asistencias y demás estadísticas. Muestra también los próximos eventos del equipo (partidos y entrenamientos) y el historial de rendimiento en los últimos partidos.

---

## Rol: Aficionado

### Mi equipo
Pantalla de seguimiento del equipo favorito. Muestra los resultados más recientes, los próximos partidos y la posición en la clasificación del torneo.

---

## Credenciales de prueba

| Email | Contraseña | Rol |
|---|---|---|
| carlos@futmanager.es | 123456 | Entrenador |
| jugador@futmanager.es | 123456 | Jugador |
| fan@futmanager.es | 123456 | Aficionado |
