/**
 * fanService.js — Queries específicas para el rol aficionado (solo lectura)
 */

import { getDatabase } from '../database';

/**
 * Obtiene los máximos goleadores del equipo ordenados por goles totales.
 * @param {number} equipoId
 * @param {number} [limit=10]
 * @returns {Promise<object[]>}
 */
export async function getTopScorers(equipoId, limit = 10) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT j.id, j.nombre, j.posicion, j.dorsal, j.foto_url,
              SUM(e.goles)         AS total_goles,
              SUM(e.asistencias)   AS total_asistencias,
              COUNT(e.id)          AS partidos_jugados
       FROM estadisticas_jugador e
       INNER JOIN jugadores j ON e.jugador_id = j.id
       WHERE j.equipo_id = ? AND j.activo = 1
       GROUP BY j.id
       HAVING total_goles > 0
       ORDER BY total_goles DESC, total_asistencias DESC
       LIMIT ?`,
      [equipoId, limit]
    );
  } catch (error) {
    console.error('[fanService] Error al obtener máximos goleadores:', error);
    throw error;
  }
}

/**
 * Obtiene el top de jugadores por asistencias del equipo.
 * @param {number} equipoId
 * @param {number} [limit=5]
 * @returns {Promise<object[]>}
 */
export async function getTopAssisters(equipoId, limit = 5) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT j.id, j.nombre, j.posicion, j.dorsal,
              SUM(e.asistencias) AS total_asistencias
       FROM estadisticas_jugador e
       INNER JOIN jugadores j ON e.jugador_id = j.id
       WHERE j.equipo_id = ? AND j.activo = 1
       GROUP BY j.id
       HAVING total_asistencias > 0
       ORDER BY total_asistencias DESC
       LIMIT ?`,
      [equipoId, limit]
    );
  } catch (error) {
    console.error('[fanService] Error al obtener máximos asistentes:', error);
    throw error;
  }
}
