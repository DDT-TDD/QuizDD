# Changelog

## [2.1.0] - 2026-05-25
- Added ultra boost educational content across all 7 subjects, increasing seeded content to 2000+ questions
- Improved quiz variety with diversity-aware selection balancing topic tags, difficulty, and question type
- Expanded runtime candidate pools to lower question repetition in active quiz sessions
- Added tag-based upgrade backfill logic so existing installs receive new boost and ultra boost content
- Centralized version handling for the live UI and update fallback paths
- Refreshed README and release instructions for the current 2.1.0 desktop release
- Replaced the packaging script with a build flow that validates version alignment and copies real Tauri outputs
- Reworked repository mirroring so `GIT_SYNC_SOURCE` is ready to publish to GitHub
- Confirmed the Windows executable location at `src-tauri/target/release/QuizDD.exe`

## [1.0.0] - 2025-10-15
- First full public release
- Robust scoring, drag-drop, and parental gate fixes
- Expanded question banks (English, times tables, general knowledge)
- Continue quiz feature
- Comprehensive documentation and licensing
