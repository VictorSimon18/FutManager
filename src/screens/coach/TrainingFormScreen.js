import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { createTraining, getTrainingById, updateTraining } from '../../database/services/trainingService';
import { formatDate, formatTime, parseDate, parseTime } from '../../utils/dateUtils';

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
  return <Text variant="titleSmall" style={styles.sectionTitle}>{text}</Text>;
}

export default function TrainingFormScreen({ route, navigation }) {
  const { equipoId } = useContext(AuthContext);
  const trainingId = route.params?.trainingId ?? null;
  const isEditing = trainingId != null;

  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipo, setTipo] = useState('Técnico');
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) loadTraining();
  }, [trainingId]);

  async function loadTraining() {
    try {
      const t = await getTrainingById(trainingId);
      if (!t) return;
      // Convertir formatos de almacenamiento a formatos de visualización
      setFecha(t.fecha ? formatDate(t.fecha) : '');
      setHoraInicio(t.hora_inicio ? formatTime(t.hora_inicio) : '');
      setHoraFin(t.hora_fin ? formatTime(t.hora_fin) : '');
      setUbicacion(t.ubicacion ?? '');
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
        equipo_id: equipoId,
        // Convertir DD-MM-YYYY → YYYY-MM-DD y HH.MM → HH:MM para SQLite
        fecha: parseDate(fecha.trim()),
        hora_inicio: horaInicio ? parseTime(horaInicio) : null,
        hora_fin: horaFin ? parseTime(horaFin) : null,
        ubicacion: ubicacion || null,
        tipo: tipo || null,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <SectionTitle text="Fecha y hora" />
      <TextInput
        label="Fecha *"
        value={fecha}
        onChangeText={setFecha}
        mode="outlined"
        style={styles.input}
        placeholder="DD-MM-YYYY"
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
          style={[styles.input, styles.half]}
          placeholder="HH.MM"
          keyboardType="numeric"
        />
        <TextInput
          label="Hora fin"
          value={horaFin}
          onChangeText={setHoraFin}
          mode="outlined"
          style={[styles.input, styles.half]}
          placeholder="HH.MM"
          keyboardType="numeric"
        />
      </View>

      <TextInput
        label="Ubicación"
        value={ubicacion}
        onChangeText={setUbicacion}
        mode="outlined"
        style={styles.input}
        placeholder="Ciudad Deportiva de Vallecas"
      />

      <SectionTitle text="Tipo de sesión" />
      <SegmentedButtons
        value={tipo}
        onValueChange={setTipo}
        buttons={TIPOS}
        style={styles.segmented}
      />
      <SegmentedButtons
        value={tipo}
        onValueChange={setTipo}
        buttons={TIPOS2}
        style={[styles.segmented, { marginTop: 8 }]}
      />

      <SectionTitle text="Descripción" />
      <TextInput
        label="Descripción / objetivos de la sesión"
        value={descripcion}
        onChangeText={setDescripcion}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Trabajaremos presión alta y salida de balón..."
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        buttonColor="#FF6F00"
      >
        {isEditing ? 'Guardar cambios' : 'Programar entrenamiento'}
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
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  half: { flex: 1 },
  segmented: {},
  saveBtn: { marginTop: 24, borderRadius: 8 },
});
