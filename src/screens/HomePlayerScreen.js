import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Surface, Card, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useTrainings } from '../hooks/useTrainings';

const MESES_CORTO = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function parseFecha(fechaStr) {
  // Devuelve { dia, mes, mesCorto } a partir de 'YYYY-MM-DD'
  if (!fechaStr) return {};
  const partes = fechaStr.split('-');
  if (partes.length < 3) return {};
  return {
    dia: parseInt(partes[2]),
    mes: parseInt(partes[1]),
    mesCorto: MESES_CORTO[parseInt(partes[1]) - 1],
  };
}

export default function HomePlayerScreen() {
  const { roleData, equipoId } = useContext(AuthContext);

  // roleData es el registro de la tabla jugadores
  const jugadorId = roleData?.id ?? null;

  const { stats, seasonStats, loading: loadingStats } = usePlayerStats(jugadorId);
  const { upcomingTrainings, loading: loadingTrainings } = useTrainings(equipoId);

  const isLoading = loadingStats || loadingTrainings;

  const proximoEntrenamiento = upcomingTrainings[0] ?? null;
  const { dia, mesCorto } = parseFecha(proximoEntrenamiento?.fecha);

  // Últimos 3 partidos del jugador (los más recientes están primero)
  const ultimosPartidos = stats.slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <View style={styles.playerInfo}>
              <Avatar.Icon
                size={64}
                icon="account"
                style={styles.avatar}
              />
              <View style={styles.playerDetails}>
                <Text variant="headlineSmall" style={styles.playerName}>
                  {roleData?.nombre ?? 'Jugador'}
                </Text>
                <View style={styles.playerMeta}>
                  {roleData?.posicion ? (
                    <Chip icon="shield" compact style={styles.positionChip}>
                      {roleData.posicion}
                    </Chip>
                  ) : null}
                  {roleData?.dorsal != null && (
                    <Text variant="bodyMedium" style={styles.playerNumber}>
                      #{roleData.dorsal}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Surface>

        {isLoading ? (
          <ActivityIndicator size="large" color="#00AA13" style={styles.loader} />
        ) : (
          <>
            {/* Estadísticas de rendimiento */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Rendimiento
            </Text>
            <View style={styles.statsGrid}>
              <Surface style={[styles.statBox, styles.greenBox]} elevation={1}>
                <Icon name="soccer" size={28} color="#00AA13" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {seasonStats?.total_goles ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Goles
                </Text>
              </Surface>

              <Surface style={[styles.statBox, styles.blueBox]} elevation={1}>
                <Icon name="shoe-cleat" size={28} color="#1E88E5" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {seasonStats?.total_asistencias ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Asistencias
                </Text>
              </Surface>

              <Surface style={[styles.statBox, styles.orangeBox]} elevation={1}>
                <Icon name="run-fast" size={28} color="#105E7A" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {seasonStats?.partidos_jugados ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Partidos
                </Text>
              </Surface>

              <Surface style={[styles.statBox, styles.purpleBox]} elevation={1}>
                <Icon name="clock-outline" size={28} color="#9C27B0" />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {seasonStats?.total_minutos ?? 0}'
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Minutos
                </Text>
              </Surface>
            </View>

            {/* Próximo entrenamiento */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Próximo entrenamiento
            </Text>
            {proximoEntrenamiento ? (
              <Card style={styles.trainingCard}>
                <Card.Content>
                  <View style={styles.trainingHeader}>
                    <View style={styles.trainingDate}>
                      <Text variant="headlineLarge" style={styles.dateDay}>
                        {dia}
                      </Text>
                      <Text variant="bodySmall" style={styles.dateMonth}>
                        {mesCorto}
                      </Text>
                    </View>
                    <View style={styles.trainingInfo}>
                      <Text variant="titleMedium" style={styles.trainingTitle}>
                        {proximoEntrenamiento.tipo || 'Entrenamiento'}
                      </Text>
                      <View style={styles.trainingMeta}>
                        <Icon name="clock" size={16} color="#666" />
                        <Text variant="bodyMedium" style={styles.trainingTime}>
                          {proximoEntrenamiento.hora_inicio} - {proximoEntrenamiento.hora_fin}
                        </Text>
                      </View>
                      {proximoEntrenamiento.ubicacion ? (
                        <View style={styles.trainingMeta}>
                          <Icon name="map-marker" size={16} color="#666" />
                          <Text variant="bodyMedium" style={styles.trainingLocation}>
                            {proximoEntrenamiento.ubicacion}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.trainingFooter}>
                    <Chip icon="check-circle" style={styles.confirmedChip}>
                      Programado
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.trainingCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.noDataText}>
                    No hay entrenamientos próximos programados
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Últimos partidos */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Últimos partidos
            </Text>
            {ultimosPartidos.length > 0 ? (
              <Surface style={styles.matchesCard} elevation={1}>
                {ultimosPartidos.map((stat, index) => {
                  const resultado =
                    stat.goles_favor > stat.goles_contra
                      ? 'Victoria'
                      : stat.goles_favor < stat.goles_contra
                      ? 'Derrota'
                      : 'Empate';
                  const resultadoColor =
                    resultado === 'Victoria'
                      ? '#E8F5E9'
                      : resultado === 'Derrota'
                      ? '#FFEBEE'
                      : '#FFF3E0';
                  const { dia: diaP, mesCorto: mesP } = parseFecha(stat.fecha);

                  return (
                    <View key={stat.id ?? index}>
                      {index > 0 && <View style={styles.matchDivider} />}
                      <View style={styles.matchRow}>
                        <View style={styles.matchResult}>
                          <Text variant="bodyMedium" style={styles.matchDate}>
                            {diaP} {mesP}
                          </Text>
                          <Text variant="titleMedium" style={styles.matchScore}>
                            {stat.goles_favor}-{stat.goles_contra}
                          </Text>
                          <Chip compact style={{ backgroundColor: resultadoColor }}>
                            {resultado}
                          </Chip>
                        </View>
                        <View style={styles.matchDetails}>
                          <Text variant="bodyMedium">vs. {stat.rival}</Text>
                          <View style={styles.playerMatchStats}>
                            {stat.goles > 0 && (
                              <>
                                <Icon name="soccer" size={16} color="#00AA13" />
                                <Text variant="bodySmall" style={styles.matchStat}>
                                  {stat.goles} {stat.goles === 1 ? 'gol' : 'goles'}
                                </Text>
                              </>
                            )}
                            {stat.asistencias > 0 && (
                              <>
                                <Icon name="shoe-cleat" size={16} color="#1E88E5" />
                                <Text variant="bodySmall" style={[styles.matchStat, { color: '#1E88E5' }]}>
                                  {stat.asistencias} {stat.asistencias === 1 ? 'asistencia' : 'asistencias'}
                                </Text>
                              </>
                            )}
                            {stat.goles === 0 && stat.asistencias === 0 && (
                              <Text variant="bodySmall" style={styles.noContribText}>
                                {stat.minutos_jugados}' jugados
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </Surface>
            ) : (
              <Surface style={styles.matchesCard} elevation={1}>
                <Text variant="bodyMedium" style={styles.noDataText}>
                  Aún no hay partidos registrados
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
  headerContent: {
    gap: 16,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    backgroundColor: '#00AA13',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  positionChip: {
    backgroundColor: '#E8F5E9',
  },
  playerNumber: {
    fontWeight: 'bold',
    color: '#00AA13',
  },
  loader: {
    marginTop: 60,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    color: '#1A1A1A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  greenBox: {
    borderTopWidth: 3,
    borderTopColor: '#00AA13',
  },
  blueBox: {
    borderTopWidth: 3,
    borderTopColor: '#1E88E5',
  },
  orangeBox: {
    borderTopWidth: 3,
    borderTopColor: '#105E7A',
  },
  purpleBox: {
    borderTopWidth: 3,
    borderTopColor: '#9C27B0',
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1A1A1A',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  trainingCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  trainingHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  trainingDate: {
    backgroundColor: '#00AA13',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  dateDay: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateMonth: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trainingInfo: {
    flex: 1,
    gap: 6,
  },
  trainingTitle: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  trainingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trainingTime: {
    color: '#666',
  },
  trainingLocation: {
    color: '#666',
  },
  trainingFooter: {
    flexDirection: 'row',
  },
  confirmedChip: {
    backgroundColor: '#E8F5E9',
  },
  matchesCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  matchDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  matchRow: {
    flexDirection: 'row',
    gap: 16,
  },
  matchResult: {
    alignItems: 'center',
    gap: 4,
  },
  matchDate: {
    color: '#666',
  },
  matchScore: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  matchDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  playerMatchStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  matchStat: {
    color: '#00AA13',
    fontWeight: '600',
  },
  noContribText: {
    color: '#999',
  },
  noDataText: {
    color: '#999',
    fontStyle: 'italic',
  },
});
