/**
 * tournamentService.js — Operaciones CRUD para torneos y clasificación
 */

import { getDatabase } from '../database';

/**
 * Crea un nuevo torneo.
 * @param {{ nombre, tipo?, temporada?, fecha_inicio?, fecha_fin? }} data
 * @returns {Promise<number>} ID del torneo creado
 */
export async function createTournament(data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO torneos (nombre, tipo, temporada, fecha_inicio, fecha_fin)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.nombre,
        data.tipo ?? null,
        data.temporada ?? null,
        data.fecha_inicio ?? null,
        data.fecha_fin ?? null,
      ]
    );
    console.log(`[tournamentService] Torneo creado con ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[tournamentService] Error al crear torneo:', error);
    throw error;
  }
}

/**
 * Añade un equipo a un torneo con estadísticas iniciales.
 * @param {number} equipoId
 * @param {number} torneoId
 * @returns {Promise<number>} ID del registro equipo_torneo
 */
export async function addTeamToTournament(equipoId, torneoId) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO equipo_torneo (equipo_id, torneo_id)
       VALUES (?, ?)`,
      [equipoId, torneoId]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[tournamentService] Error al añadir equipo al torneo:', error);
    throw error;
  }
}

/**
 * Obtiene la clasificación completa de un torneo ordenada por puntos.
 * @param {number} torneoId
 * @returns {Promise<object[]>}
 */
export async function getTeamStandings(torneoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT et.*, e.nombre AS equipo_nombre, e.escudo_url,
              (et.goles_favor - et.goles_contra) AS diferencia_goles
       FROM equipo_torneo et
       INNER JOIN equipos e ON et.equipo_id = e.id
       WHERE et.torneo_id = ?
       ORDER BY et.puntos DESC,
                diferencia_goles DESC,
                et.goles_favor DESC`,
      [torneoId]
    );
  } catch (error) {
    console.error('[tournamentService] Error al obtener clasificación:', error);
    throw error;
  }
}

/**
 * Actualiza las estadísticas de un equipo en un torneo.
 * @param {number} id ID del registro equipo_torneo
 * @param {{ puntos?, partidos_jugados?, partidos_ganados?, partidos_empatados?,
 *           partidos_perdidos?, goles_favor?, goles_contra? }} data
 * @returns {Promise<number>} Filas afectadas
 */
export async function updateStandings(id, data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE equipo_torneo
       SET puntos             = COALESCE(?, puntos),
           partidos_jugados   = COALESCE(?, partidos_jugados),
           partidos_ganados   = COALESCE(?, partidos_ganados),
           partidos_empatados = COALESCE(?, partidos_empatados),
           partidos_perdidos  = COALESCE(?, partidos_perdidos),
           goles_favor        = COALESCE(?, goles_favor),
           goles_contra       = COALESCE(?, goles_contra)
       WHERE id = ?`,
      [
        data.puntos ?? null,
        data.partidos_jugados ?? null,
        data.partidos_ganados ?? null,
        data.partidos_empatados ?? null,
        data.partidos_perdidos ?? null,
        data.goles_favor ?? null,
        data.goles_contra ?? null,
        id,
      ]
    );
    console.log(`[tournamentService] Clasificación ${id} actualizada. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[tournamentService] Error al actualizar clasificación:', error);
    throw error;
  }
}
