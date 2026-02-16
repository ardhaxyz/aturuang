# Creating OG Image for WhatsApp

## Method 1: HTML to PNG (Recommended)
1. Open `og-image.html` in browser
2. Set zoom to 100%
3. Screenshot the page
4. Crop to 1200x630 pixels
5. Save as `og-image.png` in this folder

## Method 2: SVG to PNG
1. Open `og-image.svg` in browser or design tool
2. Export/save as PNG with dimensions 1200x630
3. Save as `og-image.png` in this folder

## Method 3: Online Converter
Use online HTML to PNG converter:
- https://htmlcsstoimage.com/
- https://convertio.co/html-png/

Upload og-image.html and download PNG (1200x630).

## Requirements
- Dimensions: 1200x630 pixels
- Format: PNG or JPG
- Max file size: 8MB (for WhatsApp)
- Location: /public/og-image.png

## Testing
After creating og-image.png, test by sharing
https://aturuang.ardha.xyz on WhatsApp.

## Additional Files Needed

### favicon.ico (Multi-resolution icon)
Optional: Create favicon.ico with multiple sizes (16x16, 32x32, 48x48)
for older browser support.

### apple-touch-icon.png (180x180)
Create PNG icon for iOS devices:
- Size: 180x180 pixels
- Background: #3b82f6 (blue) or transparent
- Content: Calendar icon or "📅"
- Save as: apple-touch-icon.png

## Quick Generation Script (if tools available)

Using ImageMagick:
```bash
# Convert SVG to PNG
convert og-image.svg -resize 1200x630 og-image.png

# Create favicon.ico
convert favicon.svg -resize 32x32 favicon.ico

# Create Apple touch icon
convert favicon.svg -resize 180x180 -background '#3b82f6' apple-touch-icon.png
```

Using Node.js + Sharp:
```javascript
const sharp = require('sharp');
const fs = require('fs');

// Convert SVG files to PNG
async function generateIcons() {
  // OG Image
  await sharp('og-image.svg')
    .resize(1200, 630)
    .png()
    .toFile('og-image.png');
  
  // Apple Touch Icon
  await sharp('favicon.svg')
    .resize(180, 180)
    .flatten({ background: '#3b82f6' })
    .png()
    .toFile('apple-touch-icon.png');
}

generateIcons();
```
