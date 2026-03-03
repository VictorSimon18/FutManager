/**
 * usePlayerAttendance.js — Hook para cargar la asistencia de un jugador a entrenamientos
 */

import { useState, useEffect, useCallback } from 'react';
import { getPlayerAttendance } from '../database/services/trainingService';

/**
 * Hook que carga las estadísticas de asistencia de un jugador.
 * @param {number|null} jugadorId
 * @param {number|null} equipoId
 * @returns {{ attendance: {total, asistidos, porcentaje}|null, loading: boolean, error: Error|null, refresh: function }}
 */
export function usePlayerAttendance(jugadorId, equipoId) {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!jugadorId || !equipoId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getPlayerAttendance(jugadorId, equipoId);
      setAttendance(data);
    } catch (e) {
      console.error('[usePlayerAttendance] Error:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [jugadorId, equipoId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { attendance, loading, error, refresh };
}
