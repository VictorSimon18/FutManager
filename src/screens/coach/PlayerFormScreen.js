import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { createPlayer, getPlayerById, updatePlayer } from '../../database/services/playerService';

const POSICIONES = [
  'Portero',
  'Defensa Central',
  'Lateral Derecho',
  'Lateral Izquierdo',
  'Carrilero Derecho',
  'Carrilero Izquierdo',
  'Mediocentro Defensivo',
  'Mediocentro',
  'Mediapunta',
  'Extremo Izquierdo',
  'Extremo Derecho',
  'Delantero',
  'Líbero',
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
    if (isEditing) {
      loadPlayer();
    }
  }, [playerId]);

  async function loadPlayer() {
    try {
      const p = await getPlayerById(playerId);
      if (!p) return;
      setNombre(p.nombre ?? '');
      setSexo(p.sexo ?? 'Hombre');
      setDorsal(p.dorsal != null ? String(p.dorsal) : '');
      setPosicion(p.posicion ?? '');
      setFechaNacimiento(p.fecha_nacimiento ?? '');
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
        fecha_nacimiento: fechaNacimiento || null,
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <SectionTitle text="Datos personales" />

      <TextInput
        label="Nombre completo *"
        value={nombre}
        onChangeText={setNombre}
        mode="outlined"
        style={styles.input}
        error={!!errors.nombre}
      />
      <HelperText type="error" visible={!!errors.nombre}>{errors.nombre}</HelperText>

      <Text variant="bodySmall" style={styles.fieldLabel}>Sexo</Text>
      <SegmentedButtons
        value={sexo}
        onValueChange={setSexo}
        buttons={SEXO_OPTIONS}
        style={styles.segmented}
      />

      <TextInput
        label="Fecha de nacimiento (YYYY-MM-DD)"
        value={fechaNacimiento}
        onChangeText={setFechaNacimiento}
        mode="outlined"
        style={styles.input}
        placeholder="2000-01-15"
        keyboardType="numeric"
      />

      <SectionTitle text="Datos deportivos" />

      <TextInput
        label="Dorsal"
        value={dorsal}
        onChangeText={setDorsal}
        mode="outlined"
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
        style={styles.segmented}
      />

      <SectionTitle text="Datos físicos" />
      <View style={styles.row}>
        <TextInput
          label="Altura (m)"
          value={altura}
          onChangeText={setAltura}
          mode="outlined"
          style={[styles.input, styles.halfInput]}
          keyboardType="decimal-pad"
          placeholder="1.80"
          error={!!errors.altura}
        />
        <TextInput
          label="Peso (kg)"
          value={peso}
          onChangeText={setPeso}
          mode="outlined"
          style={[styles.input, styles.halfInput]}
          keyboardType="numeric"
          placeholder="75"
          error={!!errors.peso}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        buttonColor="#FF6F00"
      >
        {isEditing ? 'Guardar cambios' : 'Crear jugador'}
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
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabel: { color: '#555', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#fff', marginBottom: 0 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  segmented: { marginBottom: 8 },
  // Grid de posiciones con chips táctiles
  posicionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  posicionBtn: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  posicionBtnActive: {
    borderColor: '#FF6F00',
    backgroundColor: '#FF6F00',
  },
  posicionLabel: { fontSize: 13, color: '#555' },
  posicionLabelActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { marginTop: 24, borderRadius: 8 },
});
