# MS Word Image Manager Add-in — Plan

## Overview

A Microsoft Word task pane add-in that lets users browse a local image folder, preview images, reorder them via drag-and-drop, and insert them into the document. Built with Svelte, styled to match MS Word's design language.

## Architecture

### Add-in Type
- Office Web Add-in (task pane)
- No backend server — fully client-side

### Filesystem Access (Hybrid)
- **Windows (Edge WebView2 / Chromium):** File System Access API (`showDirectoryPicker`). Directory handle persisted in IndexedDB so the user only picks the folder once.
- **Mac (WKWebView / Safari):** Fallback to `<input type="file" webkitdirectory>`. User picks the folder each time they open the add-in.
- Runtime detection of API availability to choose the appropriate method.

### Tech Stack
- **Framework:** Svelte (bundled with Vite or Rollup)
- **Office Integration:** Office.js (Word JavaScript API)
- **Styling:** Match MS Word / Fluent UI design language (colors, typography, spacing)
- **Manifest:** Office Add-in XML manifest

## Functional Requirements

### 1. Folder Browser (Tree View)
- Displays contents of the selected IMAGES folder as a tree.
- Supports unlimited nesting depth (folders within folders).
- Folders are expandable/collapsible.
- Image files (PNG, JPG, GIF, BMP) are shown as leaf nodes.
- Each image node shows the filename.

### 2. Image Preview
- Clicking an image in the tree view shows a preview in the task pane.
- Preview displayed below or alongside the tree view.

### 3. Drag-to-Reorder
- Users can drag images within a folder to reorder them.
- Order is frontend-only (stored in memory/state) — no filesystem changes.
- Reordered state persists for the session but does not survive add-in close.

### 4. Insert Single Image
- **Method 1:** Drag an image from the tree view into the Word document.
- **Method 2:** Click an "Insert" button next to the image in the tree view.
- Image is inserted at the current cursor position.
- Width is determined by the width dropdown setting.

### 5. Insert All Images in Folder
- An "Insert All" button next to each folder in the tree view.
- Inserts all images in that folder (not subfolders) at the cursor position.
- One image per line.
- Respects the current drag-reorder order in the tree view.
- Width is determined by the width dropdown setting.

### 6. Width Dropdown
- Persistent dropdown in the task pane (outside the tree view, likely in a toolbar area).
- Options:
  - 25% page width
  - 50% page width
  - 75% page width
  - Full page width
  - Original size

## Supported Image Formats

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)
- BMP (`.bmp`)

## UI Design

- Follow Microsoft Fluent UI design patterns (colors, icons, spacing, typography).
- Task pane width: standard Office task pane (~300-350px).
- Layout (top to bottom):
  1. **Toolbar:** Folder picker button + width dropdown
  2. **Tree view:** Scrollable folder/image tree with action buttons
  3. **Preview pane:** Image preview area (shown when an image is selected)

## Deployment

- Personal use across user's own Windows and Mac machines.
- Sideloaded (not published to the Office Store).
- No server infrastructure required.

## Implementation Phases

### Phase 1: Project Scaffolding
- Initialize Office Add-in project with Svelte.
- Configure Vite/Rollup for bundling.
- Set up the XML manifest for task pane.
- Get a basic "Hello World" add-in loading in Word.

### Phase 2: Filesystem Access
- Implement File System Access API path (Windows).
- Implement `<input webkitdirectory>` fallback (Mac).
- Runtime detection and abstraction layer so the rest of the app doesn't care which method is used.
- Recursive directory reading with file type filtering.
- Persist directory handle in IndexedDB (Windows path).

### Phase 3: Tree View
- Build the recursive tree view component in Svelte.
- Expandable/collapsible folders.
- Image file nodes with filenames.
- Action buttons: "Insert" per image, "Insert All" per folder.

### Phase 4: Image Preview
- Preview pane component.
- Show image on click/selection in tree view.
- Handle loading states and image sizing within the pane.

### Phase 5: Drag-to-Reorder
- Drag-and-drop reordering within a folder's images.
- Frontend-only order state management.
- Visual drag feedback.

### Phase 6: Image Insertion
- Insert single image at cursor via Office.js.
- Insert all images in folder at cursor (one per line, respecting order).
- Width dropdown with page-width-relative sizing.
- Read page width from document to calculate pixel values.

### Phase 7: Polish & Testing
- Fluent UI styling pass.
- Test on Windows (Word desktop).
- Test on Mac (Word desktop).
- Edge cases: empty folders, deeply nested trees, large images, missing folder access.
