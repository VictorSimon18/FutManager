/**
 * AuthContext.js — Contexto global de autenticación para FutManager
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getUserByEmail, getUserById, createUser } from '../database/services/userService';
import { getDatabase } from '../database/database';

const STORAGE_KEY = 'futmanager_session';

export const AuthContext = createContext(null);

/**
 * Hook de acceso rápido al contexto de autenticación.
 */
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [equipoId, setEquipoId] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // Restaurar sesión al arrancar la app
  useEffect(() => {
    restoreSession();
  }, []);

  /**
   * Obtiene los datos específicos del rol del usuario desde la BD.
   * @param {string} roleId - 'coach' | 'player' | 'fan'
   * @param {number} userId
   * @returns {Promise<object|null>}
   */
  async function fetchRoleData(roleId, userId) {
    try {
      const db = await getDatabase();
      if (roleId === 'coach') {
        return await db.getFirstAsync(
          'SELECT * FROM entrenadores WHERE usuario_id = ?',
          [userId]
        );
      } else if (roleId === 'player') {
        return await db.getFirstAsync(
          'SELECT * FROM jugadores WHERE usuario_id = ? AND activo = 1',
          [userId]
        );
      } else if (roleId === 'fan') {
        return await db.getFirstAsync(
          'SELECT * FROM aficionados WHERE usuario_id = ?',
          [userId]
        );
      }
    } catch (error) {
      console.error('[AuthContext] Error al obtener datos del rol:', error);
    }
    return null;
  }

  /**
   * Intenta recuperar la sesión guardada en almacenamiento seguro.
   * Se ejecuta una sola vez al arrancar la app.
   */
  async function restoreSession() {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        const dbUser = await getUserById(session.userId);
        if (dbUser) {
          setUser(dbUser);
          if (session.role && session.equipoId) {
            setRole(session.role);
            setEquipoId(session.equipoId);
            const rd = await fetchRoleData(session.role, dbUser.id);
            setRoleData(rd);
          }
        } else {
          // El usuario ya no existe en la BD; limpiar sesión guardada
          await SecureStore.deleteItemAsync(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error al restaurar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Inicia sesión comparando email y password directamente contra la BD.
   * TODO: Implementar hash real con bcrypt en producción
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Objeto usuario si las credenciales son correctas
   * @throws {Error} Si las credenciales son inválidas
   */
  async function login(email, password) {
    try {
      if (!email.trim()) throw new Error('El email es obligatorio.');
      if (!password.trim()) throw new Error('La contraseña es obligatoria.');

      const dbUser = await getUserByEmail(email.trim().toLowerCase());
      if (!dbUser) throw new Error('No existe ninguna cuenta con ese email.');

      // TODO: Implementar hash real con bcrypt en producción
      if (dbUser.password_hash !== password) throw new Error('Contraseña incorrecta.');

      setUser(dbUser);
      // Guardamos solo el userId (el rol se elige en la siguiente pantalla)
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ userId: dbUser.id }));
      return dbUser;
    } catch (error) {
      console.error('[AuthContext] Error en login:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario en la BD. No inicia sesión automáticamente.
   * TODO: Implementar hash real con bcrypt en producción
   *
   * @param {string} nombre
   * @param {string} email
   * @param {string} password
   * @returns {Promise<number>} ID del usuario creado
   * @throws {Error} Si el email ya está registrado o faltan campos
   */
  async function register(nombre, email, password) {
    try {
      if (!nombre.trim()) throw new Error('El nombre es obligatorio.');
      if (!email.trim()) throw new Error('El email es obligatorio.');
      if (!password.trim()) throw new Error('La contraseña es obligatoria.');

      const existing = await getUserByEmail(email.trim().toLowerCase());
      if (existing) throw new Error('Ya existe una cuenta con ese email.');

      // TODO: Implementar hash real con bcrypt en producción
      const userId = await createUser({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password_hash: password,
      });
      return userId;
    } catch (error) {
      console.error('[AuthContext] Error en registro:', error);
      throw error;
    }
  }

  /**
   * Selecciona el rol del usuario tras el login.
   * Si el usuario no tiene registro para el rol elegido, lo crea automáticamente.
   * Para el rol 'player', el registro debe existir previamente (vinculado por el seed o el entrenador).
   *
   * @param {string} roleId - 'coach' | 'player' | 'fan'
   * @param {number|null} targetEquipoId - ID del equipo (opcional; se auto-asigna al primero si es null)
   */
  async function selectRole(roleId, targetEquipoId) {
    try {
      if (!user) throw new Error('No hay sesión activa.');

      const db = await getDatabase();
      let rd = await fetchRoleData(roleId, user.id);

      if (!rd) {
        // Determinar el equipo al que asignar (prototipo: primer equipo disponible)
        let finalEquipoId = targetEquipoId;
        if (!finalEquipoId) {
          const primerEquipo = await db.getFirstAsync(
            'SELECT id FROM equipos ORDER BY id ASC LIMIT 1'
          );
          finalEquipoId = primerEquipo?.id ?? null;
        }
        if (!finalEquipoId) throw new Error('No hay equipos disponibles en la base de datos.');

        if (roleId === 'coach') {
          await db.runAsync(
            'INSERT INTO entrenadores (usuario_id, equipo_id) VALUES (?, ?)',
            [user.id, finalEquipoId]
          );
        } else if (roleId === 'fan') {
          await db.runAsync(
            'INSERT INTO aficionados (usuario_id, equipo_id) VALUES (?, ?)',
            [user.id, finalEquipoId]
          );
        }
        // Para 'player': debe existir un registro en jugadores con usuario_id vinculado
        rd = await fetchRoleData(roleId, user.id);
      }

      const finalEquipoId = rd?.equipo_id ?? targetEquipoId;
      setRole(roleId);
      setEquipoId(finalEquipoId);
      setRoleData(rd);

      // Persistir la sesión completa (userId + rol + equipo)
      await SecureStore.setItemAsync(
        STORAGE_KEY,
        JSON.stringify({ userId: user.id, role: roleId, equipoId: finalEquipoId })
      );
    } catch (error) {
      console.error('[AuthContext] Error al seleccionar rol:', error);
      throw error;
    }
  }

  /**
   * Limpia el rol activo (manteniendo la sesión del usuario) para volver a
   * la pantalla de selección de rol. Útil para cambiar de rol sin cerrar sesión.
   */
  async function changeRole() {
    try {
      if (user) {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ userId: user.id }));
      }
    } catch (error) {
      console.error('[AuthContext] Error al cambiar rol:', error);
    } finally {
      setRole(null);
      setEquipoId(null);
      setRoleData(null);
    }
  }

  /**
   * Cierra la sesión del usuario, limpiando el estado y el almacenamiento persistente.
   */
  async function logout() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } catch (error) {
      console.error('[AuthContext] Error al eliminar sesión guardada:', error);
    } finally {
      setUser(null);
      setRole(null);
      setEquipoId(null);
      setRoleData(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        equipoId,
        roleData,
        isLoading,
        isAuthenticated,
        login,
        register,
        selectRole,
        changeRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
