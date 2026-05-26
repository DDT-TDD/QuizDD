# Changelog

## [2.1.1] - 2026-05-26
- Fixed Word Search (WordFind) puzzle: letters that are part of an already-found (green) word can now always be selected for crossing/overlapping words — a second tap on a found cell no longer undoes the selection
- Security audit run against all npm dependencies; 16 dev-toolchain vulnerabilities identified (9 high, 7 moderate — all in build-time packages: rollup, vite/esbuild, minimatch, flatted, picomatch, postcss, ajv, js-yaml, ws, brace-expansion); none present in the compiled desktop app; `npm audit fix` must be run with registry access to resolve

## [2.1.0] - 2026-05-25
- Added ultra boost educational content across all 7 subjects, bringing seeded question volume to 2000+
- Improved quiz variety with diversity-aware question selection across topic tags, difficulty, and question type
- Expanded quiz candidate pool sizing to reduce repeats in short and medium quiz sessions
- Added upgrade-safe tag-based backfill detection so existing installs receive new boost and ultra boost content
- Centralized user-facing version display around the 2.1.0 release metadata
- Updated release documentation, publishing instructions, and executable output guidance
- Replaced the packaging script with a release-safe workflow that validates versions, runs tests, and copies real Tauri outputs
- Reworked the GitHub sync script to mirror the publishable repository into `GIT_SYNC_GITHUB`
- Refined kid-friendly feedback surfaces for the release build

## [2.0.0] - 2025-10-18
- Added user management and profile flow upgrades across the app shell, router, and navigation
- Expanded seeded database/content support through backend and content manager updates
- Updated release metadata and desktop packaging configuration for the 2.0 line
- Refreshed README and release screenshots to document the new management and content surfaces

## [1.0.0] - 2025-10-15
- First full public release
- Robust scoring, drag-drop, and parental gate fixes
- Expanded question banks (English, times tables, general knowledge)
- Continue quiz feature
- Comprehensive documentation and licensing
