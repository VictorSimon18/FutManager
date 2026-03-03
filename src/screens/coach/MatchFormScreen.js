import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { createMatch, getMatchById, updateMatch } from '../../database/services/matchService';
import { formatDate, formatTime, parseDate, parseTime } from '../../utils/dateUtils';

const TIPOS = [
  { value: 'liga', label: 'Liga' },
  { value: 'copa', label: 'Copa' },
  { value: 'amistoso', label: 'Amistoso' },
  { value: 'torneo', label: 'Torneo' },
];

const MODALIDADES = [
  { value: '7 vs 7', label: '7 vs 7' },
  { value: '11 vs 11', label: '11 vs 11' },
  { value: 'Fútbol sala', label: 'Sala' },
  { value: 'Fútbol playa', label: 'Playa' },
];

function SectionTitle({ text }) {
  return <Text variant="titleSmall" style={styles.sectionTitle}>{text}</Text>;
}

export default function MatchFormScreen({ route, navigation }) {
  const { equipoId } = useContext(AuthContext);
  const matchId = route.params?.matchId ?? null;
  const isEditing = matchId != null;

  const [rival, setRival] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipo, setTipo] = useState('liga');
  const [modalidad, setModalidad] = useState('11 vs 11');
  const [esLocal, setEsLocal] = useState(true);
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) loadMatch();
  }, [matchId]);

  async function loadMatch() {
    try {
      const m = await getMatchById(matchId);
      if (!m) return;
      setRival(m.rival ?? '');
      // Convertir formatos de almacenamiento a formatos de visualización
      setFecha(m.fecha ? formatDate(m.fecha) : '');
      setHora(m.hora ? formatTime(m.hora) : '');
      setUbicacion(m.ubicacion ?? '');
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
        rival: rival.trim(),
        // Convertir DD-MM-YYYY → YYYY-MM-DD y HH.MM → HH:MM para SQLite
        fecha: parseDate(fecha.trim()),
        hora: hora ? parseTime(hora) : null,
        ubicacion: ubicacion || null,
        tipo,
        modalidad,
        es_local: esLocal ? 1 : 0,
        notas: notas || null,
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <SectionTitle text="Datos del partido" />
      <TextInput
        label="Rival *"
        value={rival}
        onChangeText={setRival}
        mode="outlined"
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
          style={[styles.input, styles.flex2]}
          placeholder="DD-MM-YYYY"
          keyboardType="numeric"
          error={!!errors.fecha}
        />
        <TextInput
          label="Hora"
          value={hora}
          onChangeText={setHora}
          mode="outlined"
          style={[styles.input, styles.flex1]}
          placeholder="HH.MM"
          keyboardType="numeric"
        />
      </View>
      <HelperText type="error" visible={!!errors.fecha}>{errors.fecha}</HelperText>

      <TextInput
        label="Ubicación"
        value={ubicacion}
        onChangeText={setUbicacion}
        mode="outlined"
        style={styles.input}
        placeholder="Campo Municipal de Vallecas"
      />

      <SectionTitle text="Tipo de partido" />
      <SegmentedButtons
        value={tipo}
        onValueChange={setTipo}
        buttons={TIPOS}
        style={styles.segmented}
      />

      <SectionTitle text="Modalidad" />
      <SegmentedButtons
        value={modalidad}
        onValueChange={setModalidad}
        buttons={MODALIDADES}
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
          trackColor={{ true: '#FF6F00', false: '#BDBDBD' }}
          thumbColor="#fff"
        />
      </View>

      <SectionTitle text="Notas" />
      <TextInput
        label="Notas adicionales"
        value={notas}
        onChangeText={setNotas}
        mode="outlined"
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
        buttonColor="#FF6F00"
      >
        {isEditing ? 'Guardar cambios' : 'Crear partido'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#FF6F00',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: { backgroundColor: '#fff', marginBottom: 0 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  segmented: { marginBottom: 4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  switchLabel: { fontWeight: '600', color: '#1A1A1A' },
  saveBtn: { marginTop: 24, borderRadius: 8 },
});
