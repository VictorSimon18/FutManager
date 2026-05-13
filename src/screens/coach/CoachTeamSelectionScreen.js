import React, { useContext, useState, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, Modal, Alert,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { Text, Avatar, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import {
  getTeamsByCoachUserId,
  createTeam,
  updateTeam,
  deleteTeam,
  linkCoachToTeam,
} from '../../database/services/teamService';

const COACH_ACCENT = '#105E7A';
const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

const INPUT_THEME = {
  colors: {
    primary: '#FFFFFF',
    onSurfaceVariant: '#FFFFFF',
    onSurface: '#FFFFFF',
    outline: 'rgba(255,255,255,0.15)',
  },
};

export default function CoachTeamSelectionScreen() {
  const { user, selectTeam } = useContext(AuthContext);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de crear/editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [temporada, setTemporada] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTeamsByCoachUserId(user.id);
      setTeams(result);
    } catch (e) {
      console.error('[CoachTeamSelection] Error cargando equipos:', e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useFocusEffect(useCallback(() => { loadTeams(); }, [loadTeams]));

  function openCreate() {
    setEditingTeam(null);
    setNombre('');
    setCategoria('');
    setModalidad('');
    setTemporada('');
    setErrors({});
    setModalVisible(true);
  }

  function openEdit(team) {
    setEditingTeam(team);
    setNombre(team.nombre ?? '');
    setCategoria(team.categoria ?? '');
    setModalidad(team.modalidad ?? '');
    setTemporada(team.temporada ?? '');
    setErrors({});
    setModalVisible(true);
  }

  function validate() {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre del equipo es obligatorio.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        nombre: nombre.trim(),
        categoria: categoria.trim() || null,
        modalidad: modalidad.trim() || null,
        temporada: temporada.trim() || null,
      };
      if (editingTeam) {
        await updateTeam(editingTeam.id, data);
      } else {
        const newTeamId = await createTeam(data);
        await linkCoachToTeam(user.id, newTeamId);
      }
      setModalVisible(false);
      loadTeams();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el equipo. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(team) {
    Alert.alert(
      'Eliminar equipo',
      `¿Seguro que quieres eliminar "${team.nombre}"? Se perderán todos los datos asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTeam(team.id);
              loadTeams();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el equipo.');
            }
          },
        },
      ]
    );
  }

  async function handleSelectTeam(team) {
    try {
      await selectTeam(team.id);
    } catch {
      Alert.alert('Error', 'No se pudo acceder al equipo.');
    }
  }

  const renderTeam = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleSelectTeam(item)}
      activeOpacity={0.75}
    >
      <View style={styles.teamAccent} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName} numberOfLines={1}>{item.nombre}</Text>
        <View style={styles.teamMeta}>
          {item.categoria ? (
            <View style={styles.metaItem}>
              <Icon name="account-group" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{item.categoria}</Text>
            </View>
          ) : null}
          {item.modalidad ? (
            <View style={styles.metaItem}>
              <Icon name="soccer" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{item.modalidad}</Text>
            </View>
          ) : null}
          {item.temporada ? (
            <View style={styles.metaItem}>
              <Icon name="calendar" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{item.temporada}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.teamActions}>
        <TouchableOpacity
          onPress={() => openEdit(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          <Icon name="pencil-outline" size={20} color="rgba(255,255,255,0.55)" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          <Icon name="delete-outline" size={20} color="#E53935" />
        </TouchableOpacity>
        <Icon name="chevron-right" size={24} color={COACH_ACCENT} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineSmall" style={styles.welcomeText}>Mis Equipos</Text>
            <Text variant="bodyMedium" style={styles.headerSubtext}>
              Selecciona o crea un equipo
            </Text>
          </View>
          <Avatar.Icon size={56} icon="whistle" style={styles.avatar} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COACH_ACCENT} style={styles.loader} />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTeam}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name="shield-off-outline" size={72} color="rgba(255,255,255,0.12)" />
              <Text style={styles.emptyTitle}>No tienes equipos todavía</Text>
              <Text style={styles.emptySubtitle}>
                Pulsa el botón + para crear tu primer equipo
              </Text>
            </View>
          }
        />
      )}

      {/* FAB nuevo equipo */}
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.8}>
        <Icon name="plus" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal crear / editar */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={['#1a3040', '#0f2027']}
              style={StyleSheet.absoluteFill}
              borderRadius={20}
            />
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingTeam ? 'Editar equipo' : 'Nuevo equipo'}
            </Text>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TextInput
                label="Nombre del equipo *"
                value={nombre}
                onChangeText={setNombre}
                mode="outlined"
                theme={INPUT_THEME}
                textColor="#FFFFFF"
                style={styles.input}
                error={!!errors.nombre}
              />
              <HelperText type="error" visible={!!errors.nombre}>
                {errors.nombre}
              </HelperText>

              <TextInput
                label="Categoría (ej: Infantil, Senior...)"
                value={categoria}
                onChangeText={setCategoria}
                mode="outlined"
                theme={INPUT_THEME}
                textColor="#FFFFFF"
                style={styles.input}
              />

              <TextInput
                label="Modalidad (ej: 11 vs 11, 7 vs 7...)"
                value={modalidad}
                onChangeText={setModalidad}
                mode="outlined"
                theme={INPUT_THEME}
                textColor="#FFFFFF"
                style={styles.input}
              />

              <TextInput
                label="Temporada (ej: 2025-2026)"
                value={temporada}
                onChangeText={setTemporada}
                mode="outlined"
                theme={INPUT_THEME}
                textColor="#FFFFFF"
                style={[styles.input, { marginBottom: 24 }]}
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelBtn}
                  textColor="rgba(255,255,255,0.7)"
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                  buttonColor={COACH_ACCENT}
                  style={styles.saveBtn}
                >
                  {editingTeam ? 'Guardar cambios' : 'Crear equipo'}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },

  header: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtext: { color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  avatar: { backgroundColor: COACH_ACCENT },
  loader: { marginTop: 60 },

  listContent: { padding: 16, paddingBottom: 100 },

  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  teamAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: COACH_ACCENT,
  },
  teamInfo: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  teamName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  teamMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  teamActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 12,
  },
  iconBtn: { padding: 6 },

  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 16 },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 40,
  },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COACH_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
  },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 4 },
  modalButtons: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  cancelBtn: {
    flex: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  saveBtn: { flex: 1, borderRadius: 8 },
});
