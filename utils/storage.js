// File: utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'KAIROS_LOGS';

export const getLogs = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json != null ? JSON.parse(json) : [];
};

export const saveLog = async (newLog) => {
  const logs = await getLogs();
  logs.push(newLog);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const clearLogs = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};