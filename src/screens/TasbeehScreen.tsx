import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { settingsService } from '../services/settingsService';
import { themeService } from '../services/themeService';

const { width, height } = Dimensions.get('window');

const TasbeehScreen: React.FC = () => {
  const theme = themeService.getCurrentTheme();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [scaleValue] = useState(new Animated.Value(1));
  const [isCompleted, setIsCompleted] = useState(false);
  const [themeKey, setThemeKey] = useState(0);

  // Listen for theme changes
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSettings = settingsService.getAllSettings();
      const currentTheme = themeService.getCurrentTheme();
      // Force re-render if theme changed
      if (currentTheme.background !== theme.background) {
        setThemeKey(prev => prev + 1);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [theme.background]);

  useEffect(() => {
    if (count >= target && !isCompleted) {
      setIsCompleted(true);
      Vibration.vibrate([0, 200, 100, 200]); // Vibration pattern for completion
    } else if (count < target && isCompleted) {
      setIsCompleted(false);
    }
  }, [count, target, isCompleted]);

  const handleTap = () => {
    // Animate the tap
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Check vibration setting
    const settings = settingsService.getAllSettings();
    if (settings.tasbeehVibration) {
      Vibration.vibrate(50);
    }

    setCount(prev => prev + 1);
  };

  const resetCounter = () => {
    Alert.alert(
      'Reset Counter',
      'Are you sure you want to reset the counter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setCount(0);
            setIsCompleted(false);
          },
        },
      ]
    );
  };

  const changeTarget = () => {
    Alert.alert(
      'Change Target',
      'Select a new target count:',
      [
        { text: '33', onPress: () => setTarget(33) },
        { text: '99', onPress: () => setTarget(99) },
        { text: '100', onPress: () => setTarget(100) },
        { text: '313', onPress: () => setTarget(313) },
        { text: '1000', onPress: () => setTarget(1000) },
        { text: 'Custom', onPress: () => {/* You can add custom input here */} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getProgressPercentage = () => {
    return Math.min((count / target) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return theme.success; // Green when complete
    if (percentage >= 75) return theme.warning; // Orange when close
    if (percentage >= 50) return theme.info; // Blue when halfway
    return theme.error; // Red when just started
  };

  const getDynamicStyles = () => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      tapArea: {
        flex: 1,
      },
      fullScreenTap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      content: {
        alignItems: 'center',
        padding: 20,
      },
      progressContainer: {
        width: '100%',
        marginBottom: 40,
      },
      progressBar: {
        height: 8,
        backgroundColor: theme.border,
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        borderRadius: 4,
      },
      progressText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        textAlign: 'center',
      },
      countContainer: {
        alignItems: 'center',
        marginBottom: 40,
      },
      countText: {
        fontSize: 120,
        fontWeight: 'bold',
        color: theme.primary,
        textAlign: 'center',
        lineHeight: 140,
      },
      completedText: {
        color: theme.success,
      },
      completedLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.success,
        marginTop: 10,
      },
      targetContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
      },
      targetLabel: {
        fontSize: 18,
        color: theme.textSecondary,
        marginRight: 12,
      },
      targetButton: {
        backgroundColor: theme.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
      },
      targetButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
      },
      instructionsContainer: {
        alignItems: 'center',
      },
      instructionsText: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 8,
      },
      instructionsSubtext: {
        fontSize: 16,
        color: theme.textSecondary,
        textAlign: 'center',
      },
      resetContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
      },
      resetButton: {
        backgroundColor: theme.card,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: theme.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      resetButtonText: {
        color: theme.error,
        fontSize: 16,
        fontWeight: '600',
      },
    });
  };

  const dynamicStyles = getDynamicStyles();

  return (
    <SafeAreaView key={themeKey} style={dynamicStyles.container}>
      <Animated.View 
        style={[
          dynamicStyles.tapArea, 
          { 
            transform: [{ scale: scaleValue }],
            backgroundColor: theme.background,
          }
        ]}
      >
        <TouchableOpacity
          style={dynamicStyles.fullScreenTap}
          onPress={handleTap}
          activeOpacity={0.9}
        >
          <View style={dynamicStyles.content}>
            {/* Progress Bar */}
            <View style={dynamicStyles.progressContainer}>
              <View style={dynamicStyles.progressBar}>
                <View 
                  style={[
                    dynamicStyles.progressFill, 
                    { 
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: getProgressColor(),
                    }
                  ]} 
                />
              </View>
              <Text style={dynamicStyles.progressText}>
                {count} / {target}
              </Text>
            </View>

            {/* Main Count Display */}
            <View style={dynamicStyles.countContainer}>
              <Text style={[
                dynamicStyles.countText,
                isCompleted && dynamicStyles.completedText
              ]}>
                {count}
              </Text>
              {isCompleted && (
                <Text style={dynamicStyles.completedLabel}>Completed! 🎉</Text>
              )}
            </View>

            {/* Target Display */}
            <View style={dynamicStyles.targetContainer}>
              <Text style={dynamicStyles.targetLabel}>Target: {target}</Text>
              <TouchableOpacity onPress={changeTarget} style={dynamicStyles.targetButton}>
                <Text style={dynamicStyles.targetButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={dynamicStyles.instructionsContainer}>
              <Text style={dynamicStyles.instructionsText}>
                Tap anywhere to count
              </Text>
              <Text style={dynamicStyles.instructionsSubtext}>
                {count === 0 ? 'Start your dhikr' : 'Keep counting...'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Reset Button - Fixed position */}
      <View style={dynamicStyles.resetContainer}>
        <TouchableOpacity style={dynamicStyles.resetButton} onPress={resetCounter}>
          <Text style={dynamicStyles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TasbeehScreen;

