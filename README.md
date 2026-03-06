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
Vista general del equipo con tres contadores rápidos (jugadores en plantilla, entrenamientos y partidos). Muestra el próximo evento en el calendario. Incluye una card de **Rendimiento del equipo** con estadísticas reales de la temporada: partidos jugados, victorias, empates, derrotas, goles a favor y en contra, porcentaje de victorias, racha actual y máximo goleador. Desde aquí se puede acceder directamente a cualquier sección mediante los botones de acción rápida.

### Plantilla de jugadores
Lista completa de los jugadores activos del equipo, ordenada por líneas (Portero → Defensas → Mediocentros → Delanteros → Líbero). Cada card tiene el borde izquierdo, el avatar y el dorsal coloreados según la posición del jugador:
- **Naranja** — Portero
- **Rojo** — Defensas (Defensa Central, Lateral D/I, Carrilero D/I)
- **Amarillo** — Líbero
- **Verde** — Mediocentros (Mediocentro Defensivo, Mediocentro, Mediapunta)
- **Azul** — Delanteros (Extremo D/I, Delantero)

Permite buscar por nombre y dar de baja a un jugador con confirmación previa.

### Ficha del jugador
Perfil detallado de un jugador: nombre, posición, dorsal, pie dominante, sexo, fecha de nacimiento, altura y peso. La cabecera del perfil usa el color de su posición. Incluye:
- **Estadísticas de temporada**: partidos, goles, asistencias, minutos, entradas, tarjetas y valoración media.
- **Asistencia a entrenamientos**: contador de sesiones asistidas sobre el total, porcentaje y barra de progreso visual.
- **Historial de últimos partidos**: resultado individual con goles, asistencias, minutos y tarjetas. Si el jugador acumuló 2 amarillas en un partido, se muestra automáticamente el indicador de expulsión.

Desde esta pantalla se puede editar al jugador o darle de baja.

### Crear / Editar jugador
Formulario para añadir un jugador nuevo o modificar los datos de uno existente. Campos disponibles: nombre, sexo, fecha de nacimiento (formato `DD-MM-YYYY`), dorsal, posición (13 opciones con chips táctiles), pie dominante, altura y peso. La fecha se introduce y muestra en formato `DD-MM-YYYY`.

### Partidos
Lista de partidos del equipo separada en dos pestañas: **Próximos** (ordenados del más cercano al más lejano) y **Jugados** (con el resultado y un indicador de Victoria, Derrota o Empate en color). Cada partido muestra el rival, la fecha, la hora, la ubicación y chips de tipo (Liga/Copa/Amistoso/Torneo), modalidad y condición (Local/Visitante).

### Detalle del partido
Vista completa de un partido. Si el partido está pendiente, aparece un botón para registrar el resultado. Una vez finalizado, muestra el marcador final y la sección de **estadísticas individuales por jugador**, organizada en cuatro bloques:

- **General**: minutos jugados, si fue titular, pases clave y valoración.
- **Ataque**: goles, asistencias, tiros a puerta, tiros fuera, fueras de juego.
- **Defensa**: entradas, despejes y paradas (esta última solo para porteros).
- **Disciplina**: tarjetas amarillas, tarjetas rojas, faltas cometidas y recibidas.

Los campos del formulario de estadísticas arrancan vacíos con texto de ejemplo (placeholders). Si se registran 2 o más amarillas, el sistema aplica automáticamente una tarjeta roja y avisa con un mensaje.

### Crear / Editar partido
Formulario para programar o modificar un partido. Campos: rival, fecha (`DD-MM-YYYY`), hora (`HH.MM`), ubicación, tipo (Liga, Copa, Amistoso o Torneo), modalidad (7 vs 7, 11 vs 11, Fútbol sala o Fútbol playa) y si el equipo juega en casa o fuera. También acepta notas adicionales.

### Entrenamientos
Lista de sesiones de entrenamiento separada en **Próximos** y **Pasados**. Cada entrenamiento muestra el tipo de sesión con un color diferente, la fecha, el horario y la ubicación. Los entrenamientos ya completados aparecen con un icono de verificación verde.

### Detalle del entrenamiento
Vista completa de una sesión con todos sus datos. La sección principal es la **lista de asistencia**: aparece cada jugador de la plantilla con un interruptor que el entrenador puede activar o desactivar para marcar si asistió. Un contador muestra en tiempo real cuántos jugadores han asistido sobre el total. El botón verde "Guardar entrenamiento" marca la sesión como realizada.

### Crear / Editar entrenamiento
Formulario para programar o modificar una sesión. Campos: fecha (`DD-MM-YYYY`), hora de inicio y fin (`HH.MM`), ubicación, tipo de sesión (Técnico, Táctico, Físico, Técnico-táctico, Preparación de partido o Recuperación) y un espacio para describir los objetivos de la sesión.

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
