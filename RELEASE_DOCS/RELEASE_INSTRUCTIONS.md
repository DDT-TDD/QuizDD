# Release Instructions (QUIZDD)

This file guides you through preparing and publishing the 2.1.0 release on GitHub.

Prerequisites
- git configured with your GitHub account
- PowerShell (Windows)
- Node.js, npm, Rust, and Tauri CLI installed locally

1) Verify version
- Ensure these files all contain `2.1.0`:
- `version.json`
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

2) Run tests & type checks

```powershell
Push-Location c:\Users\DD\Desktop\QZ
npm install
npm run test:run
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
Pop-Location
```

3) Build the Windows desktop release

```powershell
Push-Location c:\Users\DD\Desktop\QZ
cargo tauri build
Pop-Location
```

Executable output locations:
- Portable executable: `src-tauri/target/release/QuizDD.exe`
- Installer bundles: `src-tauri/target/release/bundle/`

4) Refresh the GitHub source mirror

```powershell
Push-Location c:\Users\DD\Desktop\QZ
node scripts/sync-to-git-source.js
Pop-Location
```

5) Produce the source ZIP (optional, runs locally)

```powershell
Push-Location c:\Users\DD\Desktop\QZ
powershell -ExecutionPolicy Bypass -File scripts\build_release.ps1 -Version 2.1.0
Pop-Location
# This creates quizdd-2.1.0-source.zip in the repo root from GIT_SYNC_GITHUB
```

6) Create git tag and push

```bash
git add -A
git commit -m "Release v2.1.0"
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin main --follow-tags
```

7) Create a GitHub Release
- Go to your repository on GitHub, click "Releases" → "Draft a new release"
- Choose tag `v2.1.0` (or create it in the UI)
- Title: "v2.1.0"
- Description: paste `RELEASE_DOCS/CHANGELOG.md` content for v2.1.0
- Attach the generated `quizdd-2.1.0-source.zip` if you want a source archive
- Attach the Windows executable and installer assets from `src-tauri/target/release/` and `src-tauri/target/release/bundle/` as needed
- If publishing source only, publish the contents of `GIT_SYNC_GITHUB` to GitHub
- Click "Publish release"

8) Checklist & recommended excludes
- Keep: `src/`, `src-tauri/`, `public/`, `package.json`, `Cargo.toml`, `README.md`, `CHANGELOG.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md`, `RELEASE_DOCS/`
- Exclude generated or local-only folders from GitHub publishing: `node_modules/`, `dist/`, `dist-packages/`, `src-tauri/target/`, `QZbak/`
- `GIT_SYNC_GITHUB/` is the cleaned publishable mirror created by the sync script

9) Post-release
- Monitor issues and patch as needed. Create hotfix releases as usual.