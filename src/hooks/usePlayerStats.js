/**
 * usePlayerStats — Hook para gestionar las estadísticas de un jugador
 */

import { useState, useEffect, useCallback } from 'react';
import { getStatsByPlayer, getSeasonStats } from '../database/services/statsService';

/**
 * @param {number|null} jugadorId ID del jugador
 * @returns {{ stats: object[], seasonStats: object|null, loading: boolean, refresh: Function }}
 */
export function usePlayerStats(jugadorId) {
  const [stats, setStats] = useState([]);
  const [seasonStats, setSeasonStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (jugadorId == null) {
      setStats([]);
      setSeasonStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Cargamos estadísticas por partido y totales de temporada en paralelo
      const [partidos, temporada] = await Promise.all([
        getStatsByPlayer(jugadorId),
        getSeasonStats(jugadorId),
      ]);
      setStats(partidos);
      setSeasonStats(temporada);
    } catch (err) {
      console.error('[usePlayerStats] Error al cargar estadísticas:', err);
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }, [jugadorId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, seasonStats, loading, error, refresh: fetchStats };
}
