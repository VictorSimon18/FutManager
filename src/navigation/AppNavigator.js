import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import HomeCoachScreen from '../screens/HomeCoachScreen';
import HomePlayerScreen from '../screens/HomePlayerScreen';
import HomeFanScreen from '../screens/HomeFanScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#00AA13',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{
            title: 'Selecciona tu rol',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="HomeCoach"
          component={HomeCoachScreen}
          options={{
            title: 'Panel de Entrenador',
            headerStyle: {
              backgroundColor: '#FF6F00',
            },
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="HomePlayer"
          component={HomePlayerScreen}
          options={{
            title: 'Mi Perfil',
            headerStyle: {
              backgroundColor: '#00AA13',
            },
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="HomeFan"
          component={HomeFanScreen}
          options={{
            title: 'Mi Equipo',
            headerStyle: {
              backgroundColor: '#1E88E5',
            },
            headerBackVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
