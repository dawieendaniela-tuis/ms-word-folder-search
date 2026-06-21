<script>
  import Toolbar from './lib/components/Toolbar.svelte';
  import TreeView from './lib/components/TreeView.svelte';
  import ImagePreview from './lib/components/ImagePreview.svelte';
</script>

<div class="app">
  <Toolbar />
  <TreeView />
  <ImagePreview />
</div>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
    font-size: 13px;
    color: var(--text-primary, #242424);
    background: var(--app-bg, #ffffff);

    --accent-color: #0078d4;
    --accent-hover: #106ebe;
    --accent-active: #005a9e;
    --text-primary: #242424;
    --text-secondary: #616161;
    --border-color: #e1e1e1;
    --surface-bg: #f3f3f3;
    --hover-bg: #e8e8e8;
    --selected-bg: #e0efff;
    --btn-bg: #ffffff;
    --btn-hover-bg: #f5f5f5;
    --btn-active-bg: #e8e8e8;
    --app-bg: #ffffff;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
</style>
