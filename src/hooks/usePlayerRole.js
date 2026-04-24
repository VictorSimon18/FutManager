/**
 * usePlayerRole.js — Hooks específicos para el rol jugador
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPlayerMatchHistory,
  getPlayerTrainingHistory,
  getTeamTournamentStandings,
} from '../database/services/playerRoleService';

/**
 * Hook que carga el historial de partidos del jugador con sus stats individuales.
 * @param {number|null} jugadorId
 * @returns {{ matches: object[], loading: boolean, refresh: Function }}
 */
export function usePlayerMatchHistory(jugadorId) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!jugadorId) {
      setMatches([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getPlayerMatchHistory(jugadorId);
      setMatches(data);
    } catch (e) {
      console.error('[usePlayerMatchHistory]', e);
    } finally {
      setLoading(false);
    }
  }, [jugadorId]);

  useEffect(() => { refresh(); }, [refresh]);
  return { matches, loading, refresh };
}

/**
 * Hook que carga el historial de asistencia a entrenamientos del jugador.
 * @param {number|null} jugadorId
 * @returns {{ trainings: object[], loading: boolean, refresh: Function }}
 */
export function usePlayerTrainingHistory(jugadorId) {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!jugadorId) {
      setTrainings([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getPlayerTrainingHistory(jugadorId);
      setTrainings(data);
    } catch (e) {
      console.error('[usePlayerTrainingHistory]', e);
    } finally {
      setLoading(false);
    }
  }, [jugadorId]);

  useEffect(() => { refresh(); }, [refresh]);
  return { trainings, loading, refresh };
}

/**
 * Hook que carga el torneo activo del equipo y la clasificación.
 * @param {number|null} equipoId
 * @returns {{ data: {torneo, standings, myEquipoId}|null, loading: boolean, refresh: Function }}
 */
export function useTeamTournament(equipoId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!equipoId) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await getTeamTournamentStandings(equipoId);
      setData(result);
    } catch (e) {
      console.error('[useTeamTournament]', e);
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, refresh };
}
