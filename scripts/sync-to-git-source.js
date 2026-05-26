/**
 * Mirrors the publishable repository contents into GIT_SYNC_GITHUB.
 * Build outputs, caches, local backups, and generated archives are excluded.
 * The destination clone's .git directory is preserved.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const syncSourceDir = path.join(rootDir, 'GIT_SYNC_GITHUB');
const preservedDestinationEntries = new Set(['.git', '.gitattributes', '.gitignore']);

const excludedTopLevelEntries = new Set([
  '.git',
  '.kiro',
  '.vscode',
  'dist',
  'dist-packages',
  'GIT_SYNC_GITHUB',
  'GIT_SYNC_SOURCE',
  'node_modules',
  'QZbak',
]);

const excludedDirectoryNames = new Set(['.git', 'dist', 'node_modules', 'target']);
const excludedFileExtensions = new Set(['.log', '.zip', '.7z']);

function shouldIgnore(relativePath, entry) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const topLevelName = normalizedPath.split('/')[0];

  if (excludedTopLevelEntries.has(topLevelName)) {
    return true;
  }

  if (entry.isDirectory() && excludedDirectoryNames.has(entry.name)) {
    return true;
  }

  if (entry.isFile() && excludedFileExtensions.has(path.extname(entry.name).toLowerCase())) {
    return true;
  }

  return false;
}

function mirrorDirectory(sourceDir, destinationDir, relativeBase = '') {
  fs.mkdirSync(destinationDir, { recursive: true });

  const sourceEntries = fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => !shouldIgnore(path.join(relativeBase, entry.name), entry));

  const allowedNames = new Set(sourceEntries.map((entry) => entry.name));

  for (const existingEntry of fs.readdirSync(destinationDir, { withFileTypes: true })) {
    if (!relativeBase && preservedDestinationEntries.has(existingEntry.name)) {
      continue;
    }

    if (!allowedNames.has(existingEntry.name)) {
      fs.rmSync(path.join(destinationDir, existingEntry.name), { recursive: true, force: true });
    }
  }

  for (const entry of sourceEntries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    const relativePath = path.join(relativeBase, entry.name);

    if (entry.isDirectory()) {
      mirrorDirectory(sourcePath, destinationPath, relativePath);
      continue;
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function syncCodebase() {
  console.log('Syncing publishable repository content into GIT_SYNC_GITHUB...');
  mirrorDirectory(rootDir, syncSourceDir);
  console.log(`Sync complete: ${syncSourceDir}`);
}

syncCodebase();
