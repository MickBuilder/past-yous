#!/usr/bin/env node

/**
 * Script to generate WhatsApp-optimized Open Graph image
 * WhatsApp sometimes prefers smaller, simpler images
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateWhatsAppOG() {
  console.log('📱 Generating WhatsApp-optimized OG image...');
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to WhatsApp-friendly dimensions (1:1 ratio)
    await page.setViewport({
      width: 800,
      height: 800,
      deviceScaleFactor: 2 // Higher quality
    });
    
    // Create a simpler HTML for WhatsApp
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Past Yous - WhatsApp OG</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 800px;
            height: 800px;
            font-family: 'Geist Mono', monospace;
            background: linear-gradient(135deg, 
                #2D1810 0%, 
                #1A0F0A 25%,
                #0F0A05 50%,
                #1A0F0A 75%,
                #2D1810 100%);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
          }
          
          /* Gradient overlay */
          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(230, 184, 0, 0.15), transparent 60%),
                        radial-gradient(circle at 70% 80%, rgba(74, 144, 226, 0.1), transparent 60%);
            z-index: 1;
          }
          
          .container {
            position: relative;
            z-index: 2;
            text-align: center;
            max-width: 600px;
          }
          
          .title {
            font-size: 48px;
            font-weight: 700;
            color: #E6B800;
            margin-bottom: 20px;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            letter-spacing: -1px;
          }
          
          .subtitle {
            font-size: 20px;
            color: #A0A0A0;
            margin-bottom: 40px;
            font-weight: 400;
            line-height: 1.4;
          }
          
          .polaroids-container {
            display: flex;
            gap: 20px;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          
          .polaroid {
            width: 80px;
            height: 100px;
            background: white;
            border-radius: 6px;
            padding: 6px 6px 16px 6px;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
            transform: rotate(var(--rotation));
            position: relative;
          }
          
          .polaroid:nth-child(1) { --rotation: -6deg; }
          .polaroid:nth-child(2) { --rotation: 3deg; }
          .polaroid:nth-child(3) { --rotation: -2deg; }
          .polaroid:nth-child(4) { --rotation: 4deg; }
          .polaroid:nth-child(5) { --rotation: -3deg; }
          .polaroid:nth-child(6) { --rotation: 1deg; }
          
          .polaroid-image {
            width: 100%;
            height: 65px;
            background: linear-gradient(45deg, 
                rgba(230, 184, 0, 0.3),
                rgba(74, 144, 226, 0.3),
                rgba(230, 184, 0, 0.2));
            border-radius: 3px;
            position: relative;
            overflow: hidden;
          }
          
          .polaroid-caption {
            position: absolute;
            bottom: 3px;
            left: 6px;
            right: 6px;
            font-size: 8px;
            font-weight: 700;
            color: #2D1810;
            text-align: center;
            font-family: 'Geist Mono', monospace;
          }
          
          .features {
            display: flex;
            gap: 30px;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          
          .feature {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #E6B800;
            font-size: 14px;
          }
          
          .feature-icon {
            width: 20px;
            height: 20px;
            background: #E6B800;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2D1810;
            font-weight: 700;
            font-size: 10px;
          }
          
          .url {
            color: #A0A0A0;
            font-size: 14px;
            font-weight: 400;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="title">Past Yous</h1>
          <p class="subtitle">See yourself through the decades with AI</p>
          
          <div class="polaroids-container">
            <div class="polaroid">
              <div class="polaroid-image"></div>
              <div class="polaroid-caption">60s</div>
            </div>
            <div class="polaroid">
              <div class="polaroid-image"></div>
              <div class="polaroid-caption">70s</div>
            </div>
            <div class="polaroid">
              <div class="polaroid-image"></div>
              <div class="polaroid-caption">80s</div>
            </div>
            <div class="polaroid">
              <div class="polaroid-image"></div>
              <div class="polaroid-caption">90s</div>
            </div>
            <div class="polaroid">
              <div class="polaroid-image"></div>
              <div class="polaroid-caption">2000s</div>
            </div>
            <div class="polaroid">
              <div class="polaroid-image"></div>
              <div class="polaroid-caption">Now</div>
            </div>
          </div>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">AI</div>
              <span>AI-Powered</span>
            </div>
            <div class="feature">
              <div class="feature-icon">📸</div>
              <span>6 Decades</span>
            </div>
            <div class="feature">
              <div class="feature-icon">⚡</div>
              <span>Instant</span>
            </div>
          </div>
          
          <div class="url">pastyous.mikebapps.com</div>
        </div>
      </body>
      </html>
    `;
    
    await page.setContent(html);
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    // Take screenshot
    console.log('📸 Capturing WhatsApp-optimized screenshot...');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false
    });
    
    // Save the image
    const outputPath = path.join(__dirname, '../public/og-image-whatsapp.png');
    fs.writeFileSync(outputPath, screenshot);
    
    console.log(`✅ WhatsApp OG image saved to: ${outputPath}`);
    console.log('📏 Dimensions: 800x800px (1:1 ratio)');
    console.log('📱 Optimized for WhatsApp sharing!');
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error generating WhatsApp OG image:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  generateWhatsAppOG();
}

export { generateWhatsAppOG };
