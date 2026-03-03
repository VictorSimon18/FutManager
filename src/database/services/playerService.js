/**
 * playerService.js — Operaciones CRUD para la tabla jugadores
 */

import { getDatabase } from '../database';

/**
 * Crea un nuevo jugador.
 * @param {{ usuario_id?, equipo_id, nombre, sexo?, dorsal?, posicion?, fecha_nacimiento?,
 *           altura?, peso?, pie_dominante?, foto_url?, activo? }} data
 * @returns {Promise<number>} ID del jugador creado
 */
export async function createPlayer(data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO jugadores
         (usuario_id, equipo_id, nombre, sexo, dorsal, posicion,
          fecha_nacimiento, altura, peso, pie_dominante, foto_url, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.usuario_id ?? null,
        data.equipo_id,
        data.nombre,
        data.sexo ?? null,
        data.dorsal ?? null,
        data.posicion ?? null,
        data.fecha_nacimiento ?? null,
        data.altura ?? null,
        data.peso ?? null,
        data.pie_dominante ?? null,
        data.foto_url ?? null,
        data.activo ?? 1,
      ]
    );
    console.log(`[playerService] Jugador creado con ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[playerService] Error al crear jugador:', error);
    throw error;
  }
}

/**
 * Obtiene todos los jugadores de un equipo.
 * @param {number} equipoId
 * @returns {Promise<object[]>}
 */
export async function getPlayersByTeam(equipoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT * FROM jugadores
       WHERE equipo_id = ? AND activo = 1
       ORDER BY
         CASE posicion
           WHEN 'Portero'               THEN 1
           WHEN 'Defensa Central'       THEN 10
           WHEN 'Lateral Derecho'       THEN 11
           WHEN 'Lateral Izquierdo'     THEN 12
           WHEN 'Carrilero Derecho'     THEN 13
           WHEN 'Carrilero Izquierdo'   THEN 14
           WHEN 'Líbero'                THEN 19
           WHEN 'Mediocentro Defensivo' THEN 20
           WHEN 'Mediocentro'           THEN 21
           WHEN 'Mediapunta'            THEN 22
           WHEN 'Extremo Izquierdo'     THEN 30
           WHEN 'Extremo Derecho'       THEN 31
           WHEN 'Delantero'             THEN 32
           ELSE 99
         END,
         dorsal ASC`,
      [equipoId]
    );
  } catch (error) {
    console.error('[playerService] Error al obtener jugadores del equipo:', error);
    throw error;
  }
}

/**
 * Obtiene un jugador por su ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function getPlayerById(id) {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync('SELECT * FROM jugadores WHERE id = ?', [id]);
  } catch (error) {
    console.error('[playerService] Error al obtener jugador:', error);
    throw error;
  }
}

/**
 * Actualiza los datos de un jugador.
 * @param {number} id
 * @param {object} data Campos a actualizar
 * @returns {Promise<number>} Filas afectadas
 */
export async function updatePlayer(id, data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE jugadores
       SET usuario_id       = COALESCE(?, usuario_id),
           equipo_id        = COALESCE(?, equipo_id),
           nombre           = COALESCE(?, nombre),
           sexo             = COALESCE(?, sexo),
           dorsal           = COALESCE(?, dorsal),
           posicion         = COALESCE(?, posicion),
           fecha_nacimiento = COALESCE(?, fecha_nacimiento),
           altura           = COALESCE(?, altura),
           peso             = COALESCE(?, peso),
           pie_dominante    = COALESCE(?, pie_dominante),
           foto_url         = COALESCE(?, foto_url),
           activo           = COALESCE(?, activo)
       WHERE id = ?`,
      [
        data.usuario_id ?? null,
        data.equipo_id ?? null,
        data.nombre ?? null,
        data.sexo ?? null,
        data.dorsal ?? null,
        data.posicion ?? null,
        data.fecha_nacimiento ?? null,
        data.altura ?? null,
        data.peso ?? null,
        data.pie_dominante ?? null,
        data.foto_url ?? null,
        data.activo ?? null,
        id,
      ]
    );
    console.log(`[playerService] Jugador ${id} actualizado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[playerService] Error al actualizar jugador:', error);
    throw error;
  }
}

/**
 * Marca un jugador como inactivo (baja lógica).
 * @param {number} id
 * @returns {Promise<number>} Filas afectadas
 */
export async function deletePlayer(id) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'UPDATE jugadores SET activo = 0 WHERE id = ?',
      [id]
    );
    console.log(`[playerService] Jugador ${id} desactivado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[playerService] Error al eliminar jugador:', error);
    throw error;
  }
}

/**
 * Obtiene las estadísticas de todos los partidos de un jugador.
 * @param {number} jugadorId
 * @returns {Promise<object[]>}
 */
export async function getPlayerStats(jugadorId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT e.*, p.rival, p.fecha, p.tipo
       FROM estadisticas_jugador e
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE e.jugador_id = ?
       ORDER BY p.fecha DESC`,
      [jugadorId]
    );
  } catch (error) {
    console.error('[playerService] Error al obtener estadísticas del jugador:', error);
    throw error;
  }
}
