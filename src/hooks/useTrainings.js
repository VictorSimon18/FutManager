/**
 * useTrainings — Hook para gestionar los entrenamientos de un equipo
 */

import { useState, useEffect, useCallback } from 'react';
import { getTrainingsByTeam, getUpcomingTrainings } from '../database/services/trainingService';

/**
 * @param {number|null} equipoId ID del equipo
 * @returns {{ trainings: object[], upcomingTrainings: object[], loading: boolean, refresh: Function }}
 */
export function useTrainings(equipoId) {
  const [trainings, setTrainings] = useState([]);
  const [upcomingTrainings, setUpcomingTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrainings = useCallback(async () => {
    if (equipoId == null) {
      setTrainings([]);
      setUpcomingTrainings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Cargamos todos los entrenamientos y los próximos en paralelo
      const [all, upcoming] = await Promise.all([
        getTrainingsByTeam(equipoId),
        getUpcomingTrainings(equipoId),
      ]);
      setTrainings(all);
      setUpcomingTrainings(upcoming);
    } catch (err) {
      console.error('[useTrainings] Error al cargar entrenamientos:', err);
      setError('No se pudieron cargar los entrenamientos.');
    } finally {
      setLoading(false);
    }
  }, [equipoId]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  return { trainings, upcomingTrainings, loading, error, refresh: fetchTrainings };
}
