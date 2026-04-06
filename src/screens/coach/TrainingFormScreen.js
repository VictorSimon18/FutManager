import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { createTraining, getTrainingById, updateTraining } from '../../database/services/trainingService';
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
  { value: 'Técnico', label: 'Técnico' },
  { value: 'Táctico', label: 'Táctico' },
  { value: 'Físico', label: 'Físico' },
];
const TIPOS2 = [
  { value: 'Técnico-táctico', label: 'Técnico-táctico' },
  { value: 'Preparación de partido', label: 'Prep. partido' },
  { value: 'Recuperación', label: 'Recuperación' },
];

function SectionTitle({ text }) {
  return <Text style={styles.sectionTitle}>{text}</Text>;
}

export default function TrainingFormScreen({ route, navigation }) {
  const { equipoId } = useContext(AuthContext);
  const trainingId = route.params?.trainingId ?? null;
  const isEditing = trainingId != null;

  const [fecha,       setFecha]       = useState('');
  const [horaInicio,  setHoraInicio]  = useState('');
  const [horaFin,     setHoraFin]     = useState('');
  const [tipo,        setTipo]        = useState('Técnico');
  const [descripcion, setDescripcion] = useState('');
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});

  useEffect(() => {
    if (isEditing) loadTraining();
  }, [trainingId]);

  async function loadTraining() {
    try {
      const t = await getTrainingById(trainingId);
      if (!t) return;
      setFecha(t.fecha ? formatDate(t.fecha) : '');
      setHoraInicio(t.hora_inicio ? formatTime(t.hora_inicio) : '');
      setHoraFin(t.hora_fin ? formatTime(t.hora_fin) : '');
      setTipo(t.tipo ?? 'Técnico');
      setDescripcion(t.descripcion ?? '');
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el entrenamiento.');
    }
  }

  function validate() {
    const e = {};
    if (!fecha.trim()) {
      e.fecha = 'La fecha es obligatoria.';
    } else if (!/^\d{2}-\d{2}-\d{4}$/.test(fecha.trim())) {
      e.fecha = 'Formato incorrecto. Usa DD-MM-YYYY (ej: 20-03-2026).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        equipo_id:   equipoId,
        fecha:       parseDate(fecha.trim()),
        hora_inicio: horaInicio ? parseTime(horaInicio) : null,
        hora_fin:    horaFin    ? parseTime(horaFin)    : null,
        tipo:        tipo       || null,
        descripcion: descripcion || null,
      };
      if (isEditing) {
        await updateTraining(trainingId, data);
      } else {
        await createTraining(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
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

        {/* ── Horario ── */}
        <SectionTitle text="Horario" />
        <View style={styles.group}>
          <TextInput
            label="Fecha *"
            value={fecha}
            onChangeText={setFecha}
            mode="outlined"
            theme={INPUT_THEME}
            textColor="#FFFFFF"
            style={styles.input}
            placeholder="DD-MM-YYYY"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="numeric"
            error={!!errors.fecha}
          />
          <HelperText type="error" visible={!!errors.fecha}>{errors.fecha}</HelperText>
          <View style={styles.row}>
            <TextInput
              label="Hora inicio"
              value={horaInicio}
              onChangeText={setHoraInicio}
              mode="outlined"
              theme={INPUT_THEME}
              textColor="#FFFFFF"
              style={[styles.input, styles.half]}
              placeholder="HH.MM"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
            />
            <TextInput
              label="Hora fin"
              value={horaFin}
              onChangeText={setHoraFin}
              mode="outlined"
              theme={INPUT_THEME}
              textColor="#FFFFFF"
              style={[styles.input, styles.half]}
              placeholder="HH.MM"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* ── Detalles ── */}
        <SectionTitle text="Detalles" />
        <View style={styles.group}>
          <Text style={styles.selectorLabel}>Tipo de sesión</Text>
          <SegmentedButtons
            value={tipo}
            onValueChange={setTipo}
            buttons={TIPOS}
            theme={SEGMENTED_THEME}
            style={styles.segmented}
          />
          <SegmentedButtons
            value={tipo}
            onValueChange={setTipo}
            buttons={TIPOS2}
            theme={SEGMENTED_THEME}
            style={[styles.segmented, { marginTop: 8 }]}
          />
        </View>

        {/* ── Descripción ── */}
        <SectionTitle text="Descripción" />
        <View style={styles.group}>
          <TextInput
            label="Descripción / objetivos de la sesión"
            value={descripcion}
            onChangeText={setDescripcion}
            mode="outlined"
            theme={INPUT_THEME}
            textColor="#FFFFFF"
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Trabajaremos presión alta y salida de balón..."
            placeholderTextColor="rgba(255,255,255,0.4)"
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
          {isEditing ? 'Guardar cambios' : 'Programar entrenamiento'}
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
  input: { backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 0 },
  row:   { flexDirection: 'row', gap: 12, marginTop: 12 },
  half:  { flex: 1 },
  selectorLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  segmented: {},
  saveBtn: { marginTop: 8, borderRadius: 12, paddingVertical: 4 },
});
