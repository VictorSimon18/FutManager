/**
 * statsService.js — Operaciones CRUD para la tabla estadisticas_jugador
 */

import { getDatabase } from '../database';

/**
 * Crea un registro de estadísticas para un jugador en un partido.
 * @param {{ jugador_id, partido_id, minutos_jugados?, goles?, asistencias?,
 *           tarjetas_amarillas?, tarjetas_rojas?, titular?, valoracion? }} data
 * @returns {Promise<number>} ID del registro creado
 */
export async function createPlayerStats(data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO estadisticas_jugador
         (jugador_id, partido_id, minutos_jugados, goles, asistencias,
          tarjetas_amarillas, tarjetas_rojas, titular, valoracion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.jugador_id,
        data.partido_id,
        data.minutos_jugados ?? 0,
        data.goles ?? 0,
        data.asistencias ?? 0,
        data.tarjetas_amarillas ?? 0,
        data.tarjetas_rojas ?? 0,
        data.titular ?? 0,
        data.valoracion ?? null,
      ]
    );
    console.log(`[statsService] Estadística creada con ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[statsService] Error al crear estadística:', error);
    throw error;
  }
}

/**
 * Obtiene todas las estadísticas de un partido (con datos del jugador).
 * @param {number} partidoId
 * @returns {Promise<object[]>}
 */
export async function getStatsByMatch(partidoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT e.*, j.nombre, j.dorsal, j.posicion
       FROM estadisticas_jugador e
       INNER JOIN jugadores j ON e.jugador_id = j.id
       WHERE e.partido_id = ?
       ORDER BY j.dorsal ASC`,
      [partidoId]
    );
  } catch (error) {
    console.error('[statsService] Error al obtener estadísticas del partido:', error);
    throw error;
  }
}

/**
 * Obtiene todas las estadísticas de un jugador (con datos del partido).
 * @param {number} jugadorId
 * @returns {Promise<object[]>}
 */
export async function getStatsByPlayer(jugadorId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT e.*, p.rival, p.fecha, p.tipo, p.goles_favor, p.goles_contra
       FROM estadisticas_jugador e
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE e.jugador_id = ?
       ORDER BY p.fecha DESC`,
      [jugadorId]
    );
  } catch (error) {
    console.error('[statsService] Error al obtener estadísticas del jugador:', error);
    throw error;
  }
}

/**
 * Obtiene las estadísticas acumuladas de una temporada para un jugador.
 * @param {number} jugadorId
 * @returns {Promise<object|null>} Objeto con totales acumulados
 */
export async function getSeasonStats(jugadorId) {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync(
      `SELECT
         COUNT(*)                    AS partidos_jugados,
         SUM(minutos_jugados)        AS total_minutos,
         SUM(goles)                  AS total_goles,
         SUM(asistencias)            AS total_asistencias,
         SUM(tarjetas_amarillas)     AS total_amarillas,
         SUM(tarjetas_rojas)         AS total_rojas,
         SUM(titular)                AS veces_titular,
         AVG(valoracion)             AS valoracion_media
       FROM estadisticas_jugador
       WHERE jugador_id = ?`,
      [jugadorId]
    );
  } catch (error) {
    console.error('[statsService] Error al obtener estadísticas de temporada:', error);
    throw error;
  }
}

/**
 * Actualiza un registro de estadísticas.
 * @param {number} id
 * @param {object} data Campos a actualizar
 * @returns {Promise<number>} Filas afectadas
 */
export async function updateStats(id, data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE estadisticas_jugador
       SET minutos_jugados    = COALESCE(?, minutos_jugados),
           goles              = COALESCE(?, goles),
           asistencias        = COALESCE(?, asistencias),
           tarjetas_amarillas = COALESCE(?, tarjetas_amarillas),
           tarjetas_rojas     = COALESCE(?, tarjetas_rojas),
           titular            = COALESCE(?, titular),
           valoracion         = COALESCE(?, valoracion)
       WHERE id = ?`,
      [
        data.minutos_jugados ?? null,
        data.goles ?? null,
        data.asistencias ?? null,
        data.tarjetas_amarillas ?? null,
        data.tarjetas_rojas ?? null,
        data.titular ?? null,
        data.valoracion ?? null,
        id,
      ]
    );
    console.log(`[statsService] Estadística ${id} actualizada. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[statsService] Error al actualizar estadística:', error);
    throw error;
  }
}
