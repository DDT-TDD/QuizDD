# Changelog

## [2.1.0] - 2026-05-25
- Added ultra boost educational content across all 7 subjects, increasing seeded content to 2000+ questions
- Improved quiz variety with diversity-aware selection balancing topic tags, difficulty, and question type
- Expanded runtime candidate pools to lower question repetition in active quiz sessions
- Added tag-based upgrade backfill logic so existing installs receive new boost and ultra boost content
- Centralized version handling for the live UI and update fallback paths
- Refreshed README and release instructions for the current 2.1.0 desktop release
- Replaced the packaging script with a build flow that validates version alignment and copies real Tauri outputs
- Reworked repository mirroring so `GIT_SYNC_GITHUB` is ready to publish to GitHub
- Confirmed the Windows executable location at `src-tauri/target/release/QuizDD.exe`

## [2.0.0] - 2025-10-18
- Added user management and profile flow upgrades across app shell, routing, and navigation
- Expanded seeded database/content support through backend seeding and content manager updates
- Updated app/package version metadata and desktop build configuration for the 2.0 release
- Refreshed release screenshots and README coverage for the new user/content management features

## [1.0.0] - 2025-10-15
- First full public release
- Robust scoring, drag-drop, and parental gate fixes
- Expanded question banks (English, times tables, general knowledge)
- Continue quiz feature
- Comprehensive documentation and licensing
