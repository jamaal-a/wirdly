import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';

// TypeScript interfaces
interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface CompassState {
  heading: number;
  qiblaDirection: number;
  userLocation: LocationCoords | null;
  distance: number | null;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'permission_denied' | 'sensor_unavailable' | 'error';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.7, 300);
const KAABA_COORDS = { latitude: 21.4225, longitude: 39.8262 };

const QiblaCompass: React.FC = () => {
  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [compassState, setCompassState] = useState<CompassState>({
    heading: 0,
    qiblaDirection: 0,
    userLocation: null,
    distance: null,
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Animation refs
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const magnetometerSubscription = useRef<{ remove: () => void } | null>(null);

  // Calculate bearing between two coordinates
  const calculateBearing = (
    from: LocationCoords,
    to: LocationCoords
  ): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const dLon = toRad(to.longitude - from.longitude);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = toDeg(Math.atan2(y, x));

    return (bearing + 360) % 360;
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    from: LocationCoords,
    to: LocationCoords
  ): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(from.latitude)) *
        Math.cos(toRad(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize location and sensors
  const initializeCompass = async () => {
    try {
      setLoadingState('loading');
      setErrorMessage('');

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLoadingState('permission_denied');
        setErrorMessage('Location permission is required to find Qibla direction');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Calculate Qibla direction and distance
      const qiblaDirection = calculateBearing(userCoords, KAABA_COORDS);
      const distance = calculateDistance(userCoords, KAABA_COORDS);

      setCompassState((prev) => ({
        ...prev,
        qiblaDirection,
        userLocation: userCoords,
        distance,
      }));

      // Check if magnetometer is available
      const isAvailable = await Magnetometer.isAvailableAsync();
      
      if (!isAvailable) {
        setLoadingState('sensor_unavailable');
        setErrorMessage('Compass sensor is not available on this device');
        return;
      }

      // Start magnetometer updates
      Magnetometer.setUpdateInterval(100); // Update every 100ms (optimized for battery)
      
      magnetometerSubscription.current = Magnetometer.addListener((data) => {
        const { x, y } = data;
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 360) % 360;

        setCompassState((prev) => ({
          ...prev,
          heading: angle,
        }));

        // Smooth rotation animation
        Animated.timing(rotationAnim, {
          toValue: -angle,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });

      setLoadingState('success');
    } catch (error) {
      console.error('Error initializing compass:', error);
      setLoadingState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize compass');
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeCompass();

    // Cleanup on unmount
    return () => {
      if (magnetometerSubscription.current) {
        magnetometerSubscription.current.remove();
      }
    };
  }, []);

  // Calculate relative Qibla angle
  const getRelativeQiblaAngle = (): number => {
    return (compassState.qiblaDirection - compassState.heading + 360) % 360;
  };

  // Format distance
  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  // Render loading state
  if (loadingState === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error states
  if (loadingState === 'permission_denied' || loadingState === 'sensor_unavailable' || loadingState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>
            {loadingState === 'permission_denied' ? '📍' : '🧭'}
          </Text>
          <Text style={styles.errorTitle}>
            {loadingState === 'permission_denied' && 'Permission Required'}
            {loadingState === 'sensor_unavailable' && 'Sensor Unavailable'}
            {loadingState === 'error' && 'Something Went Wrong'}
          </Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeCompass}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main compass UI
  const relativeAngle = getRelativeQiblaAngle();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Qibla Direction</Text>
          <Text style={styles.subtitle}>
            {compassState.userLocation
              ? `${compassState.userLocation.latitude.toFixed(4)}°, ${compassState.userLocation.longitude.toFixed(4)}°`
              : 'Locating...'}
          </Text>
        </View>

        {/* Compass Card */}
        <View style={styles.compassCard}>
          {/* Outer ring with degrees */}
          <View style={styles.compassOuter}>
            <Animated.View
              style={[
                styles.compassRing,
                {
                  transform: [
                    {
                      rotate: rotationAnim.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Cardinal directions */}
              <Text style={[styles.cardinal, styles.cardinalN]}>N</Text>
              <Text style={[styles.cardinal, styles.cardinalE]}>E</Text>
              <Text style={[styles.cardinal, styles.cardinalS]}>S</Text>
              <Text style={[styles.cardinal, styles.cardinalW]}>W</Text>

              {/* Degree markers */}
              {[...Array(36)].map((_, i) => {
                const degree = i * 10;
                const isCardinal = degree % 90 === 0;
                if (isCardinal) return null;

                const rad = (degree - 90) * (Math.PI / 180);
                const radius = COMPASS_SIZE / 2 - 30;
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);

                return (
                  <View
                    key={i}
                    style={[
                      styles.marker,
                      {
                        left: COMPASS_SIZE / 2 + x - 1,
                        top: COMPASS_SIZE / 2 + y - 5,
                      },
                    ]}
                  />
                );
              })}
            </Animated.View>

            {/* Fixed Qibla arrow (rotates to point to Qibla) */}
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  transform: [{ rotate: `${relativeAngle}deg` }],
                },
              ]}
            >
              <View style={styles.arrow} />
              <View style={styles.arrowTail} />
            </Animated.View>

            {/* Center circle */}
            <View style={styles.centerCircle}>
              <Text style={styles.kaaba}>🕋</Text>
            </View>
          </View>

          {/* Bearing info */}
          <View style={styles.bearingContainer}>
            <Text style={styles.bearingValue}>{Math.round(compassState.qiblaDirection)}°</Text>
            <Text style={styles.bearingLabel}>Qibla Bearing</Text>
          </View>
        </View>

        {/* Distance info */}
        {compassState.distance !== null && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Distance to Kaaba</Text>
            <Text style={styles.infoValue}>{formatDistance(compassState.distance)}</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionText}>
            Hold your device flat and rotate until the green arrow points upward
          </Text>
        </View>

        {/* Refresh button */}
        <TouchableOpacity style={styles.refreshButton} onPress={initializeCompass}>
          <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  compassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 24,
  },
  compassOuter: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  compassRing: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardinal: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '700',
  },
  cardinalN: {
    top: 10,
    color: '#4CAF50',
  },
  cardinalE: {
    right: 15,
    color: '#757575',
  },
  cardinalS: {
    bottom: 10,
    color: '#757575',
  },
  cardinalW: {
    left: 15,
    color: '#757575',
  },
  marker: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: '#BDBDBD',
  },
  arrowContainer: {
    position: 'absolute',
    width: 40,
    height: COMPASS_SIZE / 2 - 50,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  arrowTail: {
    width: 6,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  centerCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  kaaba: {
    fontSize: 32,
  },
  bearingContainer: {
    alignItems: 'center',
  },
  bearingValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  bearingLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  instructionsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default QiblaCompass;


