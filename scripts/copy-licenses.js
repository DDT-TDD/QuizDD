#!/usr/bin/env node

/**
 * Copy License Files to Build Output
 * Ensures LICENSE, THIRD_PARTY_LICENSES.md, and CHANGELOG.md are included in dist
 * Run before build or after build to ensure licenses are present
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const licenseFiles = [
  'LICENSE',
  'THIRD_PARTY_LICENSES.md',
  'CHANGELOG.md'
];

const distDir = 'dist';

console.log('📋 Copying license files...');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`Created directory: ${distDir}`);
}

// Copy each license file
let copiedCount = 0;
for (const file of licenseFiles) {
  const source = path.join('.', file);
  const dest = path.join(distDir, file);
  
  if (fs.existsSync(source)) {
    try {
      fs.copyFileSync(source, dest);
      console.log(`✅ Copied: ${file}`);
      copiedCount++;
    } catch (error) {
      console.error(`❌ Error copying ${file}: ${error.message}`);
    }
  } else {
    console.warn(`⚠️  File not found: ${file}`);
  }
}

console.log(`\n✅ Completed: ${copiedCount}/${licenseFiles.length} license files copied to ${distDir}/`);

// Verify all files are present
console.log('\n📁 Verifying license files in dist:');
for (const file of licenseFiles) {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} (missing)`);
  }
}
