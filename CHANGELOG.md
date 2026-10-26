# Changelog

## [2.2.0] - 2026-10-24

### Security
- **Parental gate hardened**: math challenge is now generated and validated by the Rust backend (`generate_parental_challenge` / `validate_parental_access` IPC) instead of client-side React state — the answer is no longer inspectable in the browser
- **Session token verified server-side**: `ContentManager` now calls `validateParentalFeatureAccess` on mount to confirm the stored token is genuine; stale or forged tokens are rejected and cleared from `sessionStorage`
- **XSS fix**: error fallback in `simple-main.tsx` replaced `innerHTML` string interpolation with `textContent`-based DOM construction, eliminating an injection vector when error messages contain HTML characters
- **Production logging**: all `console.log('🔍 Frontend: …')` debug traces removed from `App.tsx`, `AppShell.tsx`, `AppProvider`, and `tauri-fixed.ts`

### Features
- **JSON Content Pack import**: parents can now bulk-import questions from a `.json` file directly in Content Manager — no code changes or rebuilds required; see the in-app format guide for the schema
- **Profile picker on startup**: when multiple profiles exist, the app shows a "Who's playing?" screen instead of silently auto-selecting the first profile — siblings on a shared device now play under their own progress record
- **Configurable feedback duration**: new `feedbackDurationMs` setting (default 2 000 ms) controls how long the answer feedback panel is shown; accessible from the app settings
- **Bundled sample content pack** (`public/content/sample-content-pack.json`): 79 ready-to-import questions across Mathematics, Geography, English, Science, and General Knowledge for both KS1 and KS2
- **Keyboard navigation in quiz**: arrow keys now cycle focus between answer options in `MultipleChoiceQuestion`, improving accessibility

### Bug fixes
- **Answer comparison fixed**: `MultipleChoiceQuestion` now normalises `correct_answer` before comparison, handling both the plain-string format and the Rust `Answer::Text { Text: "…" }` enum shape — questions with the `{ Text }` wrapper were silently always marked wrong
- **Dead seeder code removed**: the `// @ts-nocheck` per-subject JS seeder methods in `contentSeeder.ts` (which contained the type inconsistency above) have been deleted; seeding is handled entirely by the Rust backend
- **Timer stale closure fixed**: `QuizInterface` timer now tracks `isQuizComplete` via a ref, eliminating a race where the interval could fire once after quiz completion and double-submit the score
- **Quiz navigation fixed**: "Continue" and "Restart" buttons after a quiz now use `dispatch(SET_CURRENT_VIEW)` instead of `window.location.reload()`, preserving state and removing the blank-screen flash
- **Serial fetch parallelised**: `contentService.getSubjectsWithContent()` replaced `for…of await` with `Promise.all`, firing all per-subject availability checks concurrently
- **Clipboard unblocked**: `Ctrl+C / V / X / A` and text selection are no longer intercepted during quizzes — only developer-tool shortcuts (`F12`, `Ctrl+Shift+I/J`, `Ctrl+U`, `Ctrl+P`) remain blocked; this restores accessibility tool compatibility
- **`window.alert` / `window.confirm` replaced**: `ContentManager` now uses an inline styled modal component instead of browser native dialogs
- **Lazy `FixedTauriAPIImpl` singleton**: the Tauri invoke function is resolved on first use rather than at module import time, preventing a startup crash when the module is imported before the Tauri WebView has initialised
- **Duplicate `theme` state removed**: `AppState.theme` root field removed; theme is read exclusively from `state.settings.theme`
- **`questions: any[]` typed**: `AppContext.currentQuiz.questions` is now `Question[]` (strongly typed)
- **Kid-friendly error messages**: generic technical error strings replaced with friendly copy and emoji
- **`offlineService.ts` dead import removed**: `import React from 'react'` removed from a plain service file

### Infrastructure
- **`.gitignore` added**: comprehensive ignore rules for `node_modules/`, `dist/`, `dist-packages/`, `src-tauri/target/`, `*.log`, databases, secrets, OS artefacts, and editor files
- **`.gitattributes` added**: LF line endings enforced for all text files; CRLF preserved for `.bat`/`.ps1`; binary files marked correctly
- **`.vscode/extensions.json` added**: recommended extensions for Rust Analyzer, Tauri, ESLint, and spell checking

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
