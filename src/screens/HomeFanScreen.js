import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Card, Avatar, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function HomeFanScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Team Info */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.teamHeader}>
            <Avatar.Icon size={72} icon="shield-star" style={styles.teamAvatar} />
            <View style={styles.teamInfo}>
              <Text variant="headlineSmall" style={styles.teamName}>
                Real Madrid CF
              </Text>
              <View style={styles.teamMeta}>
                <Chip icon="trophy" compact style={styles.leagueChip}>
                  La Liga
                </Chip>
                <Text variant="bodyMedium" style={styles.teamPosition}>
                  1º Posición
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Team Stats */}
        <View style={styles.statsContainer}>
          <Surface style={[styles.miniStat, styles.winStat]} elevation={1}>
            <Text variant="headlineMedium" style={styles.miniStatValue}>
              18
            </Text>
            <Text variant="bodySmall" style={styles.miniStatLabel}>
              Victorias
            </Text>
          </Surface>

          <Surface style={[styles.miniStat, styles.drawStat]} elevation={1}>
            <Text variant="headlineMedium" style={styles.miniStatValue}>
              3
            </Text>
            <Text variant="bodySmall" style={styles.miniStatLabel}>
              Empates
            </Text>
          </Surface>

          <Surface style={[styles.miniStat, styles.lossStat]} elevation={1}>
            <Text variant="headlineMedium" style={styles.miniStatValue}>
              2
            </Text>
            <Text variant="bodySmall" style={styles.miniStatLabel}>
              Derrotas
            </Text>
          </Surface>

          <Surface style={[styles.miniStat, styles.pointsStat]} elevation={1}>
            <Text variant="headlineMedium" style={styles.miniStatValue}>
              57
            </Text>
            <Text variant="bodySmall" style={styles.miniStatLabel}>
              Puntos
            </Text>
          </Surface>
        </View>

        {/* Next Match */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Próximo partido
        </Text>
        <Card style={styles.matchCard}>
          <Card.Content>
            <Chip icon="calendar" compact style={styles.dateChip}>
              Sábado, 25 Enero - 20:00
            </Chip>
            <View style={styles.matchup}>
              <View style={styles.team}>
                <Avatar.Icon size={56} icon="shield-star" style={styles.homeTeam} />
                <Text variant="titleMedium" style={styles.teamNameText}>
                  Real Madrid
                </Text>
              </View>
              <Text variant="headlineLarge" style={styles.vs}>
                VS
              </Text>
              <View style={styles.team}>
                <Avatar.Icon size={56} icon="shield" style={styles.awayTeam} />
                <Text variant="titleMedium" style={styles.teamNameText}>
                  Barcelona
                </Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.matchInfo}>
              <View style={styles.matchInfoRow}>
                <Icon name="map-marker" size={20} color="#666" />
                <Text variant="bodyMedium" style={styles.matchInfoText}>
                  Estadio Santiago Bernabéu
                </Text>
              </View>
              <View style={styles.matchInfoRow}>
                <Icon name="television" size={20} color="#666" />
                <Text variant="bodyMedium" style={styles.matchInfoText}>
                  Movistar La Liga
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Latest News */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Últimas noticias
        </Text>
        <Card style={styles.newsCard}>
          <Card.Cover source={{ uri: 'https://via.placeholder.com/400x200' }} />
          <Card.Content style={styles.newsContent}>
            <Text variant="bodySmall" style={styles.newsDate}>
              Hace 2 horas
            </Text>
            <Text variant="titleMedium" style={styles.newsTitle}>
              El equipo completa entrenamiento antes del clásico
            </Text>
            <Text variant="bodyMedium" style={styles.newsSnippet}>
              Todos los jugadores participaron en la sesión de preparación...
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.newsCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.newsDate}>
              Hace 5 horas
            </Text>
            <Text variant="titleMedium" style={styles.newsTitle}>
              Rueda de prensa: Ancelotti habla del próximo partido
            </Text>
            <Text variant="bodyMedium" style={styles.newsSnippet}>
              El entrenador del Madrid analiza el enfrentamiento contra el Barcelona...
            </Text>
          </Card.Content>
        </Card>

        {/* Top Scorers */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Máximos goleadores
        </Text>
        <Surface style={styles.scorersCard} elevation={1}>
          <View style={styles.scorerRow}>
            <View style={styles.scorerRank}>
              <Text variant="titleMedium" style={styles.rankNumber}>
                1
              </Text>
            </View>
            <Avatar.Image
              size={40}
              source={{ uri: 'https://via.placeholder.com/100' }}
            />
            <View style={styles.scorerInfo}>
              <Text variant="bodyLarge" style={styles.scorerName}>
                Karim Benzema
              </Text>
              <Text variant="bodySmall" style={styles.scorerPosition}>
                Delantero
              </Text>
            </View>
            <View style={styles.scorerStats}>
              <Text variant="titleLarge" style={styles.goals}>
                24
              </Text>
              <Icon name="soccer" size={20} color="#00AA13" />
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.scorerRow}>
            <View style={styles.scorerRank}>
              <Text variant="titleMedium" style={styles.rankNumber}>
                2
              </Text>
            </View>
            <Avatar.Image
              size={40}
              source={{ uri: 'https://via.placeholder.com/100' }}
            />
            <View style={styles.scorerInfo}>
              <Text variant="bodyLarge" style={styles.scorerName}>
                Vinicius Jr.
              </Text>
              <Text variant="bodySmall" style={styles.scorerPosition}>
                Extremo
              </Text>
            </View>
            <View style={styles.scorerStats}>
              <Text variant="titleLarge" style={styles.goals}>
                18
              </Text>
              <Icon name="soccer" size={20} color="#00AA13" />
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.scorerRow}>
            <View style={styles.scorerRank}>
              <Text variant="titleMedium" style={styles.rankNumber}>
                3
              </Text>
            </View>
            <Avatar.Image
              size={40}
              source={{ uri: 'https://via.placeholder.com/100' }}
            />
            <View style={styles.scorerInfo}>
              <Text variant="bodyLarge" style={styles.scorerName}>
                Rodrygo Goes
              </Text>
              <Text variant="bodySmall" style={styles.scorerPosition}>
                Extremo
              </Text>
            </View>
            <View style={styles.scorerStats}>
              <Text variant="titleLarge" style={styles.goals}>
                12
              </Text>
              <Icon name="soccer" size={20} color="#00AA13" />
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
  newsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  newsContent: {
    paddingTop: 12,
  },
  newsDate: {
    color: '#999',
    marginBottom: 8,
  },
  newsTitle: {
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  newsSnippet: {
    color: '#666',
    lineHeight: 20,
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
});
