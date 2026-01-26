import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function AuroraBackground({ children, colors = null, intensity = 'medium' }) {
  // Default aurora colors (green theme for FutManager)
  const auroraColors = colors || [
    '#00AA13', // Primary green
    '#00D416', // Light green
    '#008F10', // Dark green
    '#00FF4C', // Bright green
    '#004D0A', // Deep green
  ];

  // Animation values for floating orbs
  const orb1Position = useRef(new Animated.ValueXY({ x: -width * 0.2, y: -height * 0.1 })).current;
  const orb2Position = useRef(new Animated.ValueXY({ x: width * 0.5, y: height * 0.3 })).current;
  const orb3Position = useRef(new Animated.ValueXY({ x: width * 0.2, y: height * 0.6 })).current;
  const orb4Position = useRef(new Animated.ValueXY({ x: width * 0.7, y: height * 0.7 })).current;

  const orb1Scale = useRef(new Animated.Value(1)).current;
  const orb2Scale = useRef(new Animated.Value(0.8)).current;
  const orb3Scale = useRef(new Animated.Value(1.2)).current;
  const orb4Scale = useRef(new Animated.Value(0.9)).current;

  const orb1Opacity = useRef(new Animated.Value(0.6)).current;
  const orb2Opacity = useRef(new Animated.Value(0.5)).current;
  const orb3Opacity = useRef(new Animated.Value(0.55)).current;
  const orb4Opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    // Animate orb 1 - slow floating motion
    const animateOrb1 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb1Position.x, {
              toValue: width * 0.2,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Position.y, {
              toValue: height * 0.15,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Scale, {
              toValue: 1.3,
              duration: 8000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Opacity, {
              toValue: 0.7,
              duration: 8000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb1Position.x, {
              toValue: -width * 0.15,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Position.y, {
              toValue: height * 0.05,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Scale, {
              toValue: 0.9,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Opacity, {
              toValue: 0.5,
              duration: 10000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb1Position.x, {
              toValue: -width * 0.2,
              duration: 7000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Position.y, {
              toValue: -height * 0.1,
              duration: 7000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Scale, {
              toValue: 1,
              duration: 7000,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Opacity, {
              toValue: 0.6,
              duration: 7000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Animate orb 2 - different path
    const animateOrb2 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb2Position.x, {
              toValue: width * 0.8,
              duration: 12000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Position.y, {
              toValue: height * 0.5,
              duration: 12000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Scale, {
              toValue: 1.1,
              duration: 12000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Opacity, {
              toValue: 0.65,
              duration: 12000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb2Position.x, {
              toValue: width * 0.3,
              duration: 9000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Position.y, {
              toValue: height * 0.15,
              duration: 9000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Scale, {
              toValue: 0.7,
              duration: 9000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Opacity, {
              toValue: 0.4,
              duration: 9000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb2Position.x, {
              toValue: width * 0.5,
              duration: 11000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Position.y, {
              toValue: height * 0.3,
              duration: 11000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Scale, {
              toValue: 0.8,
              duration: 11000,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Opacity, {
              toValue: 0.5,
              duration: 11000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Animate orb 3 - yet another path
    const animateOrb3 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb3Position.x, {
              toValue: width * 0.6,
              duration: 15000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Position.y, {
              toValue: height * 0.4,
              duration: 15000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Scale, {
              toValue: 1,
              duration: 15000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Opacity, {
              toValue: 0.6,
              duration: 15000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb3Position.x, {
              toValue: -width * 0.1,
              duration: 13000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Position.y, {
              toValue: height * 0.75,
              duration: 13000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Scale, {
              toValue: 1.4,
              duration: 13000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Opacity, {
              toValue: 0.7,
              duration: 13000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb3Position.x, {
              toValue: width * 0.2,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Position.y, {
              toValue: height * 0.6,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Scale, {
              toValue: 1.2,
              duration: 10000,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Opacity, {
              toValue: 0.55,
              duration: 10000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Animate orb 4 - fourth path
    const animateOrb4 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb4Position.x, {
              toValue: width * 0.9,
              duration: 14000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Position.y, {
              toValue: height * 0.85,
              duration: 14000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Scale, {
              toValue: 1.2,
              duration: 14000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Opacity, {
              toValue: 0.55,
              duration: 14000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb4Position.x, {
              toValue: width * 0.5,
              duration: 11000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Position.y, {
              toValue: height * 0.6,
              duration: 11000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Scale, {
              toValue: 0.8,
              duration: 11000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Opacity, {
              toValue: 0.35,
              duration: 11000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb4Position.x, {
              toValue: width * 0.7,
              duration: 9000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Position.y, {
              toValue: height * 0.7,
              duration: 9000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Scale, {
              toValue: 0.9,
              duration: 9000,
              useNativeDriver: true,
            }),
            Animated.timing(orb4Opacity, {
              toValue: 0.45,
              duration: 9000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animateOrb1();
    animateOrb2();
    animateOrb3();
    animateOrb4();
  }, []);

  const orbSize = Math.min(width, height) * 0.7;
  const blurIntensity = intensity === 'high' ? 80 : intensity === 'low' ? 30 : 50;

  return (
    <View style={styles.container}>
      {/* Base gradient background */}
      <LinearGradient
        colors={['#050510', '#0a0a1a', '#0f0f25', '#0a0a15']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated orbs layer */}
      <View style={styles.orbsContainer}>
        {/* Orb 1 - Top left area */}
        <Animated.View
          style={[
            styles.orb,
            {
              width: orbSize,
              height: orbSize,
              transform: [
                { translateX: orb1Position.x },
                { translateY: orb1Position.y },
                { scale: orb1Scale },
              ],
              opacity: orb1Opacity,
            },
          ]}
        >
          <LinearGradient
            colors={[auroraColors[0], auroraColors[1], 'transparent']}
            style={styles.orbGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Orb 2 - Center right area */}
        <Animated.View
          style={[
            styles.orb,
            {
              width: orbSize * 0.85,
              height: orbSize * 0.85,
              transform: [
                { translateX: orb2Position.x },
                { translateY: orb2Position.y },
                { scale: orb2Scale },
              ],
              opacity: orb2Opacity,
            },
          ]}
        >
          <LinearGradient
            colors={[auroraColors[2], auroraColors[3], 'transparent']}
            style={styles.orbGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>

        {/* Orb 3 - Bottom left area */}
        <Animated.View
          style={[
            styles.orb,
            {
              width: orbSize * 1.1,
              height: orbSize * 1.1,
              transform: [
                { translateX: orb3Position.x },
                { translateY: orb3Position.y },
                { scale: orb3Scale },
              ],
              opacity: orb3Opacity,
            },
          ]}
        >
          <LinearGradient
            colors={[auroraColors[4], auroraColors[0], 'transparent']}
            style={styles.orbGradient}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>

        {/* Orb 4 - Bottom right area */}
        <Animated.View
          style={[
            styles.orb,
            {
              width: orbSize * 0.95,
              height: orbSize * 0.95,
              transform: [
                { translateX: orb4Position.x },
                { translateY: orb4Position.y },
                { scale: orb4Scale },
              ],
              opacity: orb4Opacity,
            },
          ]}
        >
          <LinearGradient
            colors={[auroraColors[1], auroraColors[4], 'transparent']}
            style={styles.orbGradient}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>

      {/* Blur overlay for smooth aurora effect */}
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.webBlur]} />
      )}

      {/* Subtle vignette overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.7, 1]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  orbsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  orbGradient: {
    flex: 1,
    borderRadius: 9999,
  },
  webBlur: {
    backgroundColor: 'rgba(5, 5, 16, 0.4)',
    backdropFilter: 'blur(50px)',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
