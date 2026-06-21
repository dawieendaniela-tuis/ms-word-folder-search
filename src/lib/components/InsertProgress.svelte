<script>
  import { insertProgress } from '../stores/appStore.js';

  let percent = $derived(
    $insertProgress && $insertProgress.total
      ? Math.round(($insertProgress.current / $insertProgress.total) * 100)
      : 0
  );
</script>

{#if $insertProgress}
  <div class="insert-progress">
    <div class="spinner"></div>
    <div class="progress-info">
      <span class="progress-label">
        {#if $insertProgress.total > 1}
          Inserting {$insertProgress.current} of {$insertProgress.total}…
        {:else}
          Inserting image…
        {/if}
      </span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {percent}%"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .insert-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--surface-bg, #f3f3f3);
    border-bottom: 1px solid var(--border-color, #e1e1e1);
    flex-shrink: 0;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color, #d1d1d1);
    border-top-color: var(--accent-color, #0078d4);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .progress-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .progress-label {
    font-size: 11px;
    color: var(--text-secondary, #616161);
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .progress-bar {
    height: 4px;
    background: var(--border-color, #e1e1e1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent-color, #0078d4);
    border-radius: 2px;
    transition: width 0.2s ease;
  }
</style>
