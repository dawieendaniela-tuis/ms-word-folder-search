# Installation Guide

Install the Image Manager add-in on Windows and/or Mac. After the one-time setup, you just open Word and click the button — no terminal, no server.

---

## How it works

Office add-ins are web pages loaded by Word from a URL. We build the add-in into static files, host them for free on GitHub Pages, and point Word at that URL via a manifest file. Once set up, it's fully automatic.

---

## 1. One-time setup: Build and deploy

### Prerequisites

- **Node.js** 18+ (https://nodejs.org) — only needed on the machine where you build
- A **GitHub** account

### Build

```powershell
npm install
npm run build
```

This produces a `docs/` folder with the static files.

### Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `image-manager-addin`).

2. Push the project (including `docs/`) to GitHub:

   ```powershell
   git init
   git add -A
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/image-manager-addin.git
   git push -u origin master
   ```

3. In your GitHub repo, go to **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **master** / **docs**
   - Click **Save**

4. Wait 1–2 minutes. Your add-in is now live at:
   ```
   https://YOUR_USERNAME.github.io/image-manager-addin/
   ```

### Update the manifest

Open `manifest.xml` and replace **every** occurrence of `https://localhost:3000` with your GitHub Pages URL:

```
https://YOUR_USERNAME.github.io/image-manager-addin
```

There are about 6 occurrences to replace (search and replace works well).

---

## 2. Install in Word

### Windows — Word for Microsoft 365 / Office 2021 / 2019 / 2016

1. In Word, go to **Home → Add-ins → More Add-ins** (or **Insert → Add-ins → My Add-ins**).

2. Click **Upload My Add-in** (at the bottom of the dialog).

3. Browse to your updated `manifest.xml` and click **Upload**.

4. The Image Manager task pane opens. Done.

> **Tip:** On some Word versions this is session-only. For a permanent install, see [Persistent install (Windows)](#persistent-install-windows) below.

### Mac — Word for Microsoft 365

1. Copy the updated `manifest.xml` to Word's sideload folder:

   ```bash
   mkdir -p ~/Library/Containers/com.microsoft.Word/Data/Documents/wef
   cp manifest.xml ~/Library/Containers/com.microsoft.Word/Data/Documents/wef/
   ```

2. Quit and reopen Word.

3. Go to **Insert → Add-ins → My Add-ins**.

4. Select **Image Manager** under **Developer Add-ins**. Done.

---

## 3. Using the add-in

1. Click the **Image Manager** button on the Home ribbon tab.
2. Click **Choose Folder** and select a folder containing images.
   - **Windows**: you pick once and it remembers.
   - **Mac**: you pick each time you open the add-in.
3. Browse the tree, click images to preview.
4. Set the **width** using the dropdown.
5. Insert images:
   - **+** button next to an image → inserts at cursor.
   - **Grid** button next to a folder → inserts all images in that folder.
   - **Insert** button in the preview pane.
6. Drag images within a folder to reorder. Bulk insert respects your order.

---

## 4. Updating the add-in

After code changes, rebuild and redeploy:

```powershell
npm run build
git add docs
git commit -m "Update add-in"
git push
```

GitHub Pages updates in 1–2 minutes. In Word, close and reopen the task pane to pick up changes. No need to re-upload the manifest.

---

## Persistent install (Windows)

If the "Upload My Add-in" method doesn't survive restarts on your Word version:

1. Create a folder for manifests:
   ```powershell
   mkdir "$env:USERPROFILE\Documents\OfficeAddins"
   copy manifest.xml "$env:USERPROFILE\Documents\OfficeAddins\"
   ```

2. In Word: **File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs**.

3. In **Catalog URL**, enter:
   ```
   \\localhost\Users\YOUR_USERNAME\Documents\OfficeAddins
   ```

4. Check **Show in Menu**, click **OK** twice.

5. Restart Word. Go to **Home → Add-ins → Shared Folder** → add **Image Manager**.

This is a one-time setup. The add-in will be available every time you open Word.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Add-in doesn't load | Check that your GitHub Pages URL loads in a browser: `https://YOUR_USERNAME.github.io/image-manager-addin/taskpane.html` |
| Add-in not in ribbon | Restart Word. For persistent install, verify the trusted catalog is configured. |
| Folder picker doesn't work | On Windows, ensure Edge is up to date (the add-in uses Edge WebView2). On Mac, the file picker appears instead — select the folder each session. |
| "Permission denied" on reopen | Click **Allow** when the browser prompts for folder access. |
| Manifest upload fails | Open `manifest.xml` in a browser to check for XML syntax errors. Ensure all URLs are updated to your GitHub Pages URL. |
