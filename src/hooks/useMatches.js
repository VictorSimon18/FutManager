/**
 * useMatches — Hook para gestionar partidos de un equipo
 */

import { useState, useEffect, useCallback } from 'react';
import { getMatchesByTeam, getUpcomingMatches } from '../database/services/matchService';

/**
 * @param {number|null} equipoId ID del equipo
 * @returns {{ matches: object[], upcomingMatches: object[], loading: boolean, refresh: Function }}
 */
export function useMatches(equipoId) {
  const [matches, setMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    if (equipoId == null) {
      setMatches([]);
      setUpcomingMatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Cargamos ambas listas en paralelo
      const [all, upcoming] = await Promise.all([
        getMatchesByTeam(equipoId),
        getUpcomingMatches(equipoId),
      ]);
      setMatches(all);
      setUpcomingMatches(upcoming);
    } catch (err) {
      console.error('[useMatches] Error al cargar partidos:', err);
      setError('No se pudieron cargar los partidos.');
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, upcomingMatches, loading, error, refresh: fetchMatches };
}
