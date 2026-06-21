import { insertImage, insertAllImages } from './wordApi.js';
import { insertProgress, errorMessage } from '../stores/appStore.js';

export async function insertSingle(entry, widthSetting) {
  insertProgress.set({ current: 0, total: 1, label: entry.name });
  try {
    await insertImage(entry, widthSetting);
    insertProgress.set({ current: 1, total: 1, label: entry.name });
  } catch (err) {
    errorMessage.set('Failed to insert image: ' + err.message);
  } finally {
    setTimeout(() => insertProgress.set(null), 350);
  }
}

export async function insertFolder(entries, widthSetting) {
  const total = entries.length;
  if (total === 0) return;

  insertProgress.set({ current: 0, total });
  try {
    await insertAllImages(entries, widthSetting, (current) => {
      insertProgress.set({ current, total });
    });
  } catch (err) {
    errorMessage.set('Failed to insert images: ' + err.message);
  } finally {
    setTimeout(() => insertProgress.set(null), 350);
  }
}
