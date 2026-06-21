const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];

function isImageFile(name) {
  const lower = name.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext));
}

async function readDirectoryRecursive(dirHandle, path = '') {
  const entries = [];

  for await (const [name, handle] of dirHandle) {
    const entryPath = path ? `${path}/${name}` : name;

    if (handle.kind === 'directory') {
      const children = await readDirectoryRecursive(handle, entryPath);
      entries.push({
        name,
        path: entryPath,
        type: 'folder',
        handle,
        children,
      });
    } else if (handle.kind === 'file' && isImageFile(name)) {
      entries.push({
        name,
        path: entryPath,
        type: 'image',
        handle,
      });
    }
  }

  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return entries;
}

function buildTreeFromFileList(files) {
  const root = [];
  const folderMap = new Map();

  const sortedFiles = [...files].sort((a, b) =>
    a.webkitRelativePath.localeCompare(b.webkitRelativePath)
  );

  for (const file of sortedFiles) {
    if (!isImageFile(file.name)) continue;

    const parts = file.webkitRelativePath.split('/');
    // parts[0] is the root folder name chosen by the user
    const pathParts = parts.slice(1);

    let currentLevel = root;
    let currentPath = '';

    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];

      if (!folderMap.has(currentPath)) {
        const folder = {
          name: pathParts[i],
          path: currentPath,
          type: 'folder',
          children: [],
        };
        currentLevel.push(folder);
        folderMap.set(currentPath, folder);
      }

      currentLevel = folderMap.get(currentPath).children;
    }

    currentLevel.push({
      name: file.name,
      path: file.webkitRelativePath,
      type: 'image',
      file,
    });
  }

  return root;
}

const DB_NAME = 'ImageManagerDB';
const STORE_NAME = 'dirHandles';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDirectoryHandle(handle) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(handle, 'rootDir');
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDirectoryHandle() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get('rootDir');
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export function supportsFileSystemAccess() {
  return typeof window.showDirectoryPicker === 'function';
}

export async function pickDirectoryNative() {
  const handle = await window.showDirectoryPicker({ mode: 'read' });
  await saveDirectoryHandle(handle);
  return handle;
}

export async function restoreDirectoryHandle() {
  const handle = await loadDirectoryHandle();
  if (!handle) return null;

  const permission = await handle.queryPermission({ mode: 'read' });
  if (permission === 'granted') return handle;

  const requested = await handle.requestPermission({ mode: 'read' });
  if (requested === 'granted') return handle;

  return null;
}

export async function readTree(dirHandle) {
  return readDirectoryRecursive(dirHandle);
}

export function readTreeFromFiles(files) {
  return buildTreeFromFileList(files);
}

export async function getImageDataUrl(entry) {
  let file;
  if (entry.file) {
    file = entry.file;
  } else if (entry.handle) {
    file = await entry.handle.getFile();
  } else {
    return null;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function getImageBase64(entry) {
  const dataUrl = await getImageDataUrl(entry);
  if (!dataUrl) return null;
  return dataUrl.split(',')[1];
}
