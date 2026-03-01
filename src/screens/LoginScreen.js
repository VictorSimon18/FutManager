import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Divider,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AuroraBackground from '../components/AuroraBackground';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, register } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputTheme = {
    colors: {
      primary: '#00AA13',
      onSurfaceVariant: '#aaa',
      onSurface: '#fff',
      surfaceVariant: 'rgba(255,255,255,0.08)',
      outline: 'rgba(255,255,255,0.2)',
    },
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        // AuthContext actualiza isAuthenticated → AppNavigator redirige automáticamente
      } else {
        // Registro + login automático a continuación
        await register(name, email, password);
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('carlos@futmanager.es');
    setPassword('123456');
    setIsLogin(true);
    setError('');
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <AuroraBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo/Icono */}
            <View style={styles.logoContainer}>
              <Icon name="soccer" size={80} color="#00FF4C" />
              <Text variant="headlineLarge" style={styles.title}>
                FutManager
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Gestiona tu equipo de fútbol
              </Text>
            </View>

            {/* Formulario */}
            <Surface style={styles.formContainer} elevation={0}>
              {!isLogin && (
                <TextInput
                  label="Nombre completo"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                  theme={inputTheme}
                  textColor="#fff"
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
                theme={inputTheme}
                textColor="#fff"
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                theme={inputTheme}
                textColor="#fff"
              />

              {/* Mensaje de error */}
              {error ? (
                <HelperText type="error" visible style={styles.errorText}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                buttonColor="#00AA13"
                textColor="#fff"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  isLogin ? 'Iniciar Sesión' : 'Registrarse'
                )}
              </Button>

              {/* Hint con credenciales de demo */}
              {isLogin && (
                <Button
                  mode="text"
                  onPress={fillDemoCredentials}
                  textColor="rgba(255,255,255,0.45)"
                  compact
                  style={styles.demoButton}
                >
                  Demo: carlos@futmanager.es / 123456
                </Button>
              )}

              <Divider style={styles.divider} />

              {/* Toggle Login/Registro */}
              <View style={styles.toggleContainer}>
                <Text variant="bodyMedium" style={styles.toggleText}>
                  {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                </Text>
                <Button
                  mode="text"
                  onPress={handleToggleMode}
                  compact
                  textColor="#00FF4C"
                >
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </Button>
              </View>
            </Surface>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#FF5252',
    marginBottom: 8,
    fontSize: 13,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  demoButton: {
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.7)',
  },
});
