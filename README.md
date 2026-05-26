# QuiZDD

Version: 2.1.1
Release date: 2026-05-26
License: MIT

QuiZDD is an offline-first educational quiz desktop app for Key Stage 1 and Key Stage 2 children. It combines a React + TypeScript frontend with a Tauri/Rust backend, ships with seeded learning content, and includes child-friendly feedback, puzzles, custom mixes, parental controls, and local progress tracking.

## Highlights

- Offline desktop app with embedded SQLite storage
- Subjects for KS1 and KS2 learners, including puzzles and custom quiz mixes
- 2000+ seeded questions across 7 subjects, including boost and ultra boost content sets
- Diversity-aware quiz selection that balances topic tags, difficulty levels, and question types
- Kid-friendly feedback, background music controls, and celebratory results screens
- Tauri desktop packaging for Windows: portable executable, MSI installer, and NSIS setup wizard
- Release mirror workflow through `GIT_SYNC_GITHUB` for GitHub publishing

## Workspace layout

- `src/` - React application and UI components
- `src-tauri/` - Rust backend, database, services, and packaging config
- `public/` - Static audio and image assets
- `scripts/` - Build, packaging, licensing, and sync utilities
- `RELEASE_DOCS/` - Release notes and publishing instructions
- `GIT_SYNC_GITHUB/` - Generated publishable mirror of the repository

## Local development

Prerequisites:

- Node.js LTS and npm
- Rust stable toolchain
- Tauri prerequisites for your operating system

Install dependencies:

```powershell
Push-Location c:\Users\DD\Desktop\QZ
npm install
Pop-Location
```

Run the desktop app in development:

```powershell
Push-Location c:\Users\DD\Desktop\QZ
npm run tauri:dev
Pop-Location
```

Run verification:

```powershell
Push-Location c:\Users\DD\Desktop\QZ
npm run test:run
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
Pop-Location
```

## Build outputs

Frontend build output:

- `dist/`

Windows portable executable:

- `src-tauri/target/release/QuizDD.exe`

Windows installer and bundle output:

- `src-tauri/target/release/bundle/`

Packaged release copy created by `node scripts/build-and-package.js`:

- `dist-packages/`

## Release workflow

Refresh the publishable source mirror:

```powershell
Push-Location c:\Users\DD\Desktop\QZ
node scripts/sync-to-git-source.js
Pop-Location
```

Create a source ZIP from the mirrored release folder:

```powershell
Push-Location c:\Users\DD\Desktop\QZ
powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1 -Version 2.1.1
Pop-Location
```

Create a verified packaged desktop release:

```powershell
Push-Location c:\Users\DD\Desktop\QZ
node scripts/build-and-package.js
Pop-Location
```

## Content seeding

If you change the seeded educational content, reseed the local database:

```powershell
Push-Location c:\Users\DD\Desktop\QZ\src-tauri
cargo run --bin seed_database
Pop-Location
```

Windows application data location:

- `%APPDATA%\Educational Quiz App\educational_quiz_app.db`

## Version alignment

Release version `2.1.1` is aligned in:

- `version.json`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

User-facing version displays should read from `version.json`, while packaged application metadata must stay aligned with the Rust and Tauri configuration files above.
