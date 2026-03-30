import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { createMatch, getMatchById, updateMatch } from '../../database/services/matchService';
import { formatDate, formatTime, parseDate, parseTime } from '../../utils/dateUtils';

// Foco blanco + texto escrito en blanco
const INPUT_THEME = {
  colors: {
    primary: '#FFFFFF',
    onSurfaceVariant: '#FFFFFF',
    onSurface: '#FFFFFF',
    outline: 'rgba(255,255,255,0.15)',
  },
};
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
  return <Text style={styles.sectionTitle}>{text}</Text>;
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
    navigation.setParams({ selectedLocation: undefined });
  }, [route.params?.selectedLocation]);

  // Restaurar datos del formulario al volver del mapa (por si el componente se desmontó)
  useEffect(() => {
    const fd = route.params?.formData;
    if (!fd) return;
    setRival(fd.rival ?? '');
    setFecha(fd.fecha ?? '');
    setHora(fd.hora ?? '');
    setTipo(fd.tipo ?? 'liga');
    setModalidad(fd.modalidad ?? '11 vs 11');
    setEsLocal(fd.esLocal ?? true);
    setNotas(fd.notas ?? '');
    navigation.setParams({ formData: undefined });
  }, [route.params?.formData]);

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
      // Al editar volvemos a la pantalla anterior (MatchDetail); al crear,
      // navegamos explícitamente a MatchList para evitar bucle con MapScreen.
      if (isEditing) {
        navigation.goBack();
      } else {
        navigation.navigate('MatchList');
      }
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
      // Preservar el estado del formulario para restaurarlo al volver
      formData: { rival, fecha, hora, tipo, modalidad, esLocal, notas },
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

        {/* ── Información del partido ── */}
        <SectionTitle text="Información del partido" />
        <View style={styles.group}>
          <TextInput
            label="Rival *"
            value={rival}
            onChangeText={setRival}
            mode="outlined"
            theme={INPUT_THEME}
            textColor="#FFFFFF"
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
              textColor="#FFFFFF"
              style={[styles.input, styles.flex2]}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              error={!!errors.fecha}
            />
            <TextInput
              label="Hora"
              value={hora}
              onChangeText={setHora}
              mode="outlined"
              theme={INPUT_THEME}
              textColor="#FFFFFF"
              style={[styles.input, styles.flex1]}
              placeholder="HH.MM"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
            />
          </View>
          <HelperText type="error" visible={!!errors.fecha}>{errors.fecha}</HelperText>
        </View>

        {/* ── Detalles ── */}
        <SectionTitle text="Detalles" />
        <View style={styles.group}>
          <Text style={styles.selectorLabel}>Tipo de partido</Text>
          <SegmentedButtons
            value={tipo}
            onValueChange={setTipo}
            buttons={TIPOS}
            theme={SEGMENTED_THEME}
            style={styles.segmented}
          />
          <Text style={[styles.selectorLabel, { marginTop: 14 }]}>Modalidad</Text>
          <SegmentedButtons
            value={modalidad}
            onValueChange={setModalidad}
            buttons={MODALIDADES}
            theme={SEGMENTED_THEME}
            style={styles.segmented}
          />
          <Text style={[styles.selectorLabel, { marginTop: 14 }]}>Condición</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {esLocal ? '🏠 Local' : '✈️ Visitante'}
            </Text>
            <Switch
              value={esLocal}
              onValueChange={setEsLocal}
              trackColor={{ true: '#FFFFFF', false: '#555' }}
              thumbColor={esLocal ? '#1A1A2E' : '#fff'}
            />
          </View>
        </View>

        {/* ── Ubicación ── */}
        <SectionTitle text="Ubicación" />
        <View style={styles.group}>
          {ubicacion ? (
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Icon name="map-marker" size={20} color="#00AA13" />
                <Text style={styles.locationText} numberOfLines={2}>
                  {ubicacion}
                </Text>
              </View>
              <TouchableOpacity style={styles.changeBtn} onPress={abrirMapa} activeOpacity={0.75}>
                <Icon name="pencil" size={15} color="#FF6F00" />
                <Text style={styles.changeBtnText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.mapPlaceholder} onPress={abrirMapa} activeOpacity={0.75}>
              <Icon name="map-search" size={28} color="rgba(255,255,255,0.5)" />
              <Text style={styles.mapPlaceholderText}>Seleccionar ubicación en el mapa</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Notas ── */}
        <SectionTitle text="Notas" />
        <View style={styles.group}>
          <TextInput
            label="Notas adicionales"
            value={notas}
            onChangeText={setNotas}
            mode="outlined"
            theme={INPUT_THEME}
            textColor="#FFFFFF"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
          buttonColor="#00AA13"
        >
          {isEditing ? 'Guardar cambios' : 'Crear partido'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  content:   { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  group: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input:  { backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 0 },
  row:    { flexDirection: 'row', gap: 12, marginTop: 12 },
  flex1:  { flex: 1 },
  flex2:  { flex: 2 },
  selectorLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  segmented: { marginBottom: 4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  switchLabel: { fontWeight: '600', color: '#FFFFFF', fontSize: 14 },
  saveBtn: { marginTop: 8, borderRadius: 12, paddingVertical: 4 },

  // Selector de ubicación — sin ubicación seleccionada
  mapPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
    fontSize: 14,
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
