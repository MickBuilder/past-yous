#!/usr/bin/env node

/**
 * Script to convert SVG favicon to PNG files
 * Uses Puppeteer to render SVG and capture as PNG
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  console.log('🎨 Converting SVG favicon to PNG files...');
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Read the SVG content
    const svgPath = path.join(__dirname, '../public/favicon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Create HTML with the SVG
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: transparent; }
          svg { display: block; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Set viewport for different sizes
    const sizes = [
      { name: 'favicon.png', size: 32 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];
    
    for (const { name, size } of sizes) {
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 2 });
      
      // Wait for SVG to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        omitBackground: true
      });
      
      // Save the image
      const outputPath = path.join(__dirname, '../public', name);
      fs.writeFileSync(outputPath, screenshot);
      
      console.log(`✅ Created ${name} (${size}x${size}px)`);
    }
    
    await browser.close();
    console.log('🎯 All PNG files created successfully!');
    
  } catch (error) {
    console.error('❌ Error converting SVG to PNG:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  convertSvgToPng();
}

export { convertSvgToPng };
