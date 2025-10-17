# QuiZDD - Educational Quiz AppQuiZDD - Educational Quiz App



**Version:** 2.0.0 (2025-10-18)  Version

**License:** MIT (see [LICENSE](LICENSE))-------

1.0.0 (2025-10-14)

## Overview

Summary

QuiZDD is an offline-capable educational quiz application targeting Key Stage 1 and 2 learners. Built with a Rust backend (Tauri) and React + TypeScript frontend, it features embedded SQLite database with comprehensive quiz functionality.-------

QuiZDD is an offline-capable educational quiz application targeting Key Stage 1 and 2 learners. It uses a Rust backend (Tauri) with an embedded SQLite database and a React + TypeScript frontend built with Vite.

## Features

This repository contains the full source for the desktop application, including a seeder for the content database, quiz engine and scoring logic in Rust (under `src-tauri/`), and the UI in `src/`.

- ✅ Offline-capable desktop application

- ✅ Responsive React + TypeScript UIQuick links

- ✅ Rust backend with Tauri framework-----------

- ✅ Embedded SQLite database- Backend (Tauri/Rust): `src-tauri/`

- ✅ Quiz engine with scoring logic- Frontend (React/TS): `src/`

- ✅ Content seeder for easy data management- Seeder & DB tools: `src-tauri/src/bin/seed_database.rs`, `src-tauri/src/services/content_seeder.rs`

- ✅ Cross-platform support (Windows, macOS, Linux)- Recent changelog and fixes: `COMPLETE_QUIZ_FIXES.md`, `FLAGPEDIA_MIGRATION_COMPLETE.md`, `SCORING_FIX_COMPLETE.md`

- ✅ Automatic license file inclusion in all builds

Getting started (development)

## Project Structure-----------------------------

Prerequisites

```- Rust toolchain (recommended stable >= 1.60; see `src-tauri/.rustc_info.json` for the environment used during development)

.- Node.js (LTS) and npm

├── src/                          # React + TypeScript frontend- Optional: Tauri prerequisites for your OS (see https://tauri.app/)

│   ├── components/               # UI components

│   ├── services/                 # API and data servicesInstall dependencies (frontend)

│   └── App.tsx                   # Main application

├── src-tauri/                    # Rust backend (Tauri)```powershell

│   ├── src/cd "C:\Users\DD\Desktop\QZ"

│   │   ├── services/             # Business logic and databasenpm install

│   │   └── bin/                  # Utility binaries (seeder, etc)```

│   └── Cargo.toml

├── public/                       # Static assetsBuild & run (development)

└── package.json

```- Run the backend & UI in dev mode (Tauri):



## Getting Started```powershell

cd "C:\Users\DD\Desktop\QZ"

### Prerequisitesnpm run tauri:dev

```

- **Node.js** (LTS) and npm

- **Rust** (stable >= 1.60) - [Install Rust](https://www.rust-lang.org/tools/install)- Or build the production bundle:

- **Tauri requirements** - See [Tauri documentation](https://tauri.app/v1/guides/getting-started/prerequisites) for your OS

```powershell

### Installationcd "C:\Users\DD\Desktop\QZ"

npm run build

```bash```

# Install dependencies

npm installLicense file inclusion

```---------------------

All builds automatically include the following license files:

### Development- `LICENSE` — MIT License (main application license)

- `THIRD_PARTY_LICENSES.md` — Third-party library attributions

```bash- `CHANGELOG.md` — Version history and release notes

# Run in development mode (live reload)

npm run tauri:devThese files are included in:

- Frontend builds (in `dist/` folder)

# Or just build the frontend- Tauri desktop builds (bundled with the application)

npm run build- Distribution packages (Windows, macOS, Linux)



# Run frontend in dev mode onlyThe inclusion is automatic and requires no manual steps. License files are copied during the build process for all build variants:

npm run dev```powershell

```npm run build              # Licenses in dist/

npm run build:dev         # Licenses in dist/

### Building for Productionnpm run build:optimized   # Licenses in dist/

npm run tauri:dev         # Licenses bundled + in dist/

```bashnpm run tauri:build       # Licenses bundled

# Build and bundle for your platformnpm run package           # Licenses in dist-packages/

npm run tauri:buildnpm run copy:licenses     # Manual copy to dist/ if needed

```

# Create distribution packages

npm run packageSeeding the application database (important after content changes)

```-----------------------------------------------------------------

The project seeds its embedded SQLite database with static educational content. If you change the seeder (`src-tauri/src/services/content_seeder.rs`), you must re-run the seeder so the running app uses the updated assets/URLs:

## Build Outputs

```powershell

License files are automatically included in all builds:cd "C:\Users\DD\Desktop\QZ\src-tauri"

# Recreate the DB in-app's AppData location by running the seed bin

| Build Command | Output Location | Includes |cargo run --bin seed_database

|---|---|---|```

| `npm run build` | `dist/` | Frontend + licenses |

| `npm run tauri:dev` | App bundle | Desktop app + licenses |On Windows the app database is stored in:

| `npm run tauri:build` | App bundle | Desktop app + licenses |`%APPDATA%\Educational Quiz App\educational_quiz_app.db`

| `npm run package` | `dist-packages/` | Distributions + licenses |

Changelog (selected, recent)

**License files included:**----------------------------

- `LICENSE` - MIT License- 2025-10-14 — 1.0.0

- `THIRD_PARTY_LICENSES.md` - Third-party attributions  - Migrated flag image sources to Flagpedia.net (format: `https://flagpedia.net/data/flags/w580/{iso}.png`) in the content seeder and reseeded the DB. See `FLAGPEDIA_MIGRATION_COMPLETE.md` for details.

- `CHANGELOG.md` - Version history  - Fixed frontend placeholder and noisy "Invalid question state detected" logging by tightening completion checks in `src/components/QuizInterface.tsx`.

  - Corrected backend scoring bug where `total_questions` could be set incorrectly — now Score objects reflect the quiz length correctly (see `src-tauri/src/services/quiz_engine.rs`).

## Database  - Verified and reseeded DB; sample flag images confirmed to load.



### Initial SetupProject structure

-----------------

The application uses an embedded SQLite database seeded with educational content:- `src/` — React + TypeScript frontend. Key components in `src/components/`.

- `src-tauri/` — Rust backend, seeder and bin tools.

```bash- `public/` — static assets used by the frontend (audio, images).

cd src-tauri- Various docs and fix logs at repository root.

cargo run --bin seed_database

```How scoring works (brief)

-------------------------

**Database location (Windows):**Scoring is calculated in the backend (`src-tauri/src/services/quiz_engine.rs`). High-level components:

```- Points per question are awarded by `calculate_points` (correctness + streaks).

%APPDATA%\Educational Quiz App\educational_quiz_app.db- Additional bonuses: time bonus via `calculate_time_bonus` and streak bonus via `calculate_streak_bonus`.

```- The final `Score` includes total questions, correct answers, accuracy percentage and bonuses.



### Content UpdatesIf you change scoring logic, update the tests and re-run the Rust build.



If you modify content in `src-tauri/src/services/content_seeder.rs`, reseed the database:Third-party assets & licenses

-----------------------------

```bashThis project uses several third-party libraries (see `package.json` and `src-tauri/Cargo.toml`) and external assets. A collected summary is in `THIRD_PARTY_LICENSES.md`.

cd src-tauri

cargo run --bin seed_databaseTests

```-----

- Frontend: `npm run test` (vitest)

## Scoring System- Backend: Rust tests under `src-tauri/src/` (run with `cargo test` from `src-tauri/`).



Scoring is calculated in the backend (`src-tauri/src/services/quiz_engine.rs`):Contributing

------------

- **Base points** - Awarded for correct answers- Keep changes focused and run the seeder when content files change.

- **Time bonus** - Bonus for answering quickly- Avoid large, simultaneous edits to both backend and frontend without re-running builds and the DB seeder.

- **Streak bonus** - Bonus for consecutive correct answers

Contact / Maintainer

Final score includes:--------------------

- Total questionsSee `Cargo.toml` authors and repository fields — update them to your name/email.

- Correct answers

- Accuracy percentageLicense

- Total bonuses-------

This repository is provided under the MIT License (see `LICENSE`). Third-party notices are included in `THIRD_PARTY_LICENSES.md`.

## Scripts

Acknowledgements

```bash----------------

# Development- Flag images migrated to Flagpedia.net (https://flagpedia.net) — used under Flagpedia's stated terms (see `THIRD_PARTY_LICENSES.md`).

npm run dev                    # Frontend dev server

npm run tauri:dev            # Desktop app with dev server
npm run build                # Build frontend
npm run tauri:build          # Build production desktop app

# Packaging & Distribution
npm run package              # Create distribution packages
npm run package:windows      # Windows distribution
npm run package:macos        # macOS distribution
npm run package:linux        # Linux distribution

# Testing & Quality
npm run test                 # Run tests
npm run lint                 # ESLint
npm run type-check           # TypeScript check

# License Management
npm run copy:licenses        # Manually copy licenses to dist/
```

## Testing

```bash
# Frontend tests (vitest)
npm run test

# Run tests once
npm run test:run

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Backend tests (Rust)
cd src-tauri
cargo test
```

## Licenses

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

### Third-Party Licenses

This project uses several third-party libraries and assets. See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) for complete attributions.

**Notable third-party sources:**
- Flag images: [Flagpedia.net](https://flagpedia.net)

## Contributing

1. Keep changes focused and modular
2. Run tests before submitting changes
3. Update database seeder if content changes
4. Avoid simultaneous large edits to backend and frontend without rebuilds
5. Document breaking changes

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and notable changes.

**Latest (v2.0.0):**
- Migrated flag images to Flagpedia.net
- Fixed frontend placeholder and logging issues
- Corrected backend scoring bug
- Verified and reseeded database

## Troubleshooting

### Build Issues

**"require is not defined" error:**
- The project uses ES modules. Ensure all scripts use `import` syntax, not `require()`

**Tauri build fails:**
- Ensure Rust is installed: `rustc --version`
- Update Rust: `rustup update`
- Clean build: `npm run tauri:build -- --clean` or delete `src-tauri/target/`

### Database Issues

**App shows no content:**
- Run database seeder: `cd src-tauri && cargo run --bin seed_database`
- Check database location in troubleshooting section above

**Scoring seems incorrect:**
- Ensure backend is rebuilt: `npm run tauri:build`
- Check scoring logic in `src-tauri/src/services/quiz_engine.rs`

## Development Workflow

```
1. Make code changes
2. Run tests: npm run test
3. Build & test locally: npm run tauri:dev
4. If database changes needed: reseed with cargo run --bin seed_database
5. Build for production: npm run tauri:build
6. Test distribution: npm run package
```

## System Requirements

**Minimum:**
- Windows 7+ / macOS 10.12+ / Ubuntu 18.04+
- 2GB RAM
- 100MB disk space

**Recommended:**
- Windows 10+ / macOS 11+ / Ubuntu 20.04+
- 4GB RAM
- SSD with 200MB space

## Support & Issues

For bug reports, feature requests, or questions:
1. Check [CHANGELOG.md](CHANGELOG.md) for known issues
2. Review existing documentation
3. Open an issue in the repository

## Author

See [Cargo.toml](src-tauri/Cargo.toml) for author information.

---

**Made with ❤️ for educational learners**
