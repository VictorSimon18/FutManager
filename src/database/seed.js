/**
 * seed.js — Datos de ejemplo para desarrollo
 * Inserta datos solo si la base de datos está vacía.
 */

import { getDatabase } from './database';
import { createTeam } from './services/teamService';
import { createUser } from './services/userService';
import { createPlayer } from './services/playerService';
import { createMatch, updateMatchResult } from './services/matchService';
import { createPlayerStats } from './services/statsService';
import { createTraining } from './services/trainingService';
import { createTournament, addTeamToTournament, updateStandings } from './services/tournamentService';

/**
 * Comprueba si ya hay datos en la base de datos.
 * @returns {Promise<boolean>}
 */
async function isDatabaseEmpty() {
  const db = await getDatabase();
  const result = await db.getFirstAsync('SELECT COUNT(*) AS total FROM equipos');
  return result.total === 0;
}

/**
 * Inserta datos de prueba en la base de datos.
 * Solo se ejecuta si la BD está vacía.
 */
export async function seedDatabase() {
  const empty = await isDatabaseEmpty();
  if (!empty) {
    console.log('[Seed] La base de datos ya tiene datos. Omitiendo seed.');
    return;
  }

  console.log('[Seed] Insertando datos de ejemplo...');

  // ── Equipo ──────────────────────────────────────────────────────────────────
  const equipoId = await createTeam({
    nombre: 'FC Vallecas',
    categoria: 'Senior',
    modalidad: '11 vs 11',
    temporada: '2025/2026',
    escudo_url: null,
  });

  // ── Usuario entrenador ───────────────────────────────────────────────────────
  const entrenadorUserId = await createUser({
    nombre: 'Carlos Martínez',
    email: 'carlos@futmanager.es',
    // TODO: Implementar hash real con bcrypt en producción
    password_hash: '123456',
  });

  // Registrar al entrenador en su tabla
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO entrenadores (usuario_id, equipo_id, licencia, telefono)
     VALUES (?, ?, ?, ?)`,
    [entrenadorUserId, equipoId, 'UEFA B', '612 345 678']
  );

  // ── Jugadores ────────────────────────────────────────────────────────────────
  const jugadoresData = [
    { nombre: 'Alejandro Ruiz',   dorsal: 1,  posicion: 'Portero',        fecha_nacimiento: '1995-03-12', altura: 1.88, peso: 82, pie_dominante: 'derecho' },
    { nombre: 'Miguel Fernández', dorsal: 5,  posicion: 'Defensa Central', fecha_nacimiento: '1998-07-22', altura: 1.83, peso: 78, pie_dominante: 'derecho' },
    { nombre: 'Sergio García',    dorsal: 8,  posicion: 'Centrocampista',  fecha_nacimiento: '2000-11-05', altura: 1.76, peso: 72, pie_dominante: 'derecho' },
    { nombre: 'Pablo López',      dorsal: 10, posicion: 'Mediapunta',      fecha_nacimiento: '1999-01-18', altura: 1.74, peso: 70, pie_dominante: 'izquierdo' },
    { nombre: 'David Sánchez',    dorsal: 9,  posicion: 'Delantero',       fecha_nacimiento: '1997-09-30', altura: 1.80, peso: 75, pie_dominante: 'derecho' },
    { nombre: 'Raúl Torres',      dorsal: 11, posicion: 'Extremo Derecho', fecha_nacimiento: '2001-04-14', altura: 1.72, peso: 68, pie_dominante: 'derecho' },
  ];

  const jugadorIds = [];
  for (const jugador of jugadoresData) {
    const id = await createPlayer({ ...jugador, equipo_id: equipoId });
    jugadorIds.push(id);
  }

  // ── Usuario jugador de prueba (vinculado a Pablo López, dorsal 10) ───────────
  const jugadorUserId = await createUser({
    nombre: 'Pablo López',
    email: 'jugador@futmanager.es',
    // TODO: Implementar hash real con bcrypt en producción
    password_hash: '123456',
  });
  // Vincular el usuario al jugador Pablo López (índice 3 en jugadoresData)
  await db.runAsync(
    'UPDATE jugadores SET usuario_id = ? WHERE id = ?',
    [jugadorUserId, jugadorIds[3]]
  );

  // ── Usuario aficionado de prueba ─────────────────────────────────────────────
  const fanUserId = await createUser({
    nombre: 'María García',
    email: 'fan@futmanager.es',
    // TODO: Implementar hash real con bcrypt en producción
    password_hash: '123456',
  });
  await db.runAsync(
    'INSERT INTO aficionados (usuario_id, equipo_id) VALUES (?, ?)',
    [fanUserId, equipoId]
  );

  // ── Partidos ─────────────────────────────────────────────────────────────────
  // Partido pasado (finalizado)
  const partido1Id = await createMatch({
    equipo_id: equipoId,
    rival: 'AD Villaverde',
    fecha: '2026-02-15',
    hora: '18:00',
    ubicacion: 'Campo Municipal Vallecas',
    tipo: 'liga',
    modalidad: '11 vs 11',
    es_local: 1,
    estado: 'programado',
  });
  await updateMatchResult(partido1Id, 3, 1);

  // Partido pasado (finalizado, derrota)
  const partido2Id = await createMatch({
    equipo_id: equipoId,
    rival: 'SD Retiro',
    fecha: '2026-02-22',
    hora: '12:00',
    ubicacion: 'Campo del Retiro',
    tipo: 'liga',
    modalidad: '11 vs 11',
    es_local: 0,
    estado: 'programado',
  });
  await updateMatchResult(partido2Id, 1, 2);

  // Próximo partido (programado)
  await createMatch({
    equipo_id: equipoId,
    rival: 'CF Leganés B',
    fecha: '2026-03-08',
    hora: '17:00',
    ubicacion: 'Campo Municipal Vallecas',
    tipo: 'liga',
    modalidad: '11 vs 11',
    es_local: 1,
  });

  // ── Estadísticas del partido 1 ───────────────────────────────────────────────
  const statsPartido1 = [
    { jugador_id: jugadorIds[0], partido_id: partido1Id, minutos_jugados: 90, goles: 0, asistencias: 0, titular: 1, valoracion: 7.5 },
    { jugador_id: jugadorIds[1], partido_id: partido1Id, minutos_jugados: 90, goles: 0, asistencias: 1, titular: 1, valoracion: 7.0 },
    { jugador_id: jugadorIds[2], partido_id: partido1Id, minutos_jugados: 85, goles: 1, asistencias: 1, titular: 1, valoracion: 8.0 },
    { jugador_id: jugadorIds[3], partido_id: partido1Id, minutos_jugados: 90, goles: 1, asistencias: 0, titular: 1, valoracion: 8.5 },
    { jugador_id: jugadorIds[4], partido_id: partido1Id, minutos_jugados: 90, goles: 1, asistencias: 0, titular: 1, valoracion: 7.8 },
    { jugador_id: jugadorIds[5], partido_id: partido1Id, minutos_jugados: 70, goles: 0, asistencias: 1, titular: 1, valoracion: 7.2 },
  ];
  for (const stat of statsPartido1) {
    await createPlayerStats(stat);
  }

  // Estadísticas del partido 2
  const statsPartido2 = [
    { jugador_id: jugadorIds[0], partido_id: partido2Id, minutos_jugados: 90, goles: 0, asistencias: 0, titular: 1, valoracion: 6.0 },
    { jugador_id: jugadorIds[4], partido_id: partido2Id, minutos_jugados: 90, goles: 1, asistencias: 0, titular: 1, valoracion: 7.0 },
    { jugador_id: jugadorIds[3], partido_id: partido2Id, minutos_jugados: 90, goles: 0, asistencias: 1, tarjetas_amarillas: 1, titular: 1, valoracion: 6.5 },
  ];
  for (const stat of statsPartido2) {
    await createPlayerStats(stat);
  }

  // ── Entrenamientos ───────────────────────────────────────────────────────────
  await createTraining({
    equipo_id: equipoId,
    fecha: '2026-03-04',
    hora_inicio: '19:00',
    hora_fin: '21:00',
    ubicacion: 'Campo Municipal Vallecas',
    tipo: 'Técnico-táctico',
    descripcion: 'Trabajo de presión alta y salida de balón desde portería.',
  });

  await createTraining({
    equipo_id: equipoId,
    fecha: '2026-03-06',
    hora_inicio: '19:00',
    hora_fin: '21:00',
    ubicacion: 'Campo Municipal Vallecas',
    tipo: 'Preparación de partido',
    descripcion: 'Ensayo del sistema contra CF Leganés B. Estrategia a balón parado.',
  });

  // ── Torneo ───────────────────────────────────────────────────────────────────
  const torneoId = await createTournament({
    nombre: 'Liga Regional Madrid Amateur',
    tipo: 'liga',
    temporada: '2025/2026',
    fecha_inicio: '2025-09-01',
    fecha_fin: '2026-06-30',
  });

  // Añadir nuestro equipo al torneo
  const etId = await addTeamToTournament(equipoId, torneoId);
  await updateStandings(etId, {
    puntos: 22,
    partidos_jugados: 9,
    partidos_ganados: 7,
    partidos_empatados: 1,
    partidos_perdidos: 1,
    goles_favor: 24,
    goles_contra: 8,
  });

  // Equipos rivales de ejemplo en la clasificación
  const rivales = [
    { nombre: 'AD Villaverde', gf: 20, gc: 10, pj: 9, pg: 6, pe: 1, pp: 2, pts: 19 },
    { nombre: 'SD Retiro',     gf: 15, gc: 12, pj: 9, pg: 5, pe: 2, pp: 2, pts: 17 },
    { nombre: 'CF Leganés B',  gf: 12, gc: 14, pj: 9, pg: 3, pe: 2, pp: 4, pts: 11 },
  ];

  for (const rival of rivales) {
    const rId = await createTeam({
      nombre: rival.nombre,
      categoria: 'Senior',
      modalidad: '11 vs 11',
      temporada: '2025/2026',
    });
    const retId = await addTeamToTournament(rId, torneoId);
    await updateStandings(retId, {
      puntos: rival.pts,
      partidos_jugados: rival.pj,
      partidos_ganados: rival.pg,
      partidos_empatados: rival.pe,
      partidos_perdidos: rival.pp,
      goles_favor: rival.gf,
      goles_contra: rival.gc,
    });
  }

  console.log('[Seed] Datos de ejemplo insertados correctamente.');
  // Devolvemos el ID del equipo principal por si se necesita en la app
  return { equipoId, entrenadorUserId };
}
