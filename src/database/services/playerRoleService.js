/**
 * playerRoleService.js — Queries específicas para el rol jugador (solo lectura)
 */

import { getDatabase } from '../database';

/**
 * Obtiene los partidos del equipo donde el jugador participó, con sus stats individuales.
 * @param {number} jugadorId
 * @returns {Promise<object[]>}
 */
export async function getPlayerMatchHistory(jugadorId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT e.*, p.rival, p.fecha, p.hora, p.ubicacion, p.tipo,
              p.goles_favor, p.goles_contra, p.estado, p.es_local
       FROM estadisticas_jugador e
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE e.jugador_id = ?
       ORDER BY p.fecha DESC`,
      [jugadorId]
    );
  } catch (error) {
    console.error('[playerRoleService] Error al obtener historial de partidos:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de asistencia del jugador a entrenamientos con datos del entrenamiento.
 * @param {number} jugadorId
 * @returns {Promise<object[]>}
 */
export async function getPlayerTrainingHistory(jugadorId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT ae.asistio, ae.nota,
              en.id AS entrenamiento_id, en.fecha, en.hora_inicio, en.hora_fin,
              en.tipo, en.descripcion, en.ubicacion, en.estado
       FROM asistencia_entrenamiento ae
       INNER JOIN entrenamientos en ON ae.entrenamiento_id = en.id
       WHERE ae.jugador_id = ?
       ORDER BY en.fecha DESC`,
      [jugadorId]
    );
  } catch (error) {
    console.error('[playerRoleService] Error al obtener historial de entrenamientos:', error);
    throw error;
  }
}

/**
 * Obtiene el torneo activo del equipo y la clasificación completa.
 * @param {number} equipoId
 * @returns {Promise<{torneo: object, standings: object[], myEquipoId: number}|null>}
 */
export async function getTeamTournamentStandings(equipoId) {
  try {
    const db = await getDatabase();
    // Obtener el torneo vinculado al equipo
    const teamTournament = await db.getFirstAsync(
      `SELECT et.torneo_id FROM equipo_torneo et WHERE et.equipo_id = ? LIMIT 1`,
      [equipoId]
    );
    if (!teamTournament) return null;

    const torneoId = teamTournament.torneo_id;
    const torneo = await db.getFirstAsync(
      `SELECT * FROM torneos WHERE id = ?`,
      [torneoId]
    );
    const standings = await db.getAllAsync(
      `SELECT et.*, e.nombre AS equipo_nombre,
              (et.goles_favor - et.goles_contra) AS diferencia_goles
       FROM equipo_torneo et
       INNER JOIN equipos e ON et.equipo_id = e.id
       WHERE et.torneo_id = ?
       ORDER BY et.puntos DESC, diferencia_goles DESC, et.goles_favor DESC`,
      [torneoId]
    );
    return { torneo, standings, myEquipoId: equipoId };
  } catch (error) {
    console.error('[playerRoleService] Error al obtener clasificación del torneo:', error);
    throw error;
  }
}
