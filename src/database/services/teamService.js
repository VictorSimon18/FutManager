/**
 * teamService.js — Operaciones CRUD para la tabla equipos
 */

import { getDatabase } from '../database';

/**
 * Crea un nuevo equipo.
 * @param {{ nombre, categoria, modalidad, temporada, escudo_url }} data
 * @returns {Promise<number>} ID del equipo creado
 */
export async function createTeam(data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO equipos (nombre, categoria, modalidad, temporada, escudo_url)
       VALUES (?, ?, ?, ?, ?)`,
      [data.nombre, data.categoria ?? null, data.modalidad ?? null,
       data.temporada ?? null, data.escudo_url ?? null]
    );
    console.log(`[teamService] Equipo creado con ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[teamService] Error al crear equipo:', error);
    throw error;
  }
}

/**
 * Obtiene un equipo por su ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function getTeamById(id) {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync('SELECT * FROM equipos WHERE id = ?', [id]);
  } catch (error) {
    console.error('[teamService] Error al obtener equipo:', error);
    throw error;
  }
}

/**
 * Obtiene todos los equipos.
 * @returns {Promise<object[]>}
 */
export async function getAllTeams() {
  try {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM equipos ORDER BY nombre ASC');
  } catch (error) {
    console.error('[teamService] Error al obtener equipos:', error);
    throw error;
  }
}

/**
 * Actualiza los datos de un equipo.
 * @param {number} id
 * @param {{ nombre?, categoria?, modalidad?, temporada?, escudo_url? }} data
 * @returns {Promise<number>} Filas afectadas
 */
export async function updateTeam(id, data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE equipos
       SET nombre     = ?,
           categoria  = ?,
           modalidad  = ?,
           temporada  = ?,
           escudo_url = ?
       WHERE id = ?`,
      [data.nombre ?? null, data.categoria ?? null, data.modalidad ?? null,
       data.temporada ?? null, data.escudo_url ?? null, id]
    );
    console.log(`[teamService] Equipo ${id} actualizado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[teamService] Error al actualizar equipo:', error);
    throw error;
  }
}

/**
 * Obtiene todos los equipos en los que un jugador (usuario) tiene ficha activa.
 * @param {number} userId
 * @returns {Promise<object[]>}
 */
export async function getTeamsByPlayerUserId(userId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT e.*
       FROM equipos e
       INNER JOIN jugadores j ON j.equipo_id = e.id
       WHERE j.usuario_id = ? AND j.activo = 1
       ORDER BY e.nombre ASC`,
      [userId]
    );
  } catch (error) {
    console.error('[teamService] Error al obtener equipos del jugador:', error);
    throw error;
  }
}

/**
 * Obtiene todos los equipos asociados a un entrenador (usuario).
 * @param {number} userId
 * @returns {Promise<object[]>}
 */
export async function getTeamsByCoachUserId(userId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT e.*
       FROM equipos e
       INNER JOIN entrenadores en ON en.equipo_id = e.id
       WHERE en.usuario_id = ?
       ORDER BY e.nombre ASC`,
      [userId]
    );
  } catch (error) {
    console.error('[teamService] Error al obtener equipos del entrenador:', error);
    throw error;
  }
}

/**
 * Vincula un entrenador (usuario) a un equipo existente.
 * Si ya existe el vínculo, devuelve el id existente sin duplicar.
 * @param {number} userId
 * @param {number} equipoId
 * @returns {Promise<number>} ID del registro en entrenadores
 */
export async function linkCoachToTeam(userId, equipoId) {
  try {
    const db = await getDatabase();
    const existing = await db.getFirstAsync(
      'SELECT id FROM entrenadores WHERE usuario_id = ? AND equipo_id = ?',
      [userId, equipoId]
    );
    if (existing) return existing.id;
    const result = await db.runAsync(
      'INSERT INTO entrenadores (usuario_id, equipo_id) VALUES (?, ?)',
      [userId, equipoId]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[teamService] Error al vincular entrenador con equipo:', error);
    throw error;
  }
}

/**
 * Elimina un equipo por su ID.
 * @param {number} id
 * @returns {Promise<number>} Filas afectadas
 */
export async function deleteTeam(id) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync('DELETE FROM equipos WHERE id = ?', [id]);
    console.log(`[teamService] Equipo ${id} eliminado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[teamService] Error al eliminar equipo:', error);
    throw error;
  }
}
