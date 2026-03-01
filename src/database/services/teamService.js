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
       SET nombre = COALESCE(?, nombre),
           categoria = COALESCE(?, categoria),
           modalidad = COALESCE(?, modalidad),
           temporada = COALESCE(?, temporada),
           escudo_url = COALESCE(?, escudo_url)
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
