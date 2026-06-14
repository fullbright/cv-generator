#!/usr/bin/env node
/**
 * export-pdf.mjs — Headless Playwright PDF export for the CV app.
 *
 * Usage:
 *   node scripts/export-pdf.mjs [--port 5174] [--output cv/sergio-afanou-cv-YYYY-MM.pdf]
 *
 * Requires:
 *   1. public/cv-data.json to exist (run prepare-cv-data.mjs first)
 *   2. Vite dev server running on --port (default 5174)
 *      OR set VITE_PREVIEW=1 to use vite preview instead.
 *
 * Output:
 *   cv/sergio-afanou-cv-YYYY-MM.pdf  (versioned, committed to repo)
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawn } from 'node:child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dir, '..');

// ---- Parse args ----
const args = process.argv.slice(2);
const portIdx  = args.indexOf('--port');
const outIdx   = args.indexOf('--output');
const PORT     = portIdx  !== -1 ? parseInt(args[portIdx  + 1], 10) : 5174;

const now      = new Date();
const yyyyMM   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const outFile  = outIdx !== -1
  ? resolve(args[outIdx + 1])
  : resolve(PROJECT_ROOT, 'cv', `sergio-afanou-cv-${yyyyMM}.pdf`);

mkdirSync(dirname(outFile), { recursive: true });

// ---- Check public/cv-data.json ----
const cvData = resolve(PROJECT_ROOT, 'public', 'cv-data.json');
if (!existsSync(cvData)) {
  console.error('[export-pdf] ERROR: public/cv-data.json not found. Run prepare-cv-data.mjs first.');
  process.exit(1);
}

// ---- Start vite preview if not already running ----
let server = null;
const url   = `http://localhost:${PORT}`;

async function checkServerAlive() {
  try {
    const { default: http } = await import('node:http');
    return await new Promise(resolve => {
      const req = http.get(url, () => resolve(true));
      req.on('error', () => resolve(false));
      req.setTimeout(1000, () => { req.destroy(); resolve(false); });
    });
  } catch { return false; }
}

async function main() {
  const alreadyUp = await checkServerAlive();

  if (!alreadyUp) {
    console.log(`[export-pdf] Starting vite preview on port ${PORT}…`);
    // Build first, then preview
    try {
      execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    } catch (e) {
      console.error('[export-pdf] vite build failed:', e.message);
      process.exit(1);
    }
    server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
      cwd: PROJECT_ROOT, stdio: 'ignore', detached: false
    });
    // Wait for server to start
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await checkServerAlive()) break;
    }
  }

  try {
    console.log(`[export-pdf] Launching headless Chrome → ${url}`);
    const browser = await chromium.launch();
    const page    = await browser.newPage();

    // A4 viewport
    await page.setViewportSize({ width: 794, height: 1123 });  // ~A4 at 96dpi
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);  // let fonts and images settle

    await page.pdf({
      path:   outFile,
      format: 'A4',
      margin: { top: '1.2cm', right: '1.2cm', bottom: '1.2cm', left: '1.2cm' },
      printBackground: true
    });

    await browser.close();
    console.log(`[export-pdf] PDF saved: ${outFile}`);
  } finally {
    if (server) server.kill();
  }
}

main().catch(err => {
  console.error('[export-pdf] ERROR:', err.message);
  if (server) server.kill();
  process.exit(1);
});
