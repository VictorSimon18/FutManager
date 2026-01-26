import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = () => {
    navigation.navigate('RoleSelection');
  };

  const handleGoogleLogin = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo/Icono */}
          <View style={styles.logoContainer}>
            <Icon name="soccer" size={80} color="#00AA13" />
            <Text variant="headlineLarge" style={styles.title}>
              FutManager
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Gestiona tu equipo de fútbol
            </Text>
          </View>

          {/* Formulario */}
          <Surface style={styles.formContainer} elevation={2}>
            {!isLogin && (
              <TextInput
                label="Nombre completo"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
            )}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>

            <Divider style={styles.divider} />

            {/* Google Sign In */}
            <Button
              mode="outlined"
              onPress={handleGoogleLogin}
              style={styles.googleButton}
              contentStyle={styles.buttonContent}
              icon="google"
            >
              Continuar con Google
            </Button>

            {/* Toggle Login/Register */}
            <View style={styles.toggleContainer}>
              <Text variant="bodyMedium">
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              </Text>
              <Button
                mode="text"
                onPress={() => setIsLogin(!isLogin)}
                compact
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </Button>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#00AA13',
    marginTop: 16,
  },
  subtitle: {
    color: '#666',
    marginTop: 8,
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 20,
  },
  googleButton: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
