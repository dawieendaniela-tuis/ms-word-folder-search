<script>
  import TreeNode from './TreeNode.svelte';
  import { tree, selectedImage, imageWidth, reorderImagesInFolder } from '../stores/appStore.js';
  import { insertSingle } from '../utils/insert.js';

  let dragOverIndex = $state(-1);
  let draggingIndex = $state(-1);

  let rootFolders = $derived($tree.filter(n => n.type === 'folder'));
  let rootImages = $derived($tree.filter(n => n.type === 'image'));

  function selectImage(imgNode) {
    $selectedImage = imgNode;
  }

  async function handleInsertImage(e, imgNode) {
    e.stopPropagation();
    await insertSingle(imgNode, $imageWidth);
  }

  function handleDragStart(e, index) {
    draggingIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.setData('application/x-folder-path', '__root__');
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex = index;
  }

  function handleDragLeave() {
    dragOverIndex = -1;
  }

  function handleDrop(e, toIndex) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const fromFolder = e.dataTransfer.getData('application/x-folder-path');

    if (fromFolder === '__root__' && fromIndex !== toIndex) {
      reorderImagesInFolder(null, fromIndex, toIndex);
    }

    dragOverIndex = -1;
    draggingIndex = -1;
  }

  function handleDragEnd() {
    dragOverIndex = -1;
    draggingIndex = -1;
  }
</script>

<div class="tree-view">
  {#if $tree.length === 0}
    <div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="var(--text-secondary, #999)">
        <path d="M5 8A3 3 0 0 1 8 5h8.586a3 3 0 0 1 2.122.879l1.414 1.414A1 1 0 0 0 20.828 7.5H32A3 3 0 0 1 35 10.5v19A3 3 0 0 1 32 32.5H8A3 3 0 0 1 5 29.5V8z" opacity="0.3"/>
      </svg>
      <p>Choose a folder to browse images</p>
    </div>
  {:else}
    {#each rootFolders as node (node.path)}
      <TreeNode {node} depth={0} />
    {/each}
    {#each rootImages as imgNode, i (imgNode.path)}
      <div
        class="tree-image root-image"
        class:selected={$selectedImage?.path === imgNode.path}
        class:drag-over={dragOverIndex === i}
        class:dragging={draggingIndex === i}
        onclick={() => selectImage(imgNode)}
        ondblclick={() => insertSingle(imgNode, $imageWidth)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && selectImage(imgNode)}
        draggable="true"
        ondragstart={(e) => handleDragStart(e, i)}
        ondragover={(e) => handleDragOver(e, i)}
        ondragleave={handleDragLeave}
        ondrop={(e) => handleDrop(e, i)}
        ondragend={handleDragEnd}
      >
        <svg class="image-icon" width="14" height="14" viewBox="0 0 14 14" fill="var(--text-secondary, #616161)">
          <path d="M2 2.5A1.5 1.5 0 0 1 3.5 1h7A1.5 1.5 0 0 1 12 2.5v9A1.5 1.5 0 0 1 10.5 13h-7A1.5 1.5 0 0 1 2 11.5v-9zM4.5 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 4.5l-2-2L4 11h6.5a.5.5 0 0 0 .5-.5v-2z"/>
        </svg>
        <span class="image-name">{imgNode.name}</span>
        <button class="action-btn" onclick={(e) => handleInsertImage(e, imgNode)} title="Insert image">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    {/each}
  {/if}
</div>

<style>
  .tree-view {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
  }

  .empty-state p {
    font-size: 12px;
    color: var(--text-secondary, #616161);
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    text-align: center;
  }

  .tree-image {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    padding-left: 16px;
    cursor: pointer;
    border-radius: 4px;
    border: 2px solid transparent;
    transition: background 0.1s;
  }

  .tree-image:hover {
    background: var(--hover-bg, #e8e8e8);
  }

  .tree-image.selected {
    background: var(--selected-bg, #e0efff);
  }

  .tree-image.drag-over {
    border-top: 2px solid var(--accent-color, #0078d4);
  }

  .tree-image.dragging {
    opacity: 0.4;
  }

  .image-icon {
    flex-shrink: 0;
  }

  .image-name {
    flex: 1;
    font-size: 12px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--text-primary, #242424);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text-secondary, #616161);
    cursor: pointer;
    flex-shrink: 0;
  }

  .action-btn:hover {
    background: var(--btn-hover-bg, #d1d1d1);
    color: var(--text-primary, #242424);
  }

  .tree-image:hover .action-btn {
    display: flex;
  }
</style>
