/**
 * useFanRole.js — Hooks específicos para el rol aficionado
 */

import { useState, useEffect, useCallback } from 'react';
import { getTopScorers, getTopAssisters } from '../database/services/fanService';

/**
 * Hook que carga los máximos goleadores del equipo.
 * @param {number|null} equipoId
 * @param {number} [limit=10]
 * @returns {{ scorers: object[], loading: boolean, refresh: Function }}
 */
export function useTopScorers(equipoId, limit = 10) {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!equipoId) {
      setScorers([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getTopScorers(equipoId, limit);
      setScorers(data);
    } catch (e) {
      console.error('[useTopScorers]', e);
    } finally {
      setLoading(false);
    }
  }, [equipoId, limit]);

  useEffect(() => { refresh(); }, [refresh]);
  return { scorers, loading, refresh };
}

/**
 * Hook que carga los máximos asistentes del equipo.
 * @param {number|null} equipoId
 * @param {number} [limit=5]
 * @returns {{ assisters: object[], loading: boolean, refresh: Function }}
 */
export function useTopAssisters(equipoId, limit = 5) {
  const [assisters, setAssisters] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!equipoId) {
      setAssisters([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getTopAssisters(equipoId, limit);
      setAssisters(data);
    } catch (e) {
      console.error('[useTopAssisters]', e);
    } finally {
      setLoading(false);
    }
  }, [equipoId, limit]);

  useEffect(() => { refresh(); }, [refresh]);
  return { assisters, loading, refresh };
}
