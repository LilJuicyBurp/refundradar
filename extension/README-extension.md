# RefundRadar Chrome Extension

The RefundRadar browser extension lets you:
- Detect product prices on any shopping page automatically
- Compare current prices against your past purchases
- Log purchases manually without leaving the store
- Receive browser notifications for urgent return windows

---

## Files

```
extension/
├── manifest.json       — Chrome Manifest V3 config
├── popup.html          — Extension popup UI
├── popup.js            — Popup interaction logic
├── content.js          — Page-level product detection
├── background.js       — Service worker: alarms, notifications, badge
├── icons/              — PNG icons (16, 32, 48, 128px) — add before packaging
└── README-extension.md — This file
```

---

## Setup for Development

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `/extension` folder from this repo
5. The RefundRadar icon will appear in your Chrome toolbar

---

## Connecting to the App

The extension communicates with the RefundRadar backend. Update `API_BASE` in both `popup.js` and `background.js`:

```js
// Development
const API_BASE = "http://localhost:5000";

// Production
const API_BASE = "https://app.refundradar.com";
```

---

## Icons

You need PNG icons in `extension/icons/` before the extension will load properly:

| File         | Size    |
|--------------|---------|
| icon16.png   | 16×16   |
| icon32.png   | 32×32   |
| icon48.png   | 48×48   |
| icon128.png  | 128×128 |

Generate them from the SVG logo in `client/src/components/logo.tsx`, or use a tool like [svg2png](https://www.npmjs.com/package/svg2png).

**Quick generate with ImageMagick** (if installed):
```bash
# Requires: brew install imagemagick (macOS) or apt install imagemagick (Linux)
for size in 16 32 48 128; do
  convert -background none -resize ${size}x${size} icon.svg icons/icon${size}.png
done
```

---

## Packaging for Distribution

### Create a ZIP for Chrome Web Store

```bash
cd /path/to/refundradar

# Make sure icons exist first
ls extension/icons/

# Package
zip -r refundradar-extension.zip extension/ \
  --exclude "extension/README-extension.md" \
  --exclude "extension/dist/*" \
  --exclude "*/.DS_Store"

echo "✓ Created refundradar-extension.zip"
```

### Verify the package

```bash
unzip -l refundradar-extension.zip
```

### Submit to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **Add new item**
3. Upload `refundradar-extension.zip`
4. Fill in store listing (name, description, screenshots)
5. Set category: **Shopping**
6. Submit for review (typically 1-3 business days)

---

## Supported Stores (auto price detection)

Content script automatically extracts product info from:

| Store         | Detection Method         |
|---------------|--------------------------|
| Amazon        | DOM selectors + JSON-LD  |
| Best Buy      | DOM selectors            |
| Target        | data-test attributes     |
| Walmart       | itemprop attributes      |
| Apple         | JSON-LD structured data  |
| Costco        | JSON-LD                  |
| Nike          | OpenGraph meta tags      |
| Wayfair       | JSON-LD                  |
| Gap/Nordstrom | OpenGraph meta tags      |
| Any site      | Generic JSON-LD fallback |

---

## Permissions Explained

| Permission     | Why it's needed                                     |
|----------------|-----------------------------------------------------|
| `activeTab`    | Read product info from the current page             |
| `storage`      | Save tracked prices and alert count locally         |
| `notifications`| Send return window reminders to the user            |
| `host_permissions` | Access any shopping site for price detection   |
