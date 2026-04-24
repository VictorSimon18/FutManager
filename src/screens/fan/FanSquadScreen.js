/**
 * FanSquadScreen.js — Plantilla del equipo (solo lectura) para el rol aficionado.
 */

import React, { useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { usePlayers } from '../../hooks/usePlayers';
import { getPositionColor } from '../../utils/positionUtils';

function getInitials(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function FanSquadScreen() {
  const { equipoId } = useContext(AuthContext);
  const { players, loading, refresh } = usePlayers(equipoId);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const renderItem = ({ item }) => {
    const positionColor = getPositionColor(item.posicion);
    return (
      <View style={styles.playerCard}>
        {item.foto_url ? (
          <Avatar.Image size={52} source={{ uri: item.foto_url }} />
        ) : (
          <Avatar.Text
            size={52}
            label={getInitials(item.nombre)}
            style={{ backgroundColor: positionColor }}
            labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }}
          />
        )}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>{item.nombre}</Text>
          {item.posicion ? (
            <Text style={[styles.playerPosition, { color: positionColor }]}>
              {item.posicion}
            </Text>
          ) : null}
          {item.pie_dominante ? (
            <Text style={styles.playerMeta}>Pie {item.pie_dominante}</Text>
          ) : null}
        </View>
        {item.dorsal != null ? (
          <View style={[styles.dorsalBadge, { borderColor: positionColor }]}>
            <Text style={[styles.dorsalText, { color: positionColor }]}>
              {item.dorsal}
            </Text>
          </View>
        ) : null}
      </View>
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
        <Icon name="account-group" size={22} color={FAN_ACCENT} />
        <Text style={styles.headerText}>
          PLANTILLA {loading ? '' : `(${players.length})`}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={FAN_ACCENT} style={styles.loader} />
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name="account-off" size={56} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No hay jugadores en la plantilla</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';
const FAN_ACCENT = '#1E88E5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  loader: { marginTop: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    color: FAN_ACCENT,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  listContent: { padding: 16, paddingTop: 8, paddingBottom: 40 },

  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  playerInfo: { flex: 1, gap: 2 },
  playerName: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  playerPosition: { fontSize: 12, fontWeight: '600' },
  playerMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontStyle: 'italic' },
  dorsalBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dorsalText: { fontWeight: 'bold', fontSize: 18 },

  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
});
