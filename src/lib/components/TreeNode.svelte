<script>
  import { selectedImage, imageWidth, reorderImagesInFolder } from '../stores/appStore.js';
  import { insertImage, insertAllImages } from '../utils/wordApi.js';
  import TreeNode from './TreeNode.svelte';

  let { node, depth = 0 } = $props();

  let expanded = $state(false);
  let dragOverIndex = $state(-1);
  let draggingIndex = $state(-1);

  let images = $derived(node.children ? node.children.filter(c => c.type === 'image') : []);
  let folders = $derived(node.children ? node.children.filter(c => c.type === 'folder') : []);

  function toggle() {
    expanded = !expanded;
  }

  function selectImage(imgNode) {
    $selectedImage = imgNode;
  }

  async function handleInsertImage(e, imgNode) {
    e.stopPropagation();
    await insertImage(imgNode, $imageWidth);
  }

  async function handleInsertAll(e) {
    e.stopPropagation();
    await insertAllImages(images, $imageWidth);
  }

  function handleDragStart(e, index) {
    draggingIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.setData('application/x-folder-path', node.path);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex = index;
  }

  function handleDragLeave(e) {
    const related = e.relatedTarget;
    if (related && e.currentTarget.contains(related)) return;
    dragOverIndex = -1;
  }

  function handleDrop(e, toIndex) {
    e.preventDefault();
    e.stopPropagation();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const fromFolder = e.dataTransfer.getData('application/x-folder-path');

    if (fromFolder === node.path && fromIndex !== toIndex) {
      reorderImagesInFolder(node.path, fromIndex, toIndex);
    }

    dragOverIndex = -1;
    draggingIndex = -1;
  }

  function handleDragEnd() {
    dragOverIndex = -1;
    draggingIndex = -1;
  }
</script>

{#if node.type === 'folder'}
  <div class="tree-folder" style="padding-left: {depth * 16}px">
    <div class="folder-row" onclick={toggle} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggle()}>
      <span class="chevron" class:expanded>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M4.5 2L9 6L4.5 10z"/>
        </svg>
      </span>
      <svg class="folder-icon" width="16" height="16" viewBox="0 0 16 16" fill="var(--accent-color, #0078d4)">
        <path d="M1.5 3A1.5 1.5 0 0 1 3 1.5h2.879a1.5 1.5 0 0 1 1.06.44l.622.621a.5.5 0 0 0 .353.147H13A1.5 1.5 0 0 1 14.5 4.208v7.792A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12V3z"/>
      </svg>
      <span class="folder-name">{node.name}</span>
      <button class="action-btn insert-all-btn" onclick={handleInsertAll} title="Insert all images in this folder">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M1 1h5v5H1V1zm7 0h5v5H8V1zM1 8h5v5H1V8zm7 0h5v5H8V8z" opacity="0.7"/>
        </svg>
      </button>
    </div>

    {#if expanded && node.children}
      <div class="folder-children">
        {#each folders as child (child.path)}
          <TreeNode node={child} depth={depth + 1} />
        {/each}
        {#each images as imgNode, i (imgNode.path)}
          <div
            class="tree-image"
            class:selected={$selectedImage?.path === imgNode.path}
            class:drag-over={dragOverIndex === i}
            class:dragging={draggingIndex === i}
            style="padding-left: {(depth + 1) * 16}px"
            onclick={() => selectImage(imgNode)}
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
            <button class="action-btn insert-btn" onclick={(e) => handleInsertImage(e, imgNode)} title="Insert image">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .tree-folder {
    user-select: none;
  }

  .folder-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
  }

  .folder-row:hover {
    background: var(--hover-bg, #e8e8e8);
  }

  .chevron {
    display: flex;
    align-items: center;
    transition: transform 0.15s ease;
  }

  .chevron.expanded {
    transform: rotate(90deg);
  }

  .folder-icon {
    flex-shrink: 0;
  }

  .folder-name {
    flex: 1;
    font-size: 12px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--text-primary, #242424);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-image {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
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

  .folder-row:hover .action-btn,
  .tree-image:hover .action-btn {
    display: flex;
  }
</style>
