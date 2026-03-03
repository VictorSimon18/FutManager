/**
 * useTeamStats.js — Hook para cargar estadísticas agregadas del equipo
 */

import { useState, useEffect, useCallback } from 'react';
import { getTeamSeasonStats } from '../database/services/teamStatsService';

/**
 * Hook que carga las estadísticas de temporada del equipo.
 * @param {number|null} equipoId
 * @returns {{ stats: object|null, loading: boolean, error: Error|null, refresh: function }}
 */
export function useTeamStats(equipoId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!equipoId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getTeamSeasonStats(equipoId);
      setStats(data);
    } catch (e) {
      console.error('[useTeamStats] Error:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, loading, error, refresh };
}
