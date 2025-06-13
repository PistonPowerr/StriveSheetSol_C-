// screens/HomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { appendActivity, getCSVFileUri, clearAllActivities } from '../utils/activityLogger';
import { useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';

const HomeScreen = () => {
  const route = useRoute();
  const initialActivities = route.params?.activities || [];
  const [activities, setActivities] = useState(initialActivities);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [dateTagAdded, setDateTagAdded] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    return `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
  };

  const [time, setTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(getCurrentTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => keyboardDidShow.remove();
  }, []);

  useEffect(() => {
    const activity = route.params?.initialActivity;
    if (activity) {
      const newActivity = {
        ...activity,
        key: Date.now().toString(),
      };
      setActivities(prev => [...prev, newActivity]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [route.params?.initialActivity]);

  // Add date tag once per session
  useEffect(() => {
    if (!dateTagAdded) {
      const today = moment().format('YYYY-MM-DD');
      const displayDate = moment().isSame(new Date(), 'day') ? 'today' : today;

      const dateActivity = {
        text: `C:\\date\\${displayDate}`,
        time: getCurrentTime(),
        key: `date-${Date.now()}`,
      };

      setActivities(prev => [dateActivity, ...prev]);
      setDateTagAdded(true);
    }
  }, [dateTagAdded]);

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const currentTime = getCurrentTime();

    if (trimmed === 'kairos.csv') {
      const fileUri = getCSVFileUri();
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert('No activities logged yet!');
      }
      setInput('');
      return;
    }

    if (trimmed === 'kairos.clear') {
      await clearAllActivities();
      setActivities([]);
      alert('All activity logs erased.');
      setInput('');
      return;
    }

    const newEntry = {
      text: trimmed,
      time: currentTime,
      key: Date.now().toString(),
    };

    setActivities(prev => [...prev, newEntry]);
    await appendActivity(trimmed, currentTime);
    setInput('');
    Keyboard.dismiss();

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item, index }) => {
  const isDateLine = item.text.startsWith('C:\\date\\');
  return (
    <Text style={[
      styles.white,
      index % 2 === 0 ? styles.green : styles.cyan,
      styles.entryText
    ]}>
      {isDateLine ? item.text : `${item.time}  →  ${item.text}`}
    </Text>
  );
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          <FlatList
            ref={flatListRef}
            data={activities}
            renderItem={renderItem}
            keyExtractor={(item, index) => item?.key || index.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />
          <View style={styles.inputRow}>
            <Text style={[styles.line, styles.white]}>C:\add\activity&gt; </Text>
            <TextInput
              style={[styles.line, styles.white, styles.inlineInput]}
              value={input}
              onChangeText={setInput}
              placeholder="type activity..."
              placeholderTextColor="#888"
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              blurOnSubmit={false}
              autoFocus
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 0,
    paddingHorizontal: 15,
  },
  line: {
    fontSize: 18,
    fontFamily: 'Array-Wide',
    marginBottom: 4,
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
  entryText: {
    fontFamily: 'Array-Wide',
    fontSize: 18,
    paddingVertical: 8,
    marginBottom: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 10,
  },
  inlineInput: {
    flex: 1,
    fontFamily: 'Array-Wide',
    fontSize: 18,
    paddingVertical: 2,
    color: '#fff',
  },
});

export default HomeScreen;
