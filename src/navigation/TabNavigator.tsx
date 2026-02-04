import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Animated, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { RootTabParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import WirdsScreen from '../screens/WirdsScreen';
import TasbeehScreen from '../screens/TasbeehScreen';
import PrayerHistoryScreen from '../screens/PrayerHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { themeService } from '../services/themeService';
import { settingsService } from '../services/settingsService';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator: React.FC = () => {
  const theme = themeService.getCurrentTheme();
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

  return (
    <Tab.Navigator
      key={themeKey}
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
          alignSelf: 'center',
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerShown: false,
        tabBarButton: (props) => <AnimatedTabButton {...props} />,
      }}
      initialRouteName="Wirds"
    >
      <Tab.Screen
        name="Wirds"
        component={WirdsScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon type="wirds" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Salah',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon type="salah" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasbeeh"
        component={TasbeehScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon type="tasbeeh" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={PrayerHistoryScreen}
        options={{
          tabBarLabel: 'Times',
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon type="times" color={color} focused={focused} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon type="settings" color={color} focused={focused} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Animated tab button with pop effect
const AnimatedTabButton: React.FC<any> = ({ children, onPress, accessibilityState, ...props }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const focused = accessibilityState?.selected;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={{ flex: 1 }}
    >
      <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Tab icon component with outline/filled styles
const TabIcon: React.FC<{ type: 'wirds' | 'salah' | 'tasbeeh' | 'times' | 'settings'; color: string; focused: boolean; size: number }> = ({ 
  type, 
  color, 
  focused, 
  size 
}) => {
  const iconSize = size * 1.2;
  const strokeWidth = focused ? 0 : 1.5;
  const fillColor = focused ? color : 'none';
  const strokeColor = focused ? color : color;

  const renderIcon = () => {
    switch (type) {
      case 'wirds':
        // Beads/circle icon
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            {focused ? (
              <>
                <Circle cx="12" cy="12" r="8" fill={fillColor} />
                <Circle cx="12" cy="8" r="1.5" fill={focused ? 'white' : color} />
                <Circle cx="12" cy="16" r="1.5" fill={focused ? 'white' : color} />
                <Circle cx="8" cy="12" r="1.5" fill={focused ? 'white' : color} />
                <Circle cx="16" cy="12" r="1.5" fill={focused ? 'white' : color} />
              </>
            ) : (
              <>
                <Circle cx="12" cy="12" r="8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="12" cy="8" r="1.5" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="12" cy="16" r="1.5" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="8" cy="12" r="1.5" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="16" cy="12" r="1.5" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              </>
            )}
          </Svg>
        );
      
      case 'salah':
        // Mosque/minaret icon
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            {focused ? (
              <>
                <Path d="M12 2L4 8V22H20V8L12 2Z" fill={fillColor} />
                <Path d="M8 8H16V14H8V8Z" fill={focused ? 'white' : color} />
                <Path d="M10 10H14V12H10V10Z" fill={focused ? color : 'white'} />
                <Circle cx="12" cy="4" r="1.5" fill={focused ? 'white' : color} />
              </>
            ) : (
              <>
                <Path d="M12 2L4 8V22H20V8L12 2Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Path d="M8 8H16V14H8V8Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Path d="M10 10H14V12H10V10Z" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="12" cy="4" r="1.5" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              </>
            )}
          </Svg>
        );
      
      case 'tasbeeh':
        // Counter/square with dots
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            {focused ? (
              <>
                <Rect x="6" y="6" width="12" height="12" rx="2" fill={fillColor} />
                <Circle cx="10" cy="10" r="1" fill={focused ? 'white' : color} />
                <Circle cx="14" cy="10" r="1" fill={focused ? 'white' : color} />
                <Circle cx="10" cy="14" r="1" fill={focused ? 'white' : color} />
                <Circle cx="14" cy="14" r="1" fill={focused ? 'white' : color} />
              </>
            ) : (
              <>
                <Rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="10" cy="10" r="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="14" cy="10" r="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="10" cy="14" r="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="14" cy="14" r="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              </>
            )}
          </Svg>
        );
      
      case 'times':
        // Calendar icon
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            {focused ? (
              <>
                <Rect x="4" y="6" width="16" height="14" rx="2" fill={fillColor} />
                <Path d="M4 10H20" stroke={focused ? 'white' : color} strokeWidth={1.5} />
                <Circle cx="8" cy="14" r="1" fill={focused ? 'white' : color} />
                <Circle cx="12" cy="14" r="1" fill={focused ? 'white' : color} />
                <Circle cx="16" cy="14" r="1" fill={focused ? 'white' : color} />
                <Path d="M8 2V6M16 2V6" stroke={focused ? 'white' : color} strokeWidth={1.5} strokeLinecap="round" />
              </>
            ) : (
              <>
                <Rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Path d="M4 10H20" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="8" cy="14" r="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="12" cy="14" r="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Circle cx="16" cy="14" r="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                <Path d="M8 2V6M16 2V6" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
              </>
            )}
          </Svg>
        );
      
      case 'settings':
        // Gear/settings icon
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
            {focused ? (
              <Path 
                d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" 
                fill={fillColor}
              />
            ) : (
              <Path 
                d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" 
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {renderIcon()}
    </View>
  );
};

export default TabNavigator; 