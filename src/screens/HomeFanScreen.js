import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Surface, Card, Avatar, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useMatches } from '../hooks/useMatches';
import { getTeamById } from '../database/services/teamService';
import { getDatabase } from '../database/database';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function formatearFechaLarga(fechaStr, hora) {
  // Convierte 'YYYY-MM-DD' + '17:00' en 'Sáb, 8 mar - 17:00'
  if (!fechaStr) return '';
  const [year, mes, dia] = fechaStr.split('-').map(Number);
  const fecha = new Date(year, mes - 1, dia);
  return `${DIAS_SEMANA[fecha.getDay()]}, ${dia} ${MESES[mes - 1]}${hora ? ' - ' + hora : ''}`;
}

export default function HomeFanScreen() {
  const { equipoId } = useContext(AuthContext);

  const [equipo, setEquipo] = useState(null);
  const [goleadores, setGoleadores] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  const { matches, upcomingMatches, loading: loadingMatches } = useMatches(equipoId);

  const isLoading = loadingMatches || loadingExtra;

  // Cargar datos del equipo y goleadores
  useEffect(() => {
    async function loadExtra() {
      if (!equipoId) {
        setLoadingExtra(false);
        return;
      }
      try {
        const [teamData, db] = await Promise.all([
          getTeamById(equipoId),
          getDatabase(),
        ]);
        setEquipo(teamData);

        // Máximos goleadores del equipo
        const scorers = await db.getAllAsync(
          `SELECT j.nombre, j.posicion, SUM(e.goles) AS total_goles
           FROM estadisticas_jugador e
           JOIN jugadores j ON e.jugador_id = j.id
           WHERE j.equipo_id = ? AND j.activo = 1
           GROUP BY j.id
           HAVING total_goles > 0
           ORDER BY total_goles DESC
           LIMIT 5`,
          [equipoId]
        );
        setGoleadores(scorers);
      } catch (error) {
        console.error('[HomeFanScreen] Error al cargar datos del equipo:', error);
      } finally {
        setLoadingExtra(false);
      }
    }
    loadExtra();
  }, [equipoId]);

  // Calcular estadísticas del equipo a partir de los partidos finalizados
  const statsEquipo = useMemo(() => {
    const finalizados = matches.filter((m) => m.estado === 'finalizado');
    const victorias = finalizados.filter((m) => m.goles_favor > m.goles_contra).length;
    const empates = finalizados.filter((m) => m.goles_favor === m.goles_contra).length;
    const derrotas = finalizados.filter((m) => m.goles_favor < m.goles_contra).length;
    const puntos = victorias * 3 + empates;
    return { victorias, empates, derrotas, puntos };
  }, [matches]);

  // Últimos 3 partidos finalizados
  const ultimosResultados = useMemo(
    () => matches.filter((m) => m.estado === 'finalizado').slice(0, 3),
    [matches]
  );

  const proximoPartido = upcomingMatches[0] ?? null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con info del equipo */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.teamHeader}>
            <Avatar.Icon size={72} icon="shield-star" style={styles.teamAvatar} />
            <View style={styles.teamInfo}>
              <Text variant="headlineSmall" style={styles.teamName}>
                {equipo?.nombre ?? 'Mi Equipo'}
              </Text>
              <View style={styles.teamMeta}>
                <Chip icon="trophy" compact style={styles.leagueChip}>
                  {equipo?.categoria ?? 'Liga'}
                </Chip>
                <Text variant="bodyMedium" style={styles.teamPosition}>
                  {equipo?.temporada ?? ''}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1E88E5" style={styles.loader} />
        ) : (
          <>
            {/* Estadísticas del equipo */}
            <View style={styles.statsContainer}>
              <Surface style={[styles.miniStat, styles.winStat]} elevation={1}>
                <Text variant="headlineMedium" style={styles.miniStatValue}>
                  {statsEquipo.victorias}
                </Text>
                <Text variant="bodySmall" style={styles.miniStatLabel}>
                  Victorias
                </Text>
              </Surface>

              <Surface style={[styles.miniStat, styles.drawStat]} elevation={1}>
                <Text variant="headlineMedium" style={styles.miniStatValue}>
                  {statsEquipo.empates}
                </Text>
                <Text variant="bodySmall" style={styles.miniStatLabel}>
                  Empates
                </Text>
              </Surface>

              <Surface style={[styles.miniStat, styles.lossStat]} elevation={1}>
                <Text variant="headlineMedium" style={styles.miniStatValue}>
                  {statsEquipo.derrotas}
                </Text>
                <Text variant="bodySmall" style={styles.miniStatLabel}>
                  Derrotas
                </Text>
              </Surface>

              <Surface style={[styles.miniStat, styles.pointsStat]} elevation={1}>
                <Text variant="headlineMedium" style={styles.miniStatValue}>
                  {statsEquipo.puntos}
                </Text>
                <Text variant="bodySmall" style={styles.miniStatLabel}>
                  Puntos
                </Text>
              </Surface>
            </View>

            {/* Próximo partido */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Próximo partido
            </Text>
            {proximoPartido ? (
              <Card style={styles.matchCard}>
                <Card.Content>
                  <Chip icon="calendar" compact style={styles.dateChip}>
                    {formatearFechaLarga(proximoPartido.fecha, proximoPartido.hora)}
                  </Chip>
                  <View style={styles.matchup}>
                    <View style={styles.team}>
                      <Avatar.Icon
                        size={56}
                        icon="shield-star"
                        style={proximoPartido.es_local ? styles.homeTeam : styles.awayTeam}
                      />
                      <Text variant="titleMedium" style={styles.teamNameText}>
                        {equipo?.nombre ?? 'Nosotros'}
                      </Text>
                    </View>
                    <Text variant="headlineLarge" style={styles.vs}>
                      VS
                    </Text>
                    <View style={styles.team}>
                      <Avatar.Icon size={56} icon="shield" style={styles.awayTeam} />
                      <Text variant="titleMedium" style={styles.teamNameText}>
                        {proximoPartido.rival}
                      </Text>
                    </View>
                  </View>
                  <Divider style={styles.divider} />
                  <View style={styles.matchInfo}>
                    {proximoPartido.ubicacion ? (
                      <View style={styles.matchInfoRow}>
                        <Icon name="map-marker" size={20} color="#666" />
                        <Text variant="bodyMedium" style={styles.matchInfoText}>
                          {proximoPartido.ubicacion}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.matchInfoRow}>
                      <Icon name="soccer-field" size={20} color="#666" />
                      <Text variant="bodyMedium" style={styles.matchInfoText}>
                        {proximoPartido.es_local ? 'En casa' : 'A domicilio'} · {proximoPartido.tipo}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.matchCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.noDataText}>
                    No hay partidos próximos programados
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Últimos resultados */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Últimos resultados
            </Text>
            {ultimosResultados.length > 0 ? (
              <Surface style={styles.resultsCard} elevation={1}>
                {ultimosResultados.map((partido, index) => {
                  const esCasa = partido.es_local;
                  const resultado =
                    partido.goles_favor > partido.goles_contra
                      ? 'V'
                      : partido.goles_favor < partido.goles_contra
                      ? 'D'
                      : 'E';
                  const resultadoColor =
                    resultado === 'V' ? '#00AA13' : resultado === 'D' ? '#D32F2F' : '#FF9800';

                  return (
                    <View key={partido.id}>
                      {index > 0 && <View style={styles.resultDivider} />}
                      <View style={styles.resultRow}>
                        <View style={[styles.resultBadge, { backgroundColor: resultadoColor }]}>
                          <Text style={styles.resultBadgeText}>{resultado}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                          <Text variant="bodyMedium" style={styles.resultRival}>
                            {esCasa ? 'vs.' : 'en'} {partido.rival}
                          </Text>
                          <Text variant="bodySmall" style={styles.resultDate}>
                            {formatearFechaLarga(partido.fecha, null)}
                          </Text>
                        </View>
                        <Text variant="titleMedium" style={styles.resultScore}>
                          {partido.goles_favor}-{partido.goles_contra}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </Surface>
            ) : (
              <Surface style={styles.resultsCard} elevation={1}>
                <Text variant="bodyMedium" style={styles.noDataText}>
                  Aún no hay resultados registrados
                </Text>
              </Surface>
            )}

            {/* Máximos goleadores */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Máximos goleadores
            </Text>
            {goleadores.length > 0 ? (
              <Surface style={styles.scorersCard} elevation={1}>
                {goleadores.map((jugador, index) => (
                  <View key={index}>
                    {index > 0 && <Divider style={styles.divider} />}
                    <View style={styles.scorerRow}>
                      <View style={styles.scorerRank}>
                        <Text variant="titleMedium" style={styles.rankNumber}>
                          {index + 1}
                        </Text>
                      </View>
                      <Avatar.Icon size={40} icon="account" style={styles.scorerAvatar} />
                      <View style={styles.scorerInfo}>
                        <Text variant="bodyLarge" style={styles.scorerName}>
                          {jugador.nombre}
                        </Text>
                        <Text variant="bodySmall" style={styles.scorerPosition}>
                          {jugador.posicion}
                        </Text>
                      </View>
                      <View style={styles.scorerStats}>
                        <Text variant="titleLarge" style={styles.goals}>
                          {jugador.total_goles}
                        </Text>
                        <Icon name="soccer" size={20} color="#00AA13" />
                      </View>
                    </View>
                  </View>
                ))}
              </Surface>
            ) : (
              <Surface style={styles.scorersCard} elevation={1}>
                <Text variant="bodyMedium" style={styles.noDataText}>
                  Aún no hay estadísticas de goles
                </Text>
              </Surface>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  teamAvatar: {
    backgroundColor: '#1E88E5',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leagueChip: {
    backgroundColor: '#E3F2FD',
  },
  teamPosition: {
    fontWeight: '600',
    color: '#1E88E5',
  },
  loader: {
    marginTop: 60,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  miniStat: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  winStat: {
    borderTopWidth: 3,
    borderTopColor: '#00AA13',
  },
  drawStat: {
    borderTopWidth: 3,
    borderTopColor: '#FF9800',
  },
  lossStat: {
    borderTopWidth: 3,
    borderTopColor: '#D32F2F',
  },
  pointsStat: {
    borderTopWidth: 3,
    borderTopColor: '#1E88E5',
  },
  miniStatValue: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    fontSize: 20,
  },
  miniStatLabel: {
    color: '#666',
    marginTop: 4,
    fontSize: 11,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    color: '#1A1A1A',
  },
  matchCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  dateChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  matchup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 16,
  },
  team: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  homeTeam: {
    backgroundColor: '#1E88E5',
  },
  awayTeam: {
    backgroundColor: '#D32F2F',
  },
  teamNameText: {
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  vs: {
    fontWeight: 'bold',
    color: '#999',
  },
  divider: {
    marginVertical: 12,
  },
  matchInfo: {
    gap: 8,
  },
  matchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchInfoText: {
    color: '#666',
  },
  resultsCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultInfo: {
    flex: 1,
  },
  resultRival: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  resultDate: {
    color: '#999',
    marginTop: 2,
  },
  resultScore: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  scorersCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scorerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  scorerAvatar: {
    backgroundColor: '#E0E0E0',
  },
  scorerInfo: {
    flex: 1,
  },
  scorerName: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  scorerPosition: {
    color: '#666',
  },
  scorerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goals: {
    fontWeight: 'bold',
    color: '#00AA13',
  },
  noDataText: {
    color: '#999',
    fontStyle: 'italic',
  },
});
