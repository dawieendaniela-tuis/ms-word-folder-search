import { writable } from 'svelte/store';

export const tree = writable([]);
export const selectedImage = writable(null);
export const imageWidth = writable('100%');
export const dirHandle = writable(null);
export const isLoading = writable(false);
export const errorMessage = writable('');

export const widthOptions = [
  { label: '25% page width', value: '25%' },
  { label: '50% page width', value: '50%' },
  { label: '75% page width', value: '75%' },
  { label: 'Full page width', value: '100%' },
  { label: 'Original size', value: 'original' },
];

function rebuildTree(nodes, targetPath, newChildren) {
  return nodes.map(node => {
    if (node.type === 'folder' && node.path === targetPath) {
      return { ...node, children: newChildren };
    }
    if (node.type === 'folder' && node.children) {
      const rebuilt = rebuildTree(node.children, targetPath, newChildren);
      if (rebuilt !== node.children) {
        return { ...node, children: rebuilt };
      }
    }
    return node;
  });
}

function reorderImages(images, fromIndex, toIndex) {
  const result = [...images];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export function reorderImagesInFolder(folderPath, fromIndex, toIndex) {
  if (fromIndex === toIndex) return;

  tree.update(currentTree => {
    if (folderPath === null) {
      const folders = currentTree.filter(c => c.type === 'folder');
      const images = currentTree.filter(c => c.type === 'image');
      return [...folders, ...reorderImages(images, fromIndex, toIndex)];
    }

    const folder = findFolder(currentTree, folderPath);
    if (!folder) return currentTree;

    const folders = folder.children.filter(c => c.type === 'folder');
    const images = folder.children.filter(c => c.type === 'image');
    const newChildren = [...folders, ...reorderImages(images, fromIndex, toIndex)];

    return rebuildTree(currentTree, folderPath, newChildren);
  });
}

function findFolder(nodes, path) {
  for (const node of nodes) {
    if (node.type === 'folder' && node.path === path) return node;
    if (node.type === 'folder' && node.children) {
      const found = findFolder(node.children, path);
      if (found) return found;
    }
  }
  return null;
}
