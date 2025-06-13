import React, { useEffect, useRef, useState } from 'react';
import * as Font from 'expo-font';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';

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

// Initialize Stack Navigator outside the component to avoid re-initialization
const Stack = createNativeStackNavigator();

//main
export default function App() {

  const fontsLoaded = useCustomFonts(); // 👈 important!
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [firstLaunch, setFirstLaunch] = useState(null);

  useEffect(() => {
    // Perform animation
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

    // Check if app was launched for the first time
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
        // Handle error, e.g., logging or setting a default
        console.error("Failed to read 'alreadyLaunched' from AsyncStorage", e);
        setFirstLaunch(false); // Default to false if error occurs
      }
    };
    checkFirstLaunch();
  }, [fadeAnim, scaleAnim]); // Add fadeAnim and scaleAnim to dependencies

  if (!fontsLoaded) {
    return null; // or show a spinner/text while font loads
  }

  if (isLoading) {
    return (
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <Animated.Image
          // Using a placeholder image since local asset paths are not available here
          source={require('./assets/screen.png')}
          style={[
            styles.fullscreenImage,
            { transform: [{ scale: scaleAnim }] },
          ]}
        />
      </Animated.View>
    );
  }

  // Guiding screen check
  if (firstLaunch === null) {
    return null; // Return null until firstLaunch state is determined
  }

  return (
    // Wrapped in a React Fragment to allow multiple top-level elements
      <NavigationContainer>
      <Stack.Navigator
        initialRouteName={firstLaunch ? 'Guide' : 'Home'}
          screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom', // Smooth fade transition
          }}
      >
      <Stack.Screen name="Guide" component={GuideScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>

    </NavigationContainer>
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

inputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'black',
  paddingHorizontal: 10,
  paddingTop: 10,
},
inlineInput: {
  flex: 1,
  fontSize: 16,
  fontFamily: 'Array-Wide',
  color: '#fff',
},

});