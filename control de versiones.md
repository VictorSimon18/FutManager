# FutManager — Control de versiones

Diario de cambios ordenado de más reciente a más antiguo.

---

## v0.7 — Ajustes y mejoras en las pantallas del entrenador
**Fecha:** 2026-03-02

### Formato de fechas y horas
- Creado `src/utils/dateUtils.js` con dos helpers reutilizables:
  - `formatDate('2026-03-08')` → `'08-03-2026'`
  - `formatTime('18:00')` → `'18.00'`
- Aplicado en todas las pantallas del entrenador donde se mostraba una fecha o una hora

### Base de datos
- Añadida columna `sexo TEXT` a la tabla `jugadores` mediante `ALTER TABLE` seguro (try/catch para no romper instalaciones existentes)
- `playerService` actualizado: `createPlayer()` y `updatePlayer()` incluyen el campo `sexo`
- `trainingService` actualizado: nueva función `updateTrainingStatus(id, estado)` para marcar un entrenamiento como `'realizado'`

### HomeCoachScreen
- Cards de acciones rápidas ahora tienen altura uniforme (`minHeight: 110`) — ya no hay inconsistencia de tamaños entre unas y otras
- Fecha y hora del próximo evento formateadas con los nuevos helpers

### Pantallas de jugadores
- **PlayerListScreen**: refresco automático al volver de crear un jugador (listener de foco); dorsal mostrado como badge independiente, sin solapamientos con el nombre
- **PlayerFormScreen**: nuevo campo de **Sexo** (Hombre / Mujer / Otro) entre el nombre y el dorsal; lista de posiciones ampliada a 13 opciones (se añaden Carrilero Derecho, Carrilero Izquierdo, Mediocentro Defensivo, Mediocentro, Líbero); selector de posición rediseñado como chips táctiles
- **PlayerDetailScreen**: fechas formateadas; campo sexo visible en la cabecera de la ficha

### Pantallas de partidos
- **MatchListScreen**: refresco automático al volver de crear un partido; textos con `numberOfLines` para evitar cortes; fechas y horas formateadas
- **MatchFormScreen**: modalidad **Fútbol playa** añadida a las opciones existentes
- **MatchDetailScreen**:
  - Pop-up de resultado rediseñado: `borderRadius: 8`, botón Cancelar rojo, botón Guardar verde
  - Estadísticas de jugadores en **dos pasos**: primero se selecciona el jugador de la lista, luego se rellena el formulario de estadísticas; se puede cancelar y volver a la lista sin perder el contexto
  - Pop-up de estadísticas con el mismo estilo cuadrado
  - Botón **"Guardar partido"** (verde) siempre visible para volver a la lista

### Pantallas de entrenamientos
- **TrainingListScreen**: refresco automático al volver; los entrenamientos marcados como `'realizado'` pasan automáticamente a la pestaña "Pasados" aunque su fecha sea futura; icono de check verde en entrenamientos realizados
- **TrainingDetailScreen**: nuevo botón **"Guardar entrenamiento"** (verde) que marca el entrenamiento como `'realizado'` y vuelve a la lista; cabecera cambia a borde verde y muestra badge "Realizado" cuando ya está completado; fechas y horas formateadas

---

## v0.6 — Pantallas CRUD del entrenador
**Fecha:** 2026-03-02

### Componentes reutilizables nuevos
- `EmptyState.js` — pantalla de estado vacío con icono, mensaje y botón de acción opcional
- `ConfirmDialog.js` — diálogo de confirmación reutilizable con modo destructivo (texto rojo)
- `StatBadge.js` — badge pequeño icono + número para mostrar estadísticas

### Nuevas pantallas del entrenador (`src/screens/coach/`)

| Pantalla | Qué hace |
|---|---|
| PlayerListScreen | Lista de la plantilla con buscador, contador de jugadores y opción de dar de baja |
| PlayerFormScreen | Formulario para crear o editar un jugador (posición, pie dominante, datos físicos) |
| PlayerDetailScreen | Ficha completa del jugador con estadísticas de temporada e historial de partidos |
| MatchListScreen | Lista de partidos separada en "Próximos" y "Jugados" con resultado y badge V/D/E |
| MatchFormScreen | Formulario para crear o editar un partido (tipo, modalidad, local/visitante, notas) |
| MatchDetailScreen | Detalle del partido con registro de resultado y estadísticas individuales por jugador |
| TrainingListScreen | Lista de entrenamientos separada en "Próximos" y "Pasados" con color por tipo |
| TrainingFormScreen | Formulario para crear o editar un entrenamiento (tipo, horario, descripción) |
| TrainingDetailScreen | Lista de asistencia con un switch por jugador y contador de asistentes |

### Servicios ampliados
- `matchService`: añadidos `getMatchById()` y `updateMatch()`
- `trainingService`: añadidos `getTrainingById()`, `updateTraining()` y `deleteTraining()`

### Navegación y HomeCoach
- `AppNavigator.js` ampliado con el stack completo del entrenador (9 pantallas), todos con header naranja
- `HomeCoachScreen.js`: acciones rápidas conectadas a las nuevas pantallas; FAB para crear partido nuevo

---

## v0.5 — Sistema de autenticación y sesión persistente
**Fecha:** 2026-03-01
**Commit:** `1c4f760`

- Implementado `AuthContext` con estado global de sesión: usuario, rol y equipo
- La sesión se guarda en el dispositivo con `expo-secure-store`: al cerrar y reabrir la app el usuario no tiene que volver a iniciar sesión
- `AppNavigator` refactorizado con flujo condicional completo: sin sesión → Login, sin rol → Selección de rol, con rol → pantalla Home correspondiente
- Login conectado a la base de datos real (validación contra SQLite)
- Pantalla de selección de rol guarda el rol elegido y carga los datos del perfil
- Todas las pantallas Home actualizadas para mostrar datos reales de la BD
- Botón de cierre de sesión en el header (limpia la sesión guardada en el dispositivo)
- Seed actualizado con usuarios de prueba para los tres roles

---

## v0.4 — Base de datos SQLite
**Fecha:** 2026-03-01
**Commit:** `e6b7db4`

- Integrada base de datos local con `expo-sqlite` 16 (API async)
- Creadas todas las tablas: usuarios, equipos, jugadores, partidos, estadísticas, entrenamientos, asistencia, torneos
- Script de datos demo con un equipo completo (FC Vallecas), 6 jugadores, 3 partidos, entrenamientos y estadísticas
- 7 servicios CRUD para operar con cada tabla desde cualquier pantalla
- 4 hooks para cargar datos de forma reactiva desde las pantallas
- La app inicializa la base de datos al arrancar antes de montar la navegación

---

## v0.3 — Refinamiento del fondo interactivo
**Fecha:** 2026-01-29
**Commit:** `9eb4017`

- Refinamiento del componente `AuroraBackground` (rendimiento y animación)
- Fondo interactivo aplicado también a la pantalla de selección de rol

---

## v0.2 — Fondo Aurora en la pantalla de login
**Fecha:** 2026-01-27
**Commit:** `b41c58f`

- Creado componente `AuroraBackground.js`: gradientes de color animados que reaccionan al toque del usuario
- `LoginScreen` rediseñado sobre fondo oscuro: textos blancos, inputs con borde translúcido, formulario con efecto cristal (glassmorphism)
- Instaladas dependencias `expo-linear-gradient` y `expo-blur`

---

## v0.1 — Primer commit: estructura base
**Fecha:** 2026-01-26
**Commit:** `fa77459`

- Estructura inicial del proyecto con Expo
- Navegación con React Navigation 7 (native-stack)
- Pantallas base creadas: Login, Selección de rol, Home Entrenador, Home Jugador, Home Aficionado
- Sistema de colores y tipografía en `src/theme/theme.js`
- Configuración inicial de dependencias
