import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { createMatch, getMatchById, updateMatch } from '../../database/services/matchService';
import { formatDate, formatTime, parseDate, parseTime } from '../../utils/dateUtils';

const GLASS_BG     = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

// Color de foco azul para TextInput del entrenador (borde + label activo)
const INPUT_THEME = { colors: { primary: '#4287B3' } };
// Tema para selectores: seleccionado en blanco/negro, no seleccionado en blanco
const SEGMENTED_THEME = {
  colors: {
    secondaryContainer: '#FFFFFF',
    onSecondaryContainer: '#000000',
    onSurface: '#FFFFFF',
    outline: 'rgba(255,255,255,0.35)',
  },
};

const TIPOS = [
  { value: 'liga',     label: 'Liga' },
  { value: 'copa',     label: 'Copa' },
  { value: 'amistoso', label: 'Amistoso' },
  { value: 'torneo',   label: 'Torneo' },
];

const MODALIDADES = [
  { value: '7 vs 7',       label: '7 vs 7' },
  { value: '11 vs 11',     label: '11 vs 11' },
  { value: 'Fútbol sala',  label: 'Sala' },
  { value: 'Fútbol playa', label: 'Playa' },
];

function SectionTitle({ text }) {
  return <Text variant="titleSmall" style={styles.sectionTitle}>{text}</Text>;
}

export default function MatchFormScreen({ route, navigation }) {
  const { equipoId } = useContext(AuthContext);
  const matchId   = route.params?.matchId ?? null;
  const isEditing = matchId != null;

  const [rival,     setRival]     = useState('');
  const [fecha,     setFecha]     = useState('');
  const [hora,      setHora]      = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud,   setLatitud]   = useState(null);
  const [longitud,  setLongitud]  = useState(null);
  const [tipo,      setTipo]      = useState('liga');
  const [modalidad, setModalidad] = useState('11 vs 11');
  const [esLocal,   setEsLocal]   = useState(true);
  const [notas,     setNotas]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [errors,    setErrors]    = useState({});

  // Cargar partido en modo edición
  useEffect(() => {
    if (isEditing) loadMatch();
  }, [matchId]);

  // Recoger ubicación devuelta desde MapScreen
  useEffect(() => {
    const loc = route.params?.selectedLocation;
    if (!loc) return;
    setUbicacion(loc.address || loc.name || '');
    setLatitud(loc.latitude  ?? null);
    setLongitud(loc.longitude ?? null);
    // Limpiar el param para no reprocesar en siguientes focuses
    navigation.setParams({ selectedLocation: undefined });
  }, [route.params?.selectedLocation]);

  async function loadMatch() {
    try {
      const m = await getMatchById(matchId);
      if (!m) return;
      setRival(m.rival ?? '');
      setFecha(m.fecha ? formatDate(m.fecha) : '');
      setHora(m.hora  ? formatTime(m.hora)  : '');
      setUbicacion(m.ubicacion ?? '');
      setLatitud(m.latitud  ?? null);
      setLongitud(m.longitud ?? null);
      setTipo(m.tipo ?? 'liga');
      setModalidad(m.modalidad ?? '11 vs 11');
      setEsLocal(m.es_local === 1);
      setNotas(m.notas ?? '');
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el partido.');
    }
  }

  function validate() {
    const e = {};
    if (!rival.trim()) e.rival = 'El rival es obligatorio.';
    if (!fecha.trim()) {
      e.fecha = 'La fecha es obligatoria.';
    } else if (!/^\d{2}-\d{2}-\d{4}$/.test(fecha.trim())) {
      e.fecha = 'Formato incorrecto. Usa DD-MM-YYYY (ej: 15-03-2026).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        equipo_id: equipoId,
        rival:     rival.trim(),
        fecha:     parseDate(fecha.trim()),
        hora:      hora ? parseTime(hora) : null,
        ubicacion: ubicacion || null,
        latitud:   latitud   ?? null,
        longitud:  longitud  ?? null,
        tipo,
        modalidad,
        es_local: esLocal ? 1 : 0,
        notas:    notas || null,
      };
      if (isEditing) {
        await updateMatch(matchId, data);
      } else {
        await createMatch(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el partido. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function abrirMapa() {
    navigation.navigate('MapScreen', {
      currentLatitude:  latitud  ?? undefined,
      currentLongitude: longitud ?? undefined,
      currentAddress:   ubicacion || undefined,
    });
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <SectionTitle text="Datos del partido" />
        <TextInput
          label="Rival *"
          value={rival}
          onChangeText={setRival}
          mode="outlined"
          theme={INPUT_THEME}
          style={styles.input}
          error={!!errors.rival}
        />
        <HelperText type="error" visible={!!errors.rival}>{errors.rival}</HelperText>

        <View style={styles.row}>
          <TextInput
            label="Fecha *"
            value={fecha}
            onChangeText={setFecha}
            mode="outlined"
            theme={INPUT_THEME}
            style={[styles.input, styles.flex2]}
            placeholder="DD-MM-YYYY"
            placeholderTextColor="#fff"
            keyboardType="numeric"
            error={!!errors.fecha}
          />
          <TextInput
            label="Hora"
            value={hora}
            onChangeText={setHora}
            mode="outlined"
            theme={INPUT_THEME}
            style={[styles.input, styles.flex1]}
            placeholder="HH.MM"
            placeholderTextColor="#fff"
            keyboardType="numeric"
          />
        </View>
        <HelperText type="error" visible={!!errors.fecha}>{errors.fecha}</HelperText>

        {/* ── Selector de ubicación con mapa ── */}
        <SectionTitle text="Ubicación" />
        {ubicacion ? (
          // Hay ubicación seleccionada → mostrar dirección con botón para cambiar
          <View style={styles.locationCard}>
            <View style={styles.locationInfo}>
              <Icon name="map-marker" size={20} color="#00AA13" />
              <Text variant="bodyMedium" style={styles.locationText} numberOfLines={2}>
                {ubicacion}
              </Text>
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={abrirMapa} activeOpacity={0.75}>
              <Icon name="pencil" size={15} color="#FF6F00" />
              <Text style={styles.changeBtnText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Sin ubicación → botón para abrir el mapa
          <TouchableOpacity style={styles.mapPlaceholder} onPress={abrirMapa} activeOpacity={0.75}>
            <Icon name="map-search" size={28} color="rgba(255,255,255,0.5)" />
            <Text style={styles.mapPlaceholderText}>Seleccionar ubicación en el mapa</Text>
          </TouchableOpacity>
        )}

        <SectionTitle text="Tipo de partido" />
        <SegmentedButtons
          value={tipo}
          onValueChange={setTipo}
          buttons={TIPOS}
          theme={SEGMENTED_THEME}
          style={styles.segmented}
        />

        <SectionTitle text="Modalidad" />
        <SegmentedButtons
          value={modalidad}
          onValueChange={setModalidad}
          buttons={MODALIDADES}
          theme={SEGMENTED_THEME}
          style={styles.segmented}
        />

        <SectionTitle text="Condición" />
        <View style={styles.switchRow}>
          <Text variant="bodyMedium" style={styles.switchLabel}>
            {esLocal ? '🏠 Local' : '✈️ Visitante'}
          </Text>
          <Switch
            value={esLocal}
            onValueChange={setEsLocal}
            trackColor={{ true: '#105E7A', false: '#BDBDBD' }}
            thumbColor="#fff"
          />
        </View>

        <SectionTitle text="Notas" />
        <TextInput
          label="Notas adicionales"
          value={notas}
          onChangeText={setNotas}
          mode="outlined"
          theme={INPUT_THEME}
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
          buttonColor="#105E7A"
        >
          {isEditing ? 'Guardar cambios' : 'Crear partido'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  content:   { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#105E7A',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input:     { backgroundColor: '#4287B3', marginBottom: 0 },
  row:       { flexDirection: 'row', gap: 12 },
  flex1:     { flex: 1 },
  flex2:     { flex: 2 },
  segmented: { marginBottom: 4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  switchLabel: { fontWeight: '600', color: '#FFFFFF' },
  saveBtn: { marginTop: 24, borderRadius: 8 },

  // Selector de ubicación — sin ubicación seleccionada
  mapPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
  },
  mapPlaceholderText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    flex: 1,
  },

  // Selector de ubicación — con ubicación seleccionada
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: 'rgba(0,170,19,0.35)',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  locationText: {
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6F00',
  },
  changeBtnText: {
    color: '#FF6F00',
    fontSize: 13,
    fontWeight: '600',
  },
});
