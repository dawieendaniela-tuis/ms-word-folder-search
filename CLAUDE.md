# Image Manager — Word Add-in

## Project Overview

A Microsoft Word task pane add-in that lets users browse a local image folder, preview images, reorder them via drag-and-drop, and insert them into the active document. Built with Svelte 5 and styled to match Microsoft's Fluent UI design language.

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Svelte | 5.x (runes mode) | UI components with `$props()`, `$state()`, `$effect()` |
| Bundler | Vite | 8.x | Dev server (HTTPS) and production build |
| Svelte plugin | @sveltejs/vite-plugin-svelte | 7.x | Svelte compilation inside Vite |
| Office API | Office.js | 1.1 (CDN) | Word document manipulation (loaded from `appsforoffice.microsoft.com`) |
| Dev certs | office-addin-dev-certs | 2.x | Generates trusted localhost HTTPS certificates |
| Styling | Custom CSS | — | CSS custom properties matching Fluent UI / MS Word palette |

### Why these choices

- **Svelte 5 runes** over Svelte 4: the project uses `$props()`, `$state()`, `$effect()` — not `export let` or `$:`. All components are runes-mode.
- **No UI library**: Fluent UI React exists but adds weight. The task pane is narrow (~300px) with few controls, so hand-written CSS with Fluent-matching variables is lighter and sufficient.
- **No backend server**: filesystem access is handled entirely client-side via the File System Access API (Chromium) or `<input webkitdirectory>` fallback (Safari/WKWebView).

## Architecture

```
taskpane.html          ← Entry point loaded by Word (includes Office.js CDN script)
  └─ src/main.js       ← Waits for Office.onReady(), then mounts Svelte app
      └─ App.svelte    ← Root layout: Toolbar | TreeView | ImagePreview
```

### Component hierarchy

```
App.svelte
├── Toolbar.svelte           — Folder picker button + width dropdown
├── TreeView.svelte          — Root-level tree, renders folders and root images
│   └── TreeNode.svelte      — Recursive: one per folder, renders children
└── ImagePreview.svelte      — Shows selected image preview + insert button
```

### State management

All shared state lives in `src/lib/stores/appStore.js` using Svelte writable stores:

| Store | Type | Purpose |
|-------|------|---------|
| `tree` | `Array<TreeEntry>` | The full folder/image tree |
| `selectedImage` | `TreeEntry \| null` | Currently previewed image |
| `imageWidth` | `string` | Width setting from dropdown (`'25%'`, `'50%'`, `'75%'`, `'100%'`, `'original'`) |
| `dirHandle` | `FileSystemDirectoryHandle \| null` | Native FS handle (Windows only) |
| `isLoading` | `boolean` | Loading spinner state |
| `errorMessage` | `string` | Error banner text |

### TreeEntry shape

```js
// Folder
{ name: string, path: string, type: 'folder', handle?: FileSystemDirectoryHandle, children: TreeEntry[] }

// Image (native FS)
{ name: string, path: string, type: 'image', handle: FileSystemFileHandle }

// Image (webkitdirectory fallback)
{ name: string, path: string, type: 'image', file: File }
```

## Filesystem Access — Hybrid Strategy

The add-in detects at runtime which API is available:

### Windows (Edge WebView2 — Chromium)
- Uses `window.showDirectoryPicker()` (File System Access API)
- Directory handle is persisted in **IndexedDB** (`ImageManagerDB` → `dirHandles` store, key `'rootDir'`)
- On next open, the handle is restored and permission is re-requested if needed
- User only picks the folder once (until they clear browser data)

### Mac (WKWebView — Safari)
- Falls back to `<input type="file" webkitdirectory>`
- User must re-pick the folder each time the add-in opens
- Files are read from the `File` objects returned by the input

### Detection
```js
supportsFileSystemAccess()  // returns true if showDirectoryPicker exists
```

The abstraction layer in `src/lib/utils/filesystem.js` exposes the same interface regardless of method:
- `readTree(dirHandle)` — native FS path
- `readTreeFromFiles(fileList)` — fallback path
- `getImageDataUrl(entry)` — works with either entry type
- `getImageBase64(entry)` — returns base64 string for Office.js insertion

## Image Insertion (Office.js)

Located in `src/lib/utils/wordApi.js`.

### Single image
- Reads image as base64 via `FileReader`
- Calls `range.insertInlinePictureFromBase64()` at the current selection
- If width is not `'original'`, calculates target width as percentage of page width (hardcoded 468pt — US Letter minus default margins) and scales proportionally

### Bulk insert (all images in folder)
- Iterates images in **tree-view order** (respects drag-reorder)
- Inserts each image followed by a line break (`Word.BreakType.line`)
- Same width logic as single insert

### Width options
| Label | Value | Behavior |
|-------|-------|----------|
| 25% page width | `'25%'` | 117pt wide |
| 50% page width | `'50%'` | 234pt wide |
| 75% page width | `'75%'` | 351pt wide |
| Full page width | `'100%'` | 468pt wide |
| Original size | `'original'` | No resizing |

## Drag-to-Reorder

- Frontend-only — does not modify the filesystem
- Images within a folder can be reordered by dragging
- Uses HTML5 drag-and-drop (`draggable`, `ondragstart`, `ondrop`)
- Reorder state is stored in the `tree` store and persists for the session
- Bulk insert respects the current visual order
- Folder-scoped: you can only reorder images within the same folder

## Deployment

The add-in is deployed as static files on **GitHub Pages**. No server to run.

```powershell
npm run build     # Production build to dist/
```

Then push `dist/` to the `gh-pages` branch of a GitHub repo. Update `manifest.xml` URLs to point to `https://YOUR_USERNAME.github.io/REPO_NAME`. Sideload the manifest into Word once. See `INSTALLATION.md` for full steps.

## Development

```powershell
npm run dev       # HTTP dev server on http://localhost:3000 (browser testing)
npm run dev:https # HTTPS dev server on https://localhost:3000 (testing inside Word)
npm run certs     # (Re)install dev HTTPS certificates
```

- `npm run dev` — test UI in a browser. Insert buttons will error without Word context.
- `npm run dev:https` — test inside Word via sideloading. Requires dev certificates (`npm run certs`).
- For development workflow details, see `DEV_HOW_TO.md`.

## Office Manifest

`manifest.xml` — standard Office Add-in XML manifest (not the newer JSON manifest).

- **Add-in ID**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Type**: TaskPaneApp
- **Host**: Document (Word)
- **Permission**: ReadWriteDocument
- **Source**: `https://localhost:3000/taskpane.html`
- **Ribbon**: Button on Home tab → opens task pane

For deployment, update the `DefaultValue` URLs in the manifest to point to the GitHub Pages URL.

## Supported Image Formats

PNG (`.png`), JPEG (`.jpg`, `.jpeg`), GIF (`.gif`), BMP (`.bmp`)

Filtering is done by file extension in `filesystem.js` → `isImageFile()`.

## File Index

| File | Purpose |
|------|---------|
| `manifest.xml` | Office Add-in manifest (sideloaded into Word) |
| `taskpane.html` | HTML entry point (loads Office.js + Vite app) |
| `vite.config.js` | Vite config: Svelte plugin, HTTPS certs, base path |
| `svelte.config.js` | Svelte preprocessor config |
| `src/main.js` | Entry: `Office.onReady()` → mount Svelte |
| `src/App.svelte` | Root component, CSS variables, layout |
| `src/lib/components/Toolbar.svelte` | Folder picker + width dropdown |
| `src/lib/components/TreeView.svelte` | Top-level tree rendering |
| `src/lib/components/TreeNode.svelte` | Recursive folder/image node |
| `src/lib/components/ImagePreview.svelte` | Image preview + insert button |
| `src/lib/stores/appStore.js` | Svelte stores + reorder logic |
| `src/lib/utils/filesystem.js` | Hybrid FS access, IndexedDB, image reading |
| `src/lib/utils/wordApi.js` | Office.js image insertion |
| `public/assets/icon-*.png` | Placeholder ribbon icons |

## Known Limitations

- True drag-from-taskpane-into-document is not supported by Office.js; both insertion methods use click-to-insert at cursor position.
- Page width for image scaling is hardcoded at 468pt (US Letter with default 1-inch margins). Custom page sizes or margins are not dynamically detected.
- The `<input webkitdirectory>` fallback (Mac) requires the user to re-pick the folder each session.
- Placeholder icons are 16x16 transparent PNGs — replace with real icons for a polished look.

## Conventions

- All components use Svelte 5 runes (`$props`, `$state`, `$effect`) — do not use legacy `export let` or `$:`.
- CSS uses custom properties defined in `App.svelte` `<style>` block on `:global(body)`.
- Event handlers on elements use Svelte 5 syntax: `onclick={handler}` (not `on:click`).
- No TypeScript — plain JavaScript throughout.
- No comments in code unless explaining a non-obvious constraint.
