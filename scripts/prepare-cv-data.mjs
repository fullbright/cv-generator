#!/usr/bin/env node
/**
 * prepare-cv-data.mjs — Transform cv-entries-current.json from the vault
 * into public/cv-data.json consumed by the Vite+React CV app.
 *
 * Usage:
 *   node scripts/prepare-cv-data.mjs [--vault-root /path/to/vault]
 *
 * Defaults:
 *   vault-root: VAULT_ROOT env var → ../my-obsidian (sibling directory)
 *   output:     public/cv-data.json
 *
 * Profile data (name, title, email, etc.) comes from PROFILE_DATA env var
 * (JSON string) or from vault root's vault_profile.json if present.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dir, '..');

// ---- Parse args ----
const args = process.argv.slice(2);
const vaultRootIdx = args.indexOf('--vault-root');
let vaultRoot = vaultRootIdx !== -1
  ? resolve(args[vaultRootIdx + 1])
  : (process.env.VAULT_ROOT ? resolve(process.env.VAULT_ROOT) : resolve(PROJECT_ROOT, '../my-obsidian'));

// ---- Load source JSON ----
const cvJsonPath = join(vaultRoot, 'reports', 'cv-entries-current.json');
if (!existsSync(cvJsonPath)) {
  console.error(`[prepare-cv-data] ERROR: ${cvJsonPath} not found.`);
  console.error('Run cv_entry_review.py in the vault first, or set --vault-root correctly.');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(cvJsonPath, 'utf8'));

// Support both list format and {"entries": [...]} format
const rawEntries = Array.isArray(raw) ? raw : (raw.entries || raw.pending || []);

// ---- Build entries ----
const entries = rawEntries
  .filter(e => e && e.title)
  .map(e => ({
    title:        e.title || '',
    role:         e.role  || '',
    company:      e.company || '',
    period:       e.period  || '',
    type:         e.type    || 'project',
    skills:       Array.isArray(e.skills)  ? e.skills  : [],
    summary:      e.summary     || '',
    description:  e.description || '',
    achievements: Array.isArray(e.achievements) ? e.achievements : [],
    learnings:    Array.isArray(e.learnings)    ? e.learnings    : [],
    source_sp:    e.source_sp || ''
  }));

// ---- Load profile ----
let profile = {};
const profileJsonPath = join(vaultRoot, 'vault_profile.json');
if (process.env.PROFILE_DATA) {
  try { profile = JSON.parse(process.env.PROFILE_DATA); } catch {}
} else if (existsSync(profileJsonPath)) {
  try { profile = JSON.parse(readFileSync(profileJsonPath, 'utf8')); } catch {}
} else {
  // Default profile — override via vault_profile.json or PROFILE_DATA env
  profile = {
    name:     'Sergio Afanou',
    title:    'Software Engineer & Indie Maker',
    email:    'sergio@bright-softwares.com',
    github:   'https://github.com/sergioafanou',
    linkedin: 'https://linkedin.com/in/sergioafanou',
    website:  'https://bright-softwares.com',
    location: 'France',
    summary:  'Full-stack software engineer and solopreneur building SaaS products, automation tools, and enterprise solutions. Specializes in Python, JavaScript, Google Apps Script, Jekyll, and cloud-native architectures.'
  };
}

// ---- Write output ----
const output = { profile, entries };
const publicDir = join(PROJECT_ROOT, 'public');
mkdirSync(publicDir, { recursive: true });
const outPath = join(publicDir, 'cv-data.json');
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`[prepare-cv-data] Wrote ${entries.length} entries to ${outPath}`);
