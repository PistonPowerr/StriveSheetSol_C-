import * as FileSystem from 'expo-file-system';


const fileUri = FileSystem.documentDirectory + 'activities.csv';

export const appendActivity = async (activity, time) => {
  const entry = `${time},${activity}\n`;
  try {
    await FileSystem.writeAsStringAsync(fileUri, entry, { encoding: FileSystem.EncodingType.UTF8, append: true });
  } catch (err) {
    console.error("Error writing activity:", err);
  }
};

export const clearAllActivities = async () => {
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  }
};

export const readActivities = async () => {
  try {
    const fileExists = await FileSystem.getInfoAsync(fileUri);
    if (!fileExists.exists) return '';
    return await FileSystem.readAsStringAsync(fileUri);
  } catch (err) {
    console.error("Error reading activities:", err);
    return '';
  }
};

export const getCSVFileUri = () => fileUri;