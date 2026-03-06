/**
 * matchService.js — Operaciones CRUD para la tabla partidos
 */

import { getDatabase } from '../database';

/**
 * Crea un nuevo partido.
 * @param {{ equipo_id, rival, fecha, hora?, ubicacion?, tipo?, modalidad?,
 *           es_local?, goles_favor?, goles_contra?, estado?, notas? }} data
 * @returns {Promise<number>} ID del partido creado
 */
export async function createMatch(data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO partidos
         (equipo_id, rival, fecha, hora, ubicacion, tipo, modalidad,
          es_local, goles_favor, goles_contra, estado, notas, latitud, longitud)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.equipo_id,
        data.rival,
        data.fecha,
        data.hora ?? null,
        data.ubicacion ?? null,
        data.tipo ?? null,
        data.modalidad ?? null,
        data.es_local ?? 1,
        data.goles_favor ?? 0,
        data.goles_contra ?? 0,
        data.estado ?? 'programado',
        data.notas ?? null,
        data.latitud ?? null,
        data.longitud ?? null,
      ]
    );
    console.log(`[matchService] Partido creado con ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[matchService] Error al crear partido:', error);
    throw error;
  }
}

/**
 * Obtiene todos los partidos de un equipo ordenados por fecha descendente.
 * @param {number} equipoId
 * @returns {Promise<object[]>}
 */
export async function getMatchesByTeam(equipoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT * FROM partidos WHERE equipo_id = ? ORDER BY fecha DESC`,
      [equipoId]
    );
  } catch (error) {
    console.error('[matchService] Error al obtener partidos del equipo:', error);
    throw error;
  }
}

/**
 * Obtiene los próximos partidos programados de un equipo.
 * @param {number} equipoId
 * @returns {Promise<object[]>}
 */
export async function getUpcomingMatches(equipoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT * FROM partidos
       WHERE equipo_id = ?
         AND estado = 'programado'
         AND fecha >= date('now')
       ORDER BY fecha ASC`,
      [equipoId]
    );
  } catch (error) {
    console.error('[matchService] Error al obtener próximos partidos:', error);
    throw error;
  }
}

/**
 * Actualiza el resultado de un partido y lo marca como finalizado.
 * @param {number} id
 * @param {number} golesFavor
 * @param {number} golesContra
 * @returns {Promise<number>} Filas afectadas
 */
export async function updateMatchResult(id, golesFavor, golesContra) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE partidos
       SET goles_favor = ?, goles_contra = ?, estado = 'finalizado'
       WHERE id = ?`,
      [golesFavor, golesContra, id]
    );
    console.log(`[matchService] Resultado del partido ${id} actualizado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[matchService] Error al actualizar resultado:', error);
    throw error;
  }
}

/**
 * Obtiene un partido por su ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function getMatchById(id) {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync('SELECT * FROM partidos WHERE id = ?', [id]);
  } catch (error) {
    console.error('[matchService] Error al obtener partido:', error);
    throw error;
  }
}

/**
 * Actualiza los datos de un partido.
 * @param {number} id
 * @param {object} data Campos a actualizar
 * @returns {Promise<number>} Filas afectadas
 */
export async function updateMatch(id, data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE partidos
       SET rival      = COALESCE(?, rival),
           fecha      = COALESCE(?, fecha),
           hora       = COALESCE(?, hora),
           ubicacion  = COALESCE(?, ubicacion),
           tipo       = COALESCE(?, tipo),
           modalidad  = COALESCE(?, modalidad),
           es_local   = COALESCE(?, es_local),
           notas      = COALESCE(?, notas),
           latitud    = COALESCE(?, latitud),
           longitud   = COALESCE(?, longitud)
       WHERE id = ?`,
      [
        data.rival ?? null,
        data.fecha ?? null,
        data.hora ?? null,
        data.ubicacion ?? null,
        data.tipo ?? null,
        data.modalidad ?? null,
        data.es_local ?? null,
        data.notas ?? null,
        data.latitud ?? null,
        data.longitud ?? null,
        id,
      ]
    );
    console.log(`[matchService] Partido ${id} actualizado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[matchService] Error al actualizar partido:', error);
    throw error;
  }
}

/**
 * Elimina un partido por su ID.
 * @param {number} id
 * @returns {Promise<number>} Filas afectadas
 */
export async function deleteMatch(id) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync('DELETE FROM partidos WHERE id = ?', [id]);
    console.log(`[matchService] Partido ${id} eliminado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[matchService] Error al eliminar partido:', error);
    throw error;
  }
}
