import { insertImage, insertAllImages } from './wordApi.js';
import { insertProgress, errorMessage } from '../stores/appStore.js';

function logError(context, err) {
  console.error(`[insert] ${context} failed:`, err);
  if (err && err.code) console.error('[insert] code:', err.code);
  if (err && err.debugInfo) console.error('[insert] debugInfo:', JSON.stringify(err.debugInfo, null, 2));
}

export async function insertSingle(entry, widthSetting) {
  console.log('[insert] insertSingle:', entry.name);
  insertProgress.set({ current: 0, total: 1, label: entry.name });
  try {
    await insertImage(entry, widthSetting);
    insertProgress.set({ current: 1, total: 1, label: entry.name });
  } catch (err) {
    logError('insertSingle', err);
    errorMessage.set('Failed to insert image: ' + (err.code || err.message));
  } finally {
    setTimeout(() => insertProgress.set(null), 350);
  }
}

export async function insertFolder(entries, widthSetting) {
  const total = entries.length;
  console.log('[insert] insertFolder: count =', total);
  if (total === 0) return;

  insertProgress.set({ current: 0, total });
  try {
    await insertAllImages(entries, widthSetting, (current) => {
      insertProgress.set({ current, total });
    });
  } catch (err) {
    logError('insertFolder', err);
    errorMessage.set('Failed to insert images: ' + (err.code || err.message));
  } finally {
    setTimeout(() => insertProgress.set(null), 350);
  }
}
