/**
 * usePlayers — Hook para gestionar el listado de jugadores de un equipo
 */

import { useState, useEffect, useCallback } from 'react';
import { getPlayersByTeam } from '../database/services/playerService';

/**
 * @param {number|null} equipoId ID del equipo
 * @returns {{ players: object[], loading: boolean, error: string|null, refresh: Function }}
 */
export function usePlayers(equipoId) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    if (equipoId == null) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPlayersByTeam(equipoId);
      setPlayers(data);
    } catch (err) {
      console.error('[usePlayers] Error al cargar jugadores:', err);
      setError('No se pudieron cargar los jugadores.');
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return { players, loading, error, refresh: fetchPlayers };
}
