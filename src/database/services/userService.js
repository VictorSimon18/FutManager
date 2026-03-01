/**
 * userService.js — Operaciones CRUD para la tabla usuarios
 */

import { getDatabase } from '../database';

/**
 * Crea un nuevo usuario.
 * @param {{ nombre, email, password_hash }} data
 * @returns {Promise<number>} ID del usuario creado
 */
export async function createUser(data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES (?, ?, ?)`,
      [data.nombre, data.email, data.password_hash]
    );
    console.log(`[userService] Usuario creado con ID: ${result.lastInsertRowId}`);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('[userService] Error al crear usuario:', error);
    throw error;
  }
}

/**
 * Busca un usuario por email (útil para login).
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function getUserByEmail(email) {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
  } catch (error) {
    console.error('[userService] Error al buscar usuario por email:', error);
    throw error;
  }
}

/**
 * Obtiene un usuario por su ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function getUserById(id) {
  try {
    const db = await getDatabase();
    return await db.getFirstAsync(
      'SELECT id, nombre, email, fecha_registro FROM usuarios WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error('[userService] Error al obtener usuario:', error);
    throw error;
  }
}

/**
 * Actualiza los datos de un usuario.
 * @param {number} id
 * @param {{ nombre?, email?, password_hash? }} data
 * @returns {Promise<number>} Filas afectadas
 */
export async function updateUser(id, data) {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE usuarios
       SET nombre        = COALESCE(?, nombre),
           email         = COALESCE(?, email),
           password_hash = COALESCE(?, password_hash)
       WHERE id = ?`,
      [data.nombre ?? null, data.email ?? null, data.password_hash ?? null, id]
    );
    console.log(`[userService] Usuario ${id} actualizado. Filas: ${result.changes}`);
    return result.changes;
  } catch (error) {
    console.error('[userService] Error al actualizar usuario:', error);
    throw error;
  }
}
