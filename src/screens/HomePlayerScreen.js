import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Card, Avatar, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function HomePlayerScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <View style={styles.playerInfo}>
              <Avatar.Image
                size={64}
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              <View style={styles.playerDetails}>
                <Text variant="headlineSmall" style={styles.playerName}>
                  Juan Pérez
                </Text>
                <View style={styles.playerMeta}>
                  <Chip icon="shield" compact style={styles.positionChip}>
                    Delantero
                  </Chip>
                  <Text variant="bodyMedium" style={styles.playerNumber}>
                    #10
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Surface>

        {/* Performance Stats */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Rendimiento
        </Text>
        <View style={styles.statsGrid}>
          <Surface style={[styles.statBox, styles.greenBox]} elevation={1}>
            <Icon name="soccer" size={28} color="#00AA13" />
            <Text variant="headlineMedium" style={styles.statValue}>
              12
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Goles
            </Text>
          </Surface>

          <Surface style={[styles.statBox, styles.blueBox]} elevation={1}>
            <Icon name="shoe-cleat" size={28} color="#1E88E5" />
            <Text variant="headlineMedium" style={styles.statValue}>
              8
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Asistencias
            </Text>
          </Surface>

          <Surface style={[styles.statBox, styles.orangeBox]} elevation={1}>
            <Icon name="run-fast" size={28} color="#FF6F00" />
            <Text variant="headlineMedium" style={styles.statValue}>
              18
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Partidos
            </Text>
          </Surface>

          <Surface style={[styles.statBox, styles.purpleBox]} elevation={1}>
            <Icon name="clock-outline" size={28} color="#9C27B0" />
            <Text variant="headlineMedium" style={styles.statValue}>
              1.350'
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Minutos
            </Text>
          </Surface>
        </View>

        {/* Next Training */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Próximo entrenamiento
        </Text>
        <Card style={styles.trainingCard}>
          <Card.Content>
            <View style={styles.trainingHeader}>
              <View style={styles.trainingDate}>
                <Text variant="headlineLarge" style={styles.dateDay}>
                  20
                </Text>
                <Text variant="bodySmall" style={styles.dateMonth}>
                  ENE
                </Text>
              </View>
              <View style={styles.trainingInfo}>
                <Text variant="titleMedium" style={styles.trainingTitle}>
                  Entrenamiento Técnico
                </Text>
                <View style={styles.trainingMeta}>
                  <Icon name="clock" size={16} color="#666" />
                  <Text variant="bodyMedium" style={styles.trainingTime}>
                    17:00 - 19:00
                  </Text>
                </View>
                <View style={styles.trainingMeta}>
                  <Icon name="map-marker" size={16} color="#666" />
                  <Text variant="bodyMedium" style={styles.trainingLocation}>
                    Campo de entrenamiento
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.trainingFooter}>
              <Chip icon="check-circle" style={styles.confirmedChip}>
                Confirmado
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Progress */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Objetivos del mes
        </Text>
        <Surface style={styles.progressCard} elevation={1}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text variant="bodyLarge">Goles marcados</Text>
              <Text variant="bodyLarge" style={styles.progressValue}>
                4/6
              </Text>
            </View>
            <ProgressBar progress={0.66} color="#00AA13" style={styles.progressBar} />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text variant="bodyLarge">Asistencias</Text>
              <Text variant="bodyLarge" style={styles.progressValue}>
                3/5
              </Text>
            </View>
            <ProgressBar progress={0.6} color="#1E88E5" style={styles.progressBar} />
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text variant="bodyLarge">Entrenamientos</Text>
              <Text variant="bodyLarge" style={styles.progressValue}>
                8/10
              </Text>
            </View>
            <ProgressBar progress={0.8} color="#FF6F00" style={styles.progressBar} />
          </View>
        </Surface>

        {/* Recent Matches */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Últimos partidos
        </Text>
        <Surface style={styles.matchCard} elevation={1}>
          <View style={styles.matchRow}>
            <View style={styles.matchResult}>
              <Text variant="bodyMedium" style={styles.matchDate}>
                15 Ene
              </Text>
              <Text variant="titleMedium" style={styles.matchScore}>
                3-1
              </Text>
              <Chip icon="trophy" compact style={styles.winChip}>
                Victoria
              </Chip>
            </View>
            <View style={styles.matchDetails}>
              <Text variant="bodyMedium">vs. FC Barcelona</Text>
              <View style={styles.playerMatchStats}>
                <Icon name="soccer" size={16} color="#00AA13" />
                <Text variant="bodySmall" style={styles.matchStat}>
                  2 goles
                </Text>
              </View>
            </View>
          </View>
        </Surface>
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
    borderTopColor: '#FF6F00',
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
  progressCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressValue: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  matchCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
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
  winChip: {
    backgroundColor: '#E8F5E9',
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
  },
  matchStat: {
    color: '#00AA13',
    fontWeight: '600',
  },
});
