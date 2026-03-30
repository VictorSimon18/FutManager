import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { createPlayer, getPlayerById, updatePlayer } from '../../database/services/playerService';
import { formatDate, parseDate } from '../../utils/dateUtils';

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

// Foco blanco: borde + label activo en blanco
const INPUT_THEME = {
  colors: {
    primary: '#FFFFFF',
    onSurfaceVariant: '#FFFFFF',
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

const POSICIONES = [
  'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
  'Carrilero Derecho', 'Carrilero Izquierdo', 'Mediocentro Defensivo',
  'Mediocentro', 'Mediapunta', 'Extremo Izquierdo', 'Extremo Derecho',
  'Delantero', 'Líbero',
];

const SEXO_OPTIONS = [
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Otro', label: 'Otro' },
];

const PIE_OPTIONS = [
  { value: 'Derecho', label: 'Derecho' },
  { value: 'Izquierdo', label: 'Izquierdo' },
  { value: 'Ambidiestro', label: 'Ambid.' },
];

function SectionTitle({ text }) {
  return <Text variant="titleSmall" style={styles.sectionTitle}>{text}</Text>;
}

function PosicionSelector({ selected, onSelect }) {
  return (
    <View style={styles.posicionGrid}>
      {POSICIONES.map(pos => {
        const active = selected === pos;
        return (
          <TouchableOpacity
            key={pos}
            onPress={() => onSelect(pos)}
            style={[styles.posicionBtn, active && styles.posicionBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.posicionLabel, active && styles.posicionLabelActive]}>
              {pos}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function PlayerFormScreen({ route, navigation }) {
  const { equipoId } = useContext(AuthContext);
  const playerId = route.params?.playerId ?? null;
  const isEditing = playerId != null;

  const [nombre, setNombre] = useState('');
  const [sexo, setSexo] = useState('Hombre');
  const [dorsal, setDorsal] = useState('');
  const [posicion, setPosicion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [pieDominante, setPieDominante] = useState('Derecho');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) loadPlayer();
  }, [playerId]);

  async function loadPlayer() {
    try {
      const p = await getPlayerById(playerId);
      if (!p) return;
      setNombre(p.nombre ?? '');
      setSexo(p.sexo ?? 'Hombre');
      setDorsal(p.dorsal != null ? String(p.dorsal) : '');
      setPosicion(p.posicion ?? '');
      setFechaNacimiento(p.fecha_nacimiento ? formatDate(p.fecha_nacimiento) : '');
      setAltura(p.altura != null ? String(p.altura) : '');
      setPeso(p.peso != null ? String(p.peso) : '');
      setPieDominante(p.pie_dominante ?? 'Derecho');
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el jugador.');
    }
  }

  function validate() {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (dorsal && (isNaN(Number(dorsal)) || Number(dorsal) <= 0)) {
      e.dorsal = 'El dorsal debe ser un número positivo.';
    }
    if (fechaNacimiento && !/^\d{2}-\d{2}-\d{4}$/.test(fechaNacimiento)) {
      e.fechaNacimiento = 'Formato incorrecto. Usa DD-MM-YYYY (ej: 15-03-2000).';
    }
    if (altura && isNaN(Number(altura))) e.altura = 'Introduce un valor válido.';
    if (peso && isNaN(Number(peso))) e.peso = 'Introduce un valor válido.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = {
        equipo_id: equipoId,
        nombre: nombre.trim(),
        sexo: sexo || null,
        dorsal: dorsal ? parseInt(dorsal) : null,
        posicion: posicion || null,
        fecha_nacimiento: fechaNacimiento ? parseDate(fechaNacimiento) : null,
        altura: altura ? parseFloat(altura) : null,
        peso: peso ? parseFloat(peso) : null,
        pie_dominante: pieDominante || null,
      };
      if (isEditing) {
        await updatePlayer(playerId, data);
      } else {
        await createPlayer(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el jugador. Inténtalo de nuevo.');
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
        <SectionTitle text="Datos personales" />

        <TextInput
          label="Nombre completo *"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          theme={INPUT_THEME}
          style={styles.input}
          error={!!errors.nombre}
        />
        <HelperText type="error" visible={!!errors.nombre}>{errors.nombre}</HelperText>

        <Text variant="bodySmall" style={styles.fieldLabel}>Sexo</Text>
        <SegmentedButtons
          value={sexo}
          onValueChange={setSexo}
          buttons={SEXO_OPTIONS}
          theme={SEGMENTED_THEME}
          style={styles.segmented}
        />

        <TextInput
          label="Fecha de nacimiento"
          value={fechaNacimiento}
          onChangeText={setFechaNacimiento}
          mode="outlined"
          theme={INPUT_THEME}
          style={styles.input}
          placeholder="DD-MM-YYYY"
          placeholderTextColor="#fff"
          keyboardType="numeric"
          error={!!errors.fechaNacimiento}
        />
        <HelperText type="error" visible={!!errors.fechaNacimiento}>{errors.fechaNacimiento}</HelperText>

        <SectionTitle text="Datos deportivos" />

        <TextInput
          label="Dorsal"
          value={dorsal}
          onChangeText={setDorsal}
          mode="outlined"
          theme={INPUT_THEME}
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.dorsal}
        />
        <HelperText type="error" visible={!!errors.dorsal}>{errors.dorsal}</HelperText>

        <Text variant="bodySmall" style={styles.fieldLabel}>Posición</Text>
        <PosicionSelector selected={posicion} onSelect={setPosicion} />

        <Text variant="bodySmall" style={styles.fieldLabel}>Pie dominante</Text>
        <SegmentedButtons
          value={pieDominante}
          onValueChange={setPieDominante}
          buttons={PIE_OPTIONS}
          theme={SEGMENTED_THEME}
          style={styles.segmented}
        />

        <SectionTitle text="Datos físicos" />
        <View style={styles.row}>
          <TextInput
            label="Altura (m)"
            value={altura}
            onChangeText={setAltura}
            mode="outlined"
            theme={INPUT_THEME}
            style={[styles.input, styles.halfInput]}
            keyboardType="decimal-pad"
            placeholder="1.80"
            placeholderTextColor="#fff"
            error={!!errors.altura}
          />
          <TextInput
            label="Peso (kg)"
            value={peso}
            onChangeText={setPeso}
            mode="outlined"
            theme={INPUT_THEME}
            style={[styles.input, styles.halfInput]}
            keyboardType="numeric"
            placeholder="75"
            placeholderTextColor="#fff"
            error={!!errors.peso}
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
          {isEditing ? 'Guardar cambios' : 'Crear jugador'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldLabel: { color: 'rgba(255,255,255,0.6)', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 0 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  segmented: { marginBottom: 8 },
  posicionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  posicionBtn: {
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: GLASS_BG,
  },
  posicionBtnActive: {
    borderColor: '#105E7A',
    backgroundColor: '#105E7A',
  },
  posicionLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  posicionLabelActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { marginTop: 24, borderRadius: 8 },
});
