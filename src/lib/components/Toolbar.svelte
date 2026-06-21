<script>
  import { imageWidth, widthOptions, isLoading, dirHandle, tree, errorMessage } from '../stores/appStore.js';
  import {
    supportsFileSystemAccess,
    pickDirectoryNative,
    restoreDirectoryHandle,
    readTree,
    readTreeFromFiles,
  } from '../utils/filesystem.js';

  let fileInput;
  const usesNativeFS = supportsFileSystemAccess();

  async function handlePickFolder() {
    $errorMessage = '';
    $isLoading = true;

    try {
      if (usesNativeFS) {
        const handle = await pickDirectoryNative();
        $dirHandle = handle;
        $tree = await readTree(handle);
      } else {
        fileInput.click();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        $errorMessage = 'Failed to open folder: ' + err.message;
      }
    } finally {
      $isLoading = false;
    }
  }

  async function handleFileInput(e) {
    $isLoading = true;
    try {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        $tree = readTreeFromFiles(files);
      }
    } catch (err) {
      $errorMessage = 'Failed to read folder: ' + err.message;
    } finally {
      $isLoading = false;
    }
  }

  async function tryRestore() {
    if (!usesNativeFS) return;
    try {
      const handle = await restoreDirectoryHandle();
      if (handle) {
        $dirHandle = handle;
        $isLoading = true;
        $tree = await readTree(handle);
        $isLoading = false;
      }
    } catch {
      // no saved handle
    }
  }

  tryRestore();
</script>

<div class="toolbar">
  <button class="btn btn-primary" onclick={handlePickFolder} disabled={$isLoading}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.172a1.5 1.5 0 0 1 1.06.44l.658.658A.5.5 0 0 0 7.744 3.25H13.5A1.5 1.5 0 0 1 15 4.75v7.75A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5V3.5z"/>
    </svg>
    {$isLoading ? 'Loading...' : 'Choose Folder'}
  </button>

  <div class="width-control">
    <label for="width-select">Width:</label>
    <select id="width-select" bind:value={$imageWidth}>
      {#each widthOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  {#if !usesNativeFS}
    <input
      type="file"
      bind:this={fileInput}
      onchange={handleFileInput}
      webkitdirectory
      style="display:none"
    />
  {/if}
</div>

{#if $errorMessage}
  <div class="error-bar">{$errorMessage}</div>
{/if}

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-color, #e1e1e1);
    background: var(--surface-bg, #f3f3f3);
    flex-shrink: 0;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border: 1px solid var(--border-color, #d1d1d1);
    border-radius: 4px;
    background: var(--btn-bg, #ffffff);
    color: var(--text-primary, #242424);
    font-size: 12px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn:hover {
    background: var(--btn-hover-bg, #f5f5f5);
  }

  .btn:active {
    background: var(--btn-active-bg, #e8e8e8);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .btn-primary {
    background: var(--accent-color, #0078d4);
    color: #ffffff;
    border-color: var(--accent-color, #0078d4);
  }

  .btn-primary:hover {
    background: var(--accent-hover, #106ebe);
  }

  .btn-primary:active {
    background: var(--accent-active, #005a9e);
  }

  .width-control {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
  }

  .width-control label {
    font-size: 11px;
    color: var(--text-secondary, #616161);
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .width-control select {
    padding: 3px 6px;
    border: 1px solid var(--border-color, #d1d1d1);
    border-radius: 4px;
    background: var(--btn-bg, #ffffff);
    color: var(--text-primary, #242424);
    font-size: 11px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .error-bar {
    padding: 6px 12px;
    background: #fde7e9;
    color: #a4262c;
    font-size: 12px;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    border-bottom: 1px solid #f1bbbc;
  }
</style>
