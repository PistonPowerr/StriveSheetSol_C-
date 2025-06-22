import React, { useEffect, useRef, useState } from 'react';
import * as Font from 'expo-font';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import GuideScreen from './screens/GuideScreen';
import HomeScreen from './screens/HomeScreen';

const useCustomFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'Array-Regular': require('./assets/fonts/Array-Regular.ttf'),
        'Array-Wide': require('./assets/fonts/Array-Wide.ttf'),
      });
      setFontsLoaded(true);
    })();
  }, []);

  return fontsLoaded;
};

const Stack = createNativeStackNavigator();

export default function App() {
  const fontsLoaded = useCustomFonts();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [firstLaunch, setFirstLaunch] = useState(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        delay: 800,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => setIsLoading(false));

    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched');
        if (value === null) {
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          setFirstLaunch(true);
        } else {
          setFirstLaunch(false);
        }
      } catch (e) {
        console.error("Failed to read 'alreadyLaunched' from AsyncStorage", e);
        setFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, [fadeAnim, scaleAnim]);

  if (!fontsLoaded) {
    return null;
  }

  if (isLoading) {
    return (
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <Animated.Image
          source={require('./assets/screen.png')}
          style={[styles.fullscreenImage, { transform: [{ scale: scaleAnim }] }]}
        />
      </Animated.View>
    );
  }

  if (firstLaunch === null) {
    return null;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={firstLaunch ? 'Guide' : 'Home'}
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="Guide" component={GuideScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  fullscreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
