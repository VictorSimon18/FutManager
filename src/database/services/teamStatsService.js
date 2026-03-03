/**
 * teamStatsService.js — Estadísticas agregadas del equipo calculadas desde SQLite
 */

import { getDatabase } from '../database';

/**
 * Resumen general del equipo en la temporada.
 * @param {number} equipoId
 * @returns {Promise<object>}
 */
export async function getTeamSeasonStats(equipoId) {
  try {
    const db = await getDatabase();

    // Estadísticas de partidos finalizados
    const matchStats = await db.getFirstAsync(
      `SELECT
         COUNT(*)                                                       AS partidos_jugados,
         SUM(CASE WHEN goles_favor > goles_contra THEN 1 ELSE 0 END)  AS ganados,
         SUM(CASE WHEN goles_favor = goles_contra THEN 1 ELSE 0 END)  AS empatados,
         SUM(CASE WHEN goles_favor < goles_contra THEN 1 ELSE 0 END)  AS perdidos,
         SUM(goles_favor)                                               AS goles_favor_total,
         SUM(goles_contra)                                              AS goles_contra_total
       FROM partidos
       WHERE equipo_id = ? AND estado = 'finalizado'`,
      [equipoId]
    );

    // Últimos resultados para calcular racha actual
    const lastResults = await db.getAllAsync(
      `SELECT goles_favor, goles_contra
       FROM partidos
       WHERE equipo_id = ? AND estado = 'finalizado'
       ORDER BY fecha DESC
       LIMIT 20`,
      [equipoId]
    );

    let racha = 0;
    let rachaTipo = null;
    for (const p of lastResults) {
      const res = p.goles_favor > p.goles_contra ? 'V'
        : p.goles_favor < p.goles_contra ? 'D'
        : 'E';
      if (!rachaTipo) { rachaTipo = res; racha = 1; }
      else if (res === rachaTipo) racha++;
      else break;
    }

    // Tarjetas totales del equipo
    const cardStats = await db.getFirstAsync(
      `SELECT
         SUM(e.tarjetas_amarillas) AS total_amarillas,
         SUM(e.tarjetas_rojas)     AS total_rojas
       FROM estadisticas_jugador e
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE p.equipo_id = ?`,
      [equipoId]
    );

    // Jugador con más goles
    const topGoleador = await db.getFirstAsync(
      `SELECT j.nombre, SUM(e.goles) AS total_goles
       FROM estadisticas_jugador e
       INNER JOIN jugadores j ON e.jugador_id = j.id
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE p.equipo_id = ?
       GROUP BY e.jugador_id
       ORDER BY total_goles DESC
       LIMIT 1`,
      [equipoId]
    );

    // Jugador con más asistencias
    const topAsistente = await db.getFirstAsync(
      `SELECT j.nombre, SUM(e.asistencias) AS total_asistencias
       FROM estadisticas_jugador e
       INNER JOIN jugadores j ON e.jugador_id = j.id
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE p.equipo_id = ?
       GROUP BY e.jugador_id
       ORDER BY total_asistencias DESC
       LIMIT 1`,
      [equipoId]
    );

    const pj = matchStats?.partidos_jugados ?? 0;
    const ganados = matchStats?.ganados ?? 0;
    const golesFavor = matchStats?.goles_favor_total ?? 0;

    return {
      partidos_jugados:       pj,
      ganados,
      empatados:              matchStats?.empatados ?? 0,
      perdidos:               matchStats?.perdidos ?? 0,
      goles_favor:            golesFavor,
      goles_contra:           matchStats?.goles_contra_total ?? 0,
      promedio_goles:         pj > 0 ? (golesFavor / pj).toFixed(1) : '0.0',
      porcentaje_victorias:   pj > 0 ? Math.round((ganados / pj) * 100) : 0,
      racha,
      racha_tipo:             rachaTipo,
      total_amarillas:        cardStats?.total_amarillas ?? 0,
      total_rojas:            cardStats?.total_rojas ?? 0,
      top_goleador:           topGoleador?.nombre ?? null,
      top_goleador_goles:     topGoleador?.total_goles ?? 0,
      top_asistente:          topAsistente?.nombre ?? null,
      top_asistente_asistencias: topAsistente?.total_asistencias ?? 0,
    };
  } catch (error) {
    console.error('[teamStatsService] Error al obtener estadísticas de temporada:', error);
    throw error;
  }
}

/**
 * Estadísticas ofensivas del equipo.
 * @param {number} equipoId
 * @returns {Promise<object>}
 */
export async function getTeamOffensiveStats(equipoId) {
  try {
    const db = await getDatabase();

    const stats = await db.getFirstAsync(
      `SELECT
         SUM(e.goles)         AS total_goles,
         SUM(e.asistencias)   AS total_asistencias,
         SUM(e.tiros_puerta)  AS total_tiros_puerta,
         SUM(e.tiros_fuera)   AS total_tiros_fuera,
         SUM(e.fueras_juego)  AS total_fueras_juego,
         SUM(e.pases_clave)   AS total_pases_clave
       FROM estadisticas_jugador e
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE p.equipo_id = ?`,
      [equipoId]
    );

    // Goles en casa vs fuera
    const casaVsFuera = await db.getAllAsync(
      `SELECT p.es_local, SUM(p.goles_favor) AS goles
       FROM partidos p
       WHERE p.equipo_id = ? AND p.estado = 'finalizado'
       GROUP BY p.es_local`,
      [equipoId]
    );

    const golesCasa = casaVsFuera.find(r => r.es_local === 1)?.goles ?? 0;
    const golesFuera = casaVsFuera.find(r => r.es_local === 0)?.goles ?? 0;

    // Ranking goleadores
    const goleadores = await db.getAllAsync(
      `SELECT j.nombre, j.dorsal, SUM(e.goles) AS goles
       FROM estadisticas_jugador e
       INNER JOIN jugadores j ON e.jugador_id = j.id
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE p.equipo_id = ?
       GROUP BY e.jugador_id
       ORDER BY goles DESC
       LIMIT 5`,
      [equipoId]
    );

    const totalGoles = stats?.total_goles ?? 0;
    const totalTirosPuerta = stats?.total_tiros_puerta ?? 0;

    return {
      total_goles:        totalGoles,
      total_asistencias:  stats?.total_asistencias ?? 0,
      total_tiros_puerta: totalTirosPuerta,
      total_tiros_fuera:  stats?.total_tiros_fuera ?? 0,
      total_fueras_juego: stats?.total_fueras_juego ?? 0,
      total_pases_clave:  stats?.total_pases_clave ?? 0,
      efectividad:        totalTirosPuerta > 0
        ? Math.round((totalGoles / totalTirosPuerta) * 100)
        : 0,
      goles_casa:         golesCasa,
      goles_fuera:        golesFuera,
      goleadores,
    };
  } catch (error) {
    console.error('[teamStatsService] Error al obtener estadísticas ofensivas:', error);
    throw error;
  }
}

/**
 * Estadísticas defensivas del equipo.
 * @param {number} equipoId
 * @returns {Promise<object>}
 */
export async function getTeamDefensiveStats(equipoId) {
  try {
    const db = await getDatabase();

    // Porterías a cero y goles encajados
    const defensiveMatch = await db.getFirstAsync(
      `SELECT
         COUNT(*) AS partidos_finalizados,
         SUM(CASE WHEN goles_contra = 0 THEN 1 ELSE 0 END) AS porterias_cero,
         SUM(goles_contra) AS total_goles_contra
       FROM partidos
       WHERE equipo_id = ? AND estado = 'finalizado'`,
      [equipoId]
    );

    // Stats defensivas de jugadores
    const playerDefensive = await db.getFirstAsync(
      `SELECT
         SUM(e.entradas)  AS total_entradas,
         SUM(e.despejes)  AS total_despejes,
         SUM(e.paradas)   AS total_paradas
       FROM estadisticas_jugador e
       INNER JOIN partidos p ON e.partido_id = p.id
       WHERE p.equipo_id = ?`,
      [equipoId]
    );

    const pj = defensiveMatch?.partidos_finalizados ?? 0;
    const totalGoles = defensiveMatch?.total_goles_contra ?? 0;

    return {
      porterias_cero:           defensiveMatch?.porterias_cero ?? 0,
      goles_contra_por_partido: pj > 0 ? (totalGoles / pj).toFixed(1) : '0.0',
      total_goles_contra:       totalGoles,
      total_entradas:           playerDefensive?.total_entradas ?? 0,
      total_despejes:           playerDefensive?.total_despejes ?? 0,
      total_paradas:            playerDefensive?.total_paradas ?? 0,
    };
  } catch (error) {
    console.error('[teamStatsService] Error al obtener estadísticas defensivas:', error);
    throw error;
  }
}
