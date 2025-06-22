import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

const DIRECTORY = FileSystem.documentDirectory + 'Kairos/';
const FILE_PATH = DIRECTORY + 'activities.txt';

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DIRECTORY, { intermediates: true });
  }
};

export const appendActivity = async (activity, time) => {
  await ensureDirExists();

  // Read current content
  let existing = '';
  try {
    existing = await FileSystem.readAsStringAsync(FILE_PATH);
  } catch (e) {
    // File might not exist yet — ignore
  }

  const timestamp = new Date().toISOString();
  const line = `${time} => ${activity} [${timestamp}]\n`;
  const updated = existing + line;

  await FileSystem.writeAsStringAsync(FILE_PATH, updated, {
    encoding: FileSystem.EncodingType.UTF8,
  });
};

export const getAllActivities = async () => {
  try {
    const content = await FileSystem.readAsStringAsync(FILE_PATH);
    return content.split('\n').filter(line => line.trim() !== '');
  } catch (e) {
    return [];
  }
};

export const clearAllActivities = async () => {
  try {
    await FileSystem.deleteAsync(FILE_PATH, { idempotent: true });
  } catch (e) {
    console.warn('Nothing to delete:', e.message);
  }
};

export const getCSVFileUri = () => DIRECTORY + 'kairos.csv';

export const exportToCSV = async () => {
  const logs = await getAllActivities();
  if (!logs.length) return;

  const csvContent =
    'Time,Activity,Timestamp\n' +
    logs
      .map(log => {
        const match = log.match(/(.+?) => (.+?) \[(.+?)\]/);
        if (!match) return '';
        const [, time, activity, timestamp] = match;
        return `"${time}","${activity}","${timestamp}"`;
      })
      .join('\n');

  await ensureDirExists();
  const csvPath = getCSVFileUri();
  await FileSystem.writeAsStringAsync(csvPath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(csvPath);
};
