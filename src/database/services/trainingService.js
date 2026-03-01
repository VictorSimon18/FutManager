/**
 * trainingService.js — Operaciones CRUD para entrenamientos y asistencia
 */

import { getDatabase } from '../database';

/**
 * Crea un nuevo entrenamiento.
 * @param {{ equipo_id, fecha, hora_inicio?, hora_fin?, ubicacion?,
 *           tipo?, descripcion?, estado? }} data
 * @returns {Promise<number>} ID del entrenamiento creado
 */
export async function createTraining(data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO entrenamientos
         (equipo_id, fecha, hora_inicio, hora_fin, ubicacion, tipo, descripcion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.equipo_id,
        data.fecha,
        data.hora_inicio ?? null,
        data.hora_fin ?? null,
        data.ubicacion ?? null,
        data.tipo ?? null,
        data.descripcion ?? null,
        data.estado ?? 'programado',
      ]
    );
    console.log(`[trainingService] Entrenamiento creado con ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[trainingService] Error al crear entrenamiento:', error);
    throw error;
  }
}

/**
 * Obtiene todos los entrenamientos de un equipo.
 * @param {number} equipoId
 * @returns {Promise<object[]>}
 */
export async function getTrainingsByTeam(equipoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT * FROM entrenamientos WHERE equipo_id = ? ORDER BY fecha DESC`,
      [equipoId]
    );
  } catch (error) {
    console.error('[trainingService] Error al obtener entrenamientos:', error);
    throw error;
  }
}

/**
 * Obtiene los próximos entrenamientos programados de un equipo.
 * @param {number} equipoId
 * @returns {Promise<object[]>}
 */
export async function getUpcomingTrainings(equipoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT * FROM entrenamientos
       WHERE equipo_id = ?
         AND estado = 'programado'
         AND fecha >= date('now')
       ORDER BY fecha ASC`,
      [equipoId]
    );
  } catch (error) {
    console.error('[trainingService] Error al obtener próximos entrenamientos:', error);
    throw error;
  }
}

/**
 * Registra o actualiza la asistencia de un jugador a un entrenamiento.
 * Usa INSERT OR REPLACE para simplificar el upsert.
 * @param {number} entrenamientoId
 * @param {number} jugadorId
 * @param {number} asistio 1 si asistió, 0 si no
 * @param {string} [nota]
 * @returns {Promise<number>} ID del registro
 */
export async function registerAttendance(entrenamientoId, jugadorId, asistio, nota = null) {
  try {
    const db = await getDatabase();
    // Comprobar si ya existe el registro
    const existing = await db.getFirstAsync(
      `SELECT id FROM asistencia_entrenamiento
       WHERE entrenamiento_id = ? AND jugador_id = ?`,
      [entrenamientoId, jugadorId]
    );

    if (existing) {
      await db.runAsync(
        `UPDATE asistencia_entrenamiento
         SET asistio = ?, nota = ?
         WHERE id = ?`,
        [asistio, nota, existing.id]
      );
      console.log(`[trainingService] Asistencia actualizada para jugador ${jugadorId}`);
      return existing.id;
    } else {
      const result = await db.runAsync(
        `INSERT INTO asistencia_entrenamiento (entrenamiento_id, jugador_id, asistio, nota)
         VALUES (?, ?, ?, ?)`,
        [entrenamientoId, jugadorId, asistio, nota]
      );
      console.log(`[trainingService] Asistencia registrada con ID: ${result.lastInsertRowId}`);
      return result.lastInsertRowId;
    }
  } catch (error) {
    console.error('[trainingService] Error al registrar asistencia:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de asistencia de un entrenamiento con datos de jugadores.
 * @param {number} entrenamientoId
 * @returns {Promise<object[]>}
 */
export async function getAttendance(entrenamientoId) {
  try {
    const db = await getDatabase();
    return await db.getAllAsync(
      `SELECT a.*, j.nombre, j.dorsal, j.posicion
       FROM asistencia_entrenamiento a
       INNER JOIN jugadores j ON a.jugador_id = j.id
       WHERE a.entrenamiento_id = ?
       ORDER BY j.dorsal ASC`,
      [entrenamientoId]
    );
  } catch (error) {
    console.error('[trainingService] Error al obtener asistencia:', error);
    throw error;
  }
}
