import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Platform,
  SafeAreaView,
} from 'react-native';
import { appendActivity, getCSVFileUri, clearAllActivities } from '../utils/activityLogger';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { StackActions } from '@react-navigation/native';

const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  return `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
};

const currentTime = getCurrentTime();

const terminalText = [
  "C:\\welcome\\user",
  `${currentTime}  →  i'm kairos`,
  `${currentTime}  →  the greek god of the opportune moment, time. the keeper of the now.`,
  `${currentTime}  →  i grant you the power to master your time.`,
  `${currentTime}  →  log your activity, seize each moment, and carve your path to success.`,
  `${currentTime}  →  by clicking on add activity.`,
  `${currentTime}  →  type 'kairos.csv' to download all time logs above`,
  `${currentTime}  →  type 'kairos.clear' to erase all time logs above`,
];

const GuideScreen = ({ navigation }) => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (typingIndex < terminalText.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev, terminalText[typingIndex]]);
        setTypingIndex(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      setShowInput(true);
    }
  }, [typingIndex]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const time = getCurrentTime();

    if (trimmed === 'kairos.csv') {
      const uri = getCSVFileUri();
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await Sharing.shareAsync(uri);
      } else {
        alert('No activities logged yet!');
      }
      return;
    }

    if (trimmed === 'kairos.clear') {
      await clearAllActivities();
      alert('All activity logs erased.');
      return;
    }

    await appendActivity(trimmed, time);

    navigation.dispatch(
      StackActions.replace('Home', {
        initialActivity: { text: trimmed, time },
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {displayedLines.map((line, index) => (
            <Text
              key={index.toString()}
              style={[
                styles.line,
                index % 2 === 0 ? styles.green : styles.cyan,
              ]}
            >
              {line}
            </Text>
          ))}
        </ScrollView>

        {showInput && (
          <View style={styles.inputContainer}>
            <Text style={[styles.line, styles.white, { fontFamily: 'Array-Wide' }]}>C:\add\activity&gt; </Text>
            <TextInput
              style={[styles.line, styles.white, styles.inlineInput]}
              value={input}
              onChangeText={setInput}
              placeholder="type activity..."
              placeholderTextColor="#888"
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
              blurOnSubmit={false}
              autoFocus
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  scroll: {
    flex: 1,
  },
  line: {
    fontSize: 18,
    fontFamily: 'Array-Wide',
    marginBottom: 10,
  },
  green: {
    color: '#00FF00',
    textShadowColor: '#0f0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  cyan: {
    color: '#00FFFF',
    textShadowColor: '#0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  white: {
    color: '#fff',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 48 : 10,
    paddingHorizontal: 10,
    backgroundColor: 'black',
  },
  inlineInput: {
    flex: 1,
    fontFamily: 'Array-Wide',
    fontSize: 18,
    paddingVertical: 2,
    color: '#fff',
  },
});

export default GuideScreen;
