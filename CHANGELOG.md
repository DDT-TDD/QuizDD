# Changelog

## [2.1.0] - 2026-05-25
- Added ultra boost educational content across all 7 subjects, bringing seeded question volume to 2000+
- Improved quiz variety with diversity-aware question selection across topic tags, difficulty, and question type
- Expanded quiz candidate pool sizing to reduce repeats in short and medium quiz sessions
- Added upgrade-safe tag-based backfill detection so existing installs receive new boost and ultra boost content
- Centralized user-facing version display around the 2.1.0 release metadata
- Updated release documentation, publishing instructions, and executable output guidance
- Replaced the packaging script with a release-safe workflow that validates versions, runs tests, and copies real Tauri outputs
- Reworked the GitHub sync script to mirror the publishable repository into `GIT_SYNC_SOURCE`
- Refined kid-friendly feedback surfaces for the release build

## [1.0.0] - 2025-10-15
- First full public release
- Robust scoring, drag-drop, and parental gate fixes
- Expanded question banks (English, times tables, general knowledge)
- Continue quiz feature
- Comprehensive documentation and licensing
