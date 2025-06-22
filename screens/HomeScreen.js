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
import { appendActivity, getCSVFileUri, clearAllActivities, exportToCSV, getAllActivities } from '../utils/activityLogger';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import { Snackbar } from 'react-native-paper';

const HomeScreen = () => {
  const route = useRoute();
  const [activities, setActivities] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    return `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
  };

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
    const loadPreviousLogs = async () => {
      const storedLogs = await getAllActivities();
      const groupedLogs = [];
      let lastDate = '';

      storedLogs.forEach((line, i) => {
        const match = line.match(/\[(.+?)\]$/);
        const date = match ? moment(match[1]).format('YYYY-MM-DD') : null;
        const today = moment().format('YYYY-MM-DD');

        if (date && date !== lastDate) {
          groupedLogs.push({
            text: `C:\\date\\${date === today ? 'today' : date}`,
            key: `date-${i}`,
          });
          lastDate = date;
        }

        groupedLogs.push({
          text: line.replace(/ \[.+\]$/, ''),
          key: `${i}-${line.slice(0, 10)}`,
        });
      });

      setActivities(groupedLogs);
    };

    loadPreviousLogs();
  }, []);

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const currentTime = getCurrentTime();

    if (trimmed === 'kairos.csv') {
      await exportToCSV();
      showSnackbar('CSV file exported');
      setInput('');
      return;
    }

    if (trimmed === 'kairos.clear') {
      await clearAllActivities();
      setActivities([]);
      showSnackbar('Logs cleared');
      setInput('');
      return;
    }

    const logLine = `${currentTime} → ${trimmed} [${new Date().toISOString()}]`;
    const todayDate = moment().format('YYYY-MM-DD');
    const newLogs = [...activities];

    const lastDateEntry = newLogs.findLast(log => log.text.startsWith('C:\\date\\'));
    const lastDateTag = lastDateEntry?.text.split('C:\\date\\')[1];

    if (lastDateTag !== 'today') {
      newLogs.push({
        text: 'C:\\date\\today',
        key: `date-${Date.now()}`,
      });
    }

    const newEntry = {
      text: `${currentTime} → ${trimmed}`,
      key: Date.now().toString(),
    };

    newLogs.push(newEntry);
    setActivities(newLogs);
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
        isDateLine ? styles.white : index % 2 === 0 ? styles.green : styles.cyan,
        styles.entryText,
      ]}>
        {item.text}
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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ backgroundColor: '#333' }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 15,
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
