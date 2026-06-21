# Development Guide

How to run, test, and debug the Image Manager add-in during development.

---

## Quick Start

```powershell
npm install           # Install dependencies (first time)
npm run certs         # Generate HTTPS certificates (first time, needed for Word sideloading)
npm run dev           # Start HTTP dev server (browser testing)
npm run dev:https     # Start HTTPS dev server (Word sideloading)
```

Two dev modes:
- **`npm run dev`** — HTTP on `http://localhost:3000`. Use for browser testing (no cert issues).
- **`npm run dev:https`** — HTTPS on `https://localhost:3000`. Required when sideloading into Word.

---

## Testing in Word (Desktop)

### Step 1: Start the HTTPS dev server

```powershell
npm run dev:https
```

Word requires HTTPS for add-in sideloading. Leave this running in a terminal. Vite will hot-reload your changes.

### Step 2: Sideload the manifest into Word

**Quickest method (Windows, Microsoft 365):**

1. Open Word.
2. Go to **Home → Add-ins → More Add-ins**.
3. Click **Upload My Add-in** at the bottom.
4. Browse to `manifest.xml` in this project folder and upload.
5. The Image Manager task pane opens immediately.

**Persistent method (survives Word restarts):**

1. Create a folder for manifests:
   ```powershell
   mkdir "$env:USERPROFILE\Documents\OfficeAddins"
   copy manifest.xml "$env:USERPROFILE\Documents\OfficeAddins\"
   ```

2. In Word: **File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs**.

3. Add the folder path as a catalog URL. Check **Show in Menu**. Click OK.

4. Restart Word. Go to **Home → Add-ins → Shared Folder** and add Image Manager.

**Mac:**

```bash
mkdir -p ~/Library/Containers/com.microsoft.Word/Data/Documents/wef
cp manifest.xml ~/Library/Containers/com.microsoft.Word/Data/Documents/wef/
```

Restart Word, then go to **Insert → Add-ins → My Add-ins**.

### Step 3: Test

1. Click **Choose Folder** in the task pane.
2. Navigate to a folder with images (e.g., `Desktop/IMAGES`).
3. Test each feature:
   - **Tree view**: Expand folders, verify nested folders render.
   - **Preview**: Click an image — it should appear in the preview pane.
   - **Reorder**: Drag an image up or down within a folder.
   - **Insert single**: Place your cursor in the document, click the **+** button next to an image.
   - **Insert all**: Click the grid icon next to a folder — all images should insert one per line.
   - **Width**: Change the width dropdown and insert again — verify the image size changes.

---

## Testing in the Browser (without Word)

You can test the UI (tree view, preview, folder picker) without Word:

1. Run `npm run dev` (HTTP mode — avoids HTTPS certificate issues in the browser).
2. Open **http://localhost:3000/taskpane.html** in Chrome or Edge.
3. The app will load. `Office.onReady()` will fire but `Word.run()` calls will fail since there's no Word context.
4. You can still test:
   - Folder picking and tree rendering
   - Image preview
   - Drag-to-reorder
   - UI layout and styling

The insert buttons will throw errors in the console, which is expected.

---

## Hot Reload

Vite's dev server supports hot module replacement (HMR). When you edit a `.svelte` file:

- The change is pushed to the browser automatically.
- The task pane in Word refreshes (if using the dev server URL).
- Store state is lost on refresh — you'll need to re-pick the folder.

If HMR doesn't work in Word's WebView2, **close and reopen the task pane** or press **F5** inside the task pane.

---

## Debugging

### Browser DevTools (in Word)

**Windows:** Right-click inside the task pane → **Inspect** (if available). Or use:

```powershell
# Attach Edge DevTools to the Word WebView2 process
# Open edge://inspect in Edge browser, the WebView2 instance should appear
```

You can also enable DevTools by setting this registry key:
```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Office\16.0\Wef\Developer
[DWORD] UseDirectDebugger = 1
```

Then restart Word and the add-in. DevTools will auto-open with the task pane.

**Mac:** Debug via Safari:
1. Enable Safari → Develop menu (Preferences → Advanced → Show Develop menu).
2. Open Word and load the add-in.
3. In Safari: **Develop → [Your Mac Name] → [localhost page]**.

### Console logging

Add `console.log()` statements — they'll appear in the attached DevTools. The Office.js API errors also log to the console.

### Common issues during development

| Problem | Cause | Fix |
|---------|-------|-----|
| Blank task pane | JS error on load | Check browser DevTools console |
| "Office is not defined" | Loaded outside Word without Office.js | Expected in standalone browser testing — Office.js is only available inside Word |
| Folder picker doesn't open | Permissions or API not available | Check if `showDirectoryPicker` exists; on Mac, the file input should appear instead |
| Images don't insert | Office.js API error | Check console for error details; ensure cursor is in the document body |
| Styles look wrong | CSS variable not applied | Check `App.svelte` `:global(body)` — all variables are defined there |

---

## Project Structure for Developers

```
src/
├── main.js                          # Entry point: Office.onReady → mount Svelte
├── App.svelte                       # Root component, global styles, layout
└── lib/
    ├── components/
    │   ├── Toolbar.svelte           # Top bar: folder picker + width dropdown
    │   ├── TreeView.svelte          # Renders root-level tree entries
    │   ├── TreeNode.svelte          # Recursive component for folders
    │   └── ImagePreview.svelte      # Bottom pane: image preview + insert
    ├── stores/
    │   └── appStore.js              # Svelte writable stores for shared state
    └── utils/
        ├── filesystem.js            # All filesystem access logic
        └── wordApi.js               # All Word document insertion logic
```

### Key modification points

- **Add a new image format**: Edit `IMAGE_EXTENSIONS` array in `filesystem.js`.
- **Change default width**: Edit the `imageWidth` store default in `appStore.js`.
- **Change styling**: Edit CSS variables in `App.svelte` `:global(body)`.
- **Change page width assumption**: Edit the `468` constant in `wordApi.js` (points = inches × 72; 468 = 6.5" printable width on US Letter).

---

## Building for Production

```powershell
npm run build
```

Output goes to `dist/`. To test the production build locally:

```powershell
npm run preview
```

This serves `dist/` at `https://localhost:4173` (or similar). Update the manifest URLs if testing against the preview server.
