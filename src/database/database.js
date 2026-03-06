/**
 * database.js — Conexión principal a SQLite y definición del esquema
 * Usa la API moderna asíncrona de expo-sqlite (openDatabaseAsync)
 */

import * as SQLite from 'expo-sqlite';

// Instancia singleton de la base de datos
let db = null;

/**
 * Obtiene la instancia de la base de datos, creándola si no existe.
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('futmanager.db');
    // Activar claves foráneas en cada nueva conexión
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }
  return db;
}

/**
 * Inicializa la base de datos creando todas las tablas si no existen.
 * Debe llamarse al arrancar la aplicación.
 */
export async function initDatabase() {
  console.log('[DB] Inicializando base de datos...');
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    -- Usuarios base (todos los roles)
    CREATE TABLE IF NOT EXISTS usuarios (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre           TEXT    NOT NULL,
      email            TEXT    UNIQUE NOT NULL,
      password_hash    TEXT    NOT NULL,
      fecha_registro   TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    -- Equipos
    CREATE TABLE IF NOT EXISTS equipos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre          TEXT    NOT NULL,
      categoria       TEXT,
      modalidad       TEXT,
      temporada       TEXT,
      escudo_url      TEXT,
      fecha_creacion  TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    -- Entrenadores (relación usuario ↔ equipo)
    CREATE TABLE IF NOT EXISTS entrenadores (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      equipo_id   INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
      licencia    TEXT,
      telefono    TEXT
    );

    -- Jugadores
    CREATE TABLE IF NOT EXISTS jugadores (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id       INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      equipo_id        INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
      nombre           TEXT    NOT NULL,
      dorsal           INTEGER,
      posicion         TEXT,
      fecha_nacimiento TEXT,
      altura           REAL,
      peso             REAL,
      pie_dominante    TEXT,
      foto_url         TEXT,
      activo           INTEGER DEFAULT 1
    );

    -- Aficionados
    CREATE TABLE IF NOT EXISTS aficionados (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      equipo_id   INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE
    );

    -- Partidos
    CREATE TABLE IF NOT EXISTS partidos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      equipo_id     INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
      rival         TEXT    NOT NULL,
      fecha         TEXT    NOT NULL,
      hora          TEXT,
      ubicacion     TEXT,
      tipo          TEXT    CHECK(tipo IN ('liga', 'copa', 'amistoso', 'torneo')),
      modalidad     TEXT,
      es_local      INTEGER DEFAULT 1,
      goles_favor   INTEGER DEFAULT 0,
      goles_contra  INTEGER DEFAULT 0,
      estado        TEXT    DEFAULT 'programado'
                            CHECK(estado IN ('programado', 'en_curso', 'finalizado', 'suspendido')),
      notas         TEXT
    );

    -- Estadísticas por jugador y partido
    CREATE TABLE IF NOT EXISTS estadisticas_jugador (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      jugador_id          INTEGER NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
      partido_id          INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      minutos_jugados     INTEGER DEFAULT 0,
      goles               INTEGER DEFAULT 0,
      asistencias         INTEGER DEFAULT 0,
      tarjetas_amarillas  INTEGER DEFAULT 0,
      tarjetas_rojas      INTEGER DEFAULT 0,
      titular             INTEGER DEFAULT 0,
      valoracion          REAL
    );

    -- Entrenamientos
    CREATE TABLE IF NOT EXISTS entrenamientos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      equipo_id   INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
      fecha       TEXT    NOT NULL,
      hora_inicio TEXT,
      hora_fin    TEXT,
      ubicacion   TEXT,
      tipo        TEXT,
      descripcion TEXT,
      estado      TEXT    DEFAULT 'programado'
    );

    -- Asistencia a entrenamientos
    CREATE TABLE IF NOT EXISTS asistencia_entrenamiento (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      entrenamiento_id  INTEGER NOT NULL REFERENCES entrenamientos(id) ON DELETE CASCADE,
      jugador_id        INTEGER NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
      asistio           INTEGER DEFAULT 0,
      nota              TEXT
    );

    -- Torneos
    CREATE TABLE IF NOT EXISTS torneos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre       TEXT    NOT NULL,
      tipo         TEXT,
      temporada    TEXT,
      fecha_inicio TEXT,
      fecha_fin    TEXT
    );

    -- Clasificación equipo en torneo
    CREATE TABLE IF NOT EXISTS equipo_torneo (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      equipo_id           INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
      torneo_id           INTEGER NOT NULL REFERENCES torneos(id) ON DELETE CASCADE,
      puntos              INTEGER DEFAULT 0,
      partidos_jugados    INTEGER DEFAULT 0,
      partidos_ganados    INTEGER DEFAULT 0,
      partidos_empatados  INTEGER DEFAULT 0,
      partidos_perdidos   INTEGER DEFAULT 0,
      goles_favor         INTEGER DEFAULT 0,
      goles_contra        INTEGER DEFAULT 0
    );
  `);

  // Añadir columna sexo a jugadores si no existe (migración segura)
  try {
    await database.execAsync(`ALTER TABLE jugadores ADD COLUMN sexo TEXT;`);
    console.log('[DB] Columna sexo añadida a jugadores.');
  } catch {
    // La columna ya existe — ignorar el error
  }

  // Nuevos campos de estadísticas individuales por partido (migración segura)
  const nuevasCols = [
    'paradas INTEGER DEFAULT 0',
    'despejes INTEGER DEFAULT 0',
    'entradas INTEGER DEFAULT 0',
    'pases_clave INTEGER DEFAULT 0',
    'tiros_puerta INTEGER DEFAULT 0',
    'tiros_fuera INTEGER DEFAULT 0',
    'faltas_cometidas INTEGER DEFAULT 0',
    'faltas_recibidas INTEGER DEFAULT 0',
    'fueras_juego INTEGER DEFAULT 0',
  ];
  for (const colDef of nuevasCols) {
    try {
      await database.execAsync(
        `ALTER TABLE estadisticas_jugador ADD COLUMN ${colDef};`
      );
      console.log(`[DB] Columna añadida a estadisticas_jugador: ${colDef.split(' ')[0]}`);
    } catch {
      // La columna ya existe — ignorar el error
    }
  }

  // Columnas de coordenadas para partidos (migración segura)
  const colsPartidos = [
    'latitud REAL',
    'longitud REAL',
  ];
  for (const colDef of colsPartidos) {
    try {
      await database.execAsync(`ALTER TABLE partidos ADD COLUMN ${colDef};`);
      console.log(`[DB] Columna añadida a partidos: ${colDef.split(' ')[0]}`);
    } catch {
      // La columna ya existe — ignorar el error
    }
  }

  console.log('[DB] Base de datos inicializada correctamente.');
}
