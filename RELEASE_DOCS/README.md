QuiZDD Release Notes

Version
-------
2.1.1 (2026-05-26)

This folder contains the documents needed to publish the 2.1.1 release cleanly.

Release feature baseline
------------------------
- Seeded educational content now exceeds 2000 questions across all 7 subjects
- Quiz selection includes diversity balancing across topic tags, difficulty, and question type
- Existing installations backfill new boost and ultra boost content during startup checks
- Word Search puzzle: letters shared between crossing found words are always re-selectable
- Security audit completed; dev-toolchain vulnerabilities documented (none affect the compiled app)

What is included
----------------
- `CHANGELOG.md` - release summary for 2.1.1
- `RELEASE_INSTRUCTIONS.md` - exact publish steps
- `README.md` - short release overview

Primary release outputs
-----------------------
- Portable executable: `src-tauri/target/release/QuizDD.exe`
- Installer bundles: `src-tauri/target/release/bundle/`
- Publishable source mirror: `GIT_SYNC_GITHUB/`
- Source ZIP: `quizdd-2.1.1-source.zip`

Verification baseline
---------------------
- Frontend: `npm run test:run`
- Backend: `cargo test --manifest-path src-tauri/Cargo.toml`
- Production bundle: `npm run build`
- Desktop package: `cargo tauri build`

Publishing note
---------------
Refresh `GIT_SYNC_GITHUB` before publishing to GitHub so the mirror contains the latest docs, scripts, source files, and release metadata.

