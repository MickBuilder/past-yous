#!/usr/bin/env node

/**
 * Script to generate Open Graph image for Past Yous
 * This script uses Puppeteer to capture the OG image HTML as a PNG
 * 
 * Usage: node scripts/generate-og-image.js
 * 
 * Requirements:
 * npm install puppeteer
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOGImage() {
  console.log('🎨 Generating Open Graph image...');
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to OG image dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2 // Higher quality
    });
    
    // Load the OG image HTML file
    const htmlPath = path.join(__dirname, '../public/og-image.html');
    const htmlUrl = `file://${htmlPath}`;
    
    console.log('📄 Loading HTML template...');
    await page.goto(htmlUrl, { waitUntil: 'networkidle0' });
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    // Take screenshot
    console.log('📸 Capturing screenshot...');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false
    });
    
    // Save the image
    const outputPath = path.join(__dirname, '../public/og-image.png');
    fs.writeFileSync(outputPath, screenshot);
    
    console.log(`✅ OG image saved to: ${outputPath}`);
    console.log('📏 Dimensions: 1200x630px');
    console.log('🎯 Ready for social media sharing!');
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error generating OG image:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateOGImage();
}

export { generateOGImage };
