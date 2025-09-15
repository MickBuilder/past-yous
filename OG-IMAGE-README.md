# Open Graph Image Generation

This document explains how to generate the Open Graph (OG) image for Past Yous social media sharing.

## Overview

The OG image is designed to showcase the app's concept with:
- **Gradient background** matching the app's theme
- **6 polaroid cards** representing different decades (60s, 70s, 80s, 90s, 2000s, Now)
- **App branding** with title and key features
- **Professional styling** optimized for social media

## Files Created

1. **`public/og-image.html`** - HTML template for the OG image
2. **`scripts/generate-og-image.js`** - Node.js script to generate PNG
3. **`public/favicon.svg`** - App favicon
4. **Updated `index.html`** - Complete OG meta tags
5. **Updated `package.json`** - Added puppeteer dependency and script

## How to Generate the OG Image

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Generate the Image
```bash
npm run generate-og
```

This will:
- Launch a headless browser
- Load the HTML template
- Capture a 1200x630px PNG screenshot
- Save it as `public/og-image.png`

### Step 3: Verify the Image
Check that `public/og-image.png` was created successfully.

## OG Image Features

### Visual Design
- **Dimensions**: 1200x630px (Facebook/Twitter standard)
- **Background**: Dark gradient matching app theme
- **Typography**: Geist Mono font (same as app)
- **Colors**: Uses app's CSS custom properties

### Content Elements
- **Title**: "Past Yous" in large, bold text
- **Subtitle**: "See yourself through the decades with AI"
- **Polaroid Cards**: 6 cards with decade labels (60s, 70s, 80s, 90s, 2000s, Now)
- **Features**: AI-Powered, 6 Decades, Instant
- **CTA**: "Generate Your Past Yous" button
- **URL**: pastyous.mikebapps.com

### Technical Details
- **High DPI**: 2x device scale factor for crisp images
- **Font Loading**: Waits for web fonts to load
- **Responsive**: Optimized for social media platforms

## Meta Tags Added

The following meta tags were added to `index.html`:

### Primary Meta Tags
- Title, description, keywords
- Author and robots directives
- Theme color and canonical URL

### Open Graph (Facebook)
- Complete OG tags for rich link previews
- Image dimensions and alt text
- Site name and locale

### Twitter Cards
- Large image card format
- Optimized for Twitter sharing
- Matching content with OG tags

## Social Media Preview

When shared on social platforms, the link will display:
- **Rich preview** with the custom OG image
- **Compelling title** and description
- **Professional appearance** that matches the app

## Customization

To modify the OG image:

1. **Edit `public/og-image.html`** - Change colors, text, layout
2. **Run `npm run generate-og`** - Regenerate the PNG
3. **Update meta tags** in `index.html` if needed

## Deployment

Make sure to:
1. Generate the OG image before deployment
2. Upload `og-image.png` to your hosting provider
3. Verify the image URL in meta tags matches your domain (https://pastyous.mikebapps.com/)
4. Test social media sharing on Facebook/Twitter

## Troubleshooting

### Puppeteer Issues
If you encounter Puppeteer issues:
```bash
# On macOS/Linux
sudo npm install puppeteer

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer
```

### Image Quality
For higher quality:
- Increase `deviceScaleFactor` in the script
- Use higher resolution fonts
- Optimize the HTML template

### Font Loading
If fonts don't load properly:
- Check Google Fonts CDN availability
- Add font-display: swap to CSS
- Use system fonts as fallback
