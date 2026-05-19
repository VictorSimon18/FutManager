import React, { useState, useEffect, useContext } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { Text, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { getPlayersByTeam } from '../../database/services/playerService';
import { loadLiveMatchState, saveLiveMatchState } from '../../utils/liveMatchStore';

const COACH_COLOR = '#105E7A';
const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

export default function LiveMatchSetupScreen({ route, navigation }) {
  const { matchId, rival } = route.params;
  const { equipoId } = useContext(AuthContext);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starters, setStarters] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const ps = await getPlayersByTeam(equipoId);
        setPlayers(ps);

        // Check for existing live state (resume)
        const saved = await loadLiveMatchState(matchId);
        if (saved) {
          Alert.alert(
            'Partido en curso',
            'Hay un partido en directo guardado para este partido. ¿Deseas retomarlo?',
            [
              {
                text: 'Retomar',
                onPress: () => {
                  navigation.replace('LiveMatch', { matchId, rival, resumeState: saved });
                },
              },
              { text: 'Nuevo partido', style: 'destructive' },
            ]
          );
        }
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar la plantilla.');
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId, equipoId]);

  function toggleStarter(playerId) {
    setStarters(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  }

  function handleStart() {
    if (starters.size === 0) {
      Alert.alert('Sin titulares', 'Selecciona al menos un jugador titular para comenzar.');
      return;
    }
    const onPitch = players
      .filter(p => starters.has(p.id))
      .map(p => ({ id: p.id, nombre: p.nombre, dorsal: p.dorsal, posicion: p.posicion, minuteOn: 0 }));
    const bench = players
      .filter(p => !starters.has(p.id))
      .map(p => ({ id: p.id, nombre: p.nombre, dorsal: p.dorsal, posicion: p.posicion }));

    const initialState = {
      matchId,
      rival,
      phase: 'first_half',
      elapsedSeconds: 0,
      timerRunning: false,
      rivalGoals: 0,
      onPitch,
      bench,
      starters: onPitch.map(p => ({ ...p })),
      events: [],
    };

    navigation.replace('LiveMatch', { matchId, rival, resumeState: initialState });
  }

  const renderPlayer = ({ item }) => {
    const isStarter = starters.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.playerRow, isStarter && styles.playerRowActive]}
        onPress={() => toggleStarter(item.id)}
        activeOpacity={0.75}
      >
        <View style={[styles.starterIndicator, isStarter && styles.starterIndicatorOn]} />
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, isStarter && styles.playerNameActive]}>
            {item.nombre}
          </Text>
          <Text style={styles.playerMeta}>
            {item.posicion || 'Sin posición'}{item.dorsal != null ? `  ·  #${item.dorsal}` : ''}
          </Text>
        </View>
        <Icon
          name={isStarter ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
          size={22}
          color={isStarter ? COACH_COLOR : 'rgba(255,255,255,0.25)'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Alineación inicial</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>vs. {rival}</Text>
        <View style={styles.counterRow}>
          <Chip
            icon="account-check"
            style={styles.counterChip}
            textStyle={styles.counterChipText}
          >
            {starters.size} titulares
          </Chip>
          <Chip
            icon="account-minus"
            style={styles.counterChipBench}
            textStyle={styles.counterChipText}
          >
            {players.length - starters.size} suplentes
          </Chip>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COACH_COLOR} style={{ marginTop: 60 }} />
      ) : (
        <>
          <FlatList
            data={players}
            keyExtractor={p => String(p.id)}
            renderItem={renderPlayer}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay jugadores en la plantilla.</Text>
            }
          />
          <View style={styles.footer}>
            <Button
              mode="contained"
              icon="whistle"
              onPress={handleStart}
              buttonColor={COACH_COLOR}
              contentStyle={styles.startBtnContent}
              style={styles.startBtn}
            >
              Iniciar partido
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  title: { color: '#fff', fontWeight: 'bold' },
  subtitle: { color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  counterRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  counterChip: { backgroundColor: 'rgba(16,94,122,0.35)', borderWidth: 1, borderColor: COACH_COLOR },
  counterChipBench: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: GLASS_BORDER },
  counterChipText: { color: '#fff', fontSize: 12 },

  listContent: { paddingVertical: 8, paddingHorizontal: 12 },
  divider: { backgroundColor: GLASS_BORDER },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  playerRowActive: {
    backgroundColor: 'rgba(16,94,122,0.18)',
  },
  starterIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  starterIndicatorOn: {
    backgroundColor: COACH_COLOR,
  },
  playerInfo: { flex: 1 },
  playerName: { color: 'rgba(255,255,255,0.65)', fontWeight: '500', fontSize: 15 },
  playerNameActive: { color: '#fff', fontWeight: 'bold' },
  playerMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },

  emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 40 },

  footer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
  },
  startBtn: { borderRadius: 10 },
  startBtnContent: { paddingVertical: 6 },
});
