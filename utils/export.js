import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getLogs } from './storage';

export const exportToCSV = async () => {
  const logs = await getLogs();
  const csv = 'Activity,Timestamp\n' + logs.map(log => `${log.activity},${log.timestamp}`).join('\n');
  const fileUri = FileSystem.documentDirectory + 'kairos.csv';
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(fileUri);
};