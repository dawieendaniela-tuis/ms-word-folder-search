<script>
  import { selectedImage, imageWidth } from '../stores/appStore.js';
  import { getImageDataUrl } from '../utils/filesystem.js';
  import { insertImage } from '../utils/wordApi.js';

  let previewUrl = $state(null);
  let loading = $state(false);
  let currentPath = $state(null);

  $effect(() => {
    const img = $selectedImage;
    if (!img) {
      previewUrl = null;
      currentPath = null;
      return;
    }

    if (img.path === currentPath) return;
    currentPath = img.path;
    loading = true;

    getImageDataUrl(img).then(url => {
      if ($selectedImage?.path === img.path) {
        previewUrl = url;
        loading = false;
      }
    }).catch(() => {
      loading = false;
    });
  });

  async function handleInsert() {
    if ($selectedImage) {
      await insertImage($selectedImage, $imageWidth);
    }
  }
</script>

{#if $selectedImage}
  <div class="preview-pane">
    <div class="preview-header">
      <span class="preview-filename">{$selectedImage.name}</span>
      <button class="preview-insert-btn" onclick={handleInsert}>
        Insert
      </button>
    </div>
    <div class="preview-body">
      {#if loading}
        <div class="preview-loading">Loading...</div>
      {:else if previewUrl}
        <img src={previewUrl} alt={$selectedImage.name} class="preview-image" />
      {/if}
    </div>
  </div>
{/if}

<style>
  .preview-pane {
    border-top: 1px solid var(--border-color, #e1e1e1);
    background: var(--surface-bg, #f9f9f9);
    flex-shrink: 0;
    max-height: 45%;
    display: flex;
    flex-direction: column;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    border-bottom: 1px solid var(--border-color, #e1e1e1);
    background: var(--surface-bg, #f3f3f3);
  }

  .preview-filename {
    font-size: 11px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--text-primary, #242424);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    margin-right: 8px;
  }

  .preview-insert-btn {
    padding: 3px 12px;
    border: 1px solid var(--accent-color, #0078d4);
    border-radius: 4px;
    background: var(--accent-color, #0078d4);
    color: #ffffff;
    font-size: 11px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    cursor: pointer;
    white-space: nowrap;
  }

  .preview-insert-btn:hover {
    background: var(--accent-hover, #106ebe);
  }

  .preview-body {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    min-height: 100px;
  }

  .preview-image {
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
    border-radius: 2px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  }

  .preview-loading {
    font-size: 12px;
    color: var(--text-secondary, #616161);
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  }
</style>
