#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'dist-packages');
const targetReleaseDir = path.join(rootDir, 'src-tauri', 'target', 'release');
const bundleDir = path.join(targetReleaseDir, 'bundle');

const versionInfo = JSON.parse(fs.readFileSync(path.join(rootDir, 'version.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const tauriConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'src-tauri', 'tauri.conf.json'), 'utf8'));
const cargoToml = fs.readFileSync(path.join(rootDir, 'src-tauri', 'Cargo.toml'), 'utf8');

function readCargoField(fieldName) {
  const match = cargoToml.match(new RegExp(`^${fieldName}\\s*=\\s*"([^"]+)"`, 'm'));

  if (!match) {
    throw new Error(`Unable to read ${fieldName} from src-tauri/Cargo.toml`);
  }

  return match[1];
}

const metadata = {
  version: versionInfo.version,
  packageVersion: packageJson.version,
  cargoVersion: readCargoField('version'),
  cargoName: readCargoField('name'),
  productName: tauriConfig.package?.productName ?? 'QuizDD',
  tauriVersion: tauriConfig.package?.version,
};

function ensureVersionsAligned() {
  const uniqueVersions = new Set([
    metadata.version,
    metadata.packageVersion,
    metadata.cargoVersion,
    metadata.tauriVersion,
  ]);

  if (uniqueVersions.size !== 1) {
    throw new Error(
      `Version mismatch detected: version.json=${metadata.version}, package.json=${metadata.packageVersion}, Cargo.toml=${metadata.cargoVersion}, tauri.conf.json=${metadata.tauriVersion}`
    );
  }
}

function ensureCommand(command, errorMessage) {
  try {
    execSync(command, { cwd: rootDir, stdio: 'pipe' });
  } catch {
    throw new Error(errorMessage);
  }
}

function run(command, cwd = rootDir) {
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
}

function resetDirectory(directoryPath) {
  fs.rmSync(directoryPath, { recursive: true, force: true });
  fs.mkdirSync(directoryPath, { recursive: true });
}

function findPortableExecutable() {
  const candidates = [
    path.join(targetReleaseDir, `${metadata.productName}.exe`),
    path.join(targetReleaseDir, `${metadata.cargoName}.exe`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const releaseEntries = fs.readdirSync(targetReleaseDir, { withFileTypes: true });
  const fallback = releaseEntries.find((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.exe'));

  return fallback ? path.join(targetReleaseDir, fallback.name) : null;
}

function copyIfExists(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
  return true;
}

function copyDirectory(sourcePath, destinationPath) {
  fs.rmSync(destinationPath, { recursive: true, force: true });
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}

function collectFiles(directoryPath) {
  const files = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function writeChecksums() {
  const lines = collectFiles(outputDir)
    .map((filePath) => {
      const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
      const relativePath = path.relative(outputDir, filePath).replace(/\\/g, '/');
      return `${hash}  ${relativePath}`;
    })
    .sort();

  fs.writeFileSync(path.join(outputDir, 'checksums.txt'), `${lines.join('\n')}\n`);
}

function writeReleaseSummary(portableExecutablePath) {
  const lines = [
    `App: ${metadata.productName}`,
    `Version: ${metadata.version}`,
    `Platform: ${os.platform()} ${os.arch()}`,
    `Portable executable: ${portableExecutablePath ?? 'not found'}`,
    `Bundle directory: ${fs.existsSync(bundleDir) ? bundleDir : 'not found'}`,
    `Publishable source clone: ${path.join(rootDir, 'GIT_SYNC_GITHUB')}`,
  ];

  fs.writeFileSync(path.join(outputDir, 'release-summary.txt'), `${lines.join('\n')}\n`);
}

function main() {
  ensureVersionsAligned();
  ensureCommand('rustc --version', 'Rust is required to build QuizDD.');
  ensureCommand('cargo tauri --version', 'Tauri CLI is required. Install it with `cargo install tauri-cli`.');
  ensureCommand('npm --version', 'npm is required to build QuizDD.');

  console.log(`Preparing QuizDD ${metadata.version} for packaging...`);
  resetDirectory(outputDir);

  run('npm run test:run');
  run('cargo test --manifest-path src-tauri/Cargo.toml');
  run('npm run build');
  run('cargo tauri build');

  const portableExecutable = findPortableExecutable();
  if (!portableExecutable) {
    throw new Error('Unable to find the built portable executable under src-tauri/target/release.');
  }

  const portableOutputName = `${metadata.productName}-${metadata.version}-portable${path.extname(portableExecutable)}`;
  const portableOutputPath = path.join(outputDir, portableOutputName);
  copyIfExists(portableExecutable, portableOutputPath);

  if (!fs.existsSync(bundleDir)) {
    throw new Error('Tauri bundle output was not created under src-tauri/target/release/bundle.');
  }

  copyDirectory(bundleDir, path.join(outputDir, 'bundle'));

  for (const fileName of ['LICENSE', 'THIRD_PARTY_LICENSES.md', 'CHANGELOG.md', 'README.md', 'version.json']) {
    copyIfExists(path.join(rootDir, fileName), path.join(outputDir, fileName));
  }

  writeChecksums();
  writeReleaseSummary(portableOutputPath);

  console.log('Release build ready.');
  console.log(`Portable executable: ${portableOutputPath}`);
  console.log(`Bundle directory copy: ${path.join(outputDir, 'bundle')}`);
  console.log(`Checksums: ${path.join(outputDir, 'checksums.txt')}`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (invokedPath === __filename) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}