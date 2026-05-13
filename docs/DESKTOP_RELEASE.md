# POMR Coach Desktop Release

POMR Coach can be packaged as a local desktop app with Electron. The desktop app starts a private Next.js server on `127.0.0.1` and opens it inside an Electron window, so users do not need to install Node.js or run terminal commands.

## User Experience Goal

For non-developer users, distribute platform-specific files through GitHub Releases:

- macOS: `.dmg`
- Windows: `.exe` installer
- Linux: `.AppImage` or `.deb`

The app stores its SQLite database in the OS user data folder, not in the downloaded project folder.

## Local Build

```bash
npm install
npm run desktop:pack
```

The unpacked desktop app is created under `release/`.

To create distributable installers:

```bash
npm run desktop:dist
```

## GitHub Release Build

The workflow at `.github/workflows/desktop-release.yml` can be run manually or by pushing a tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow uploads desktop artifacts for macOS, Windows, and Linux. For the first MVP release, these artifacts are unsigned.

## Signing And Notarization

Unsigned desktop builds are expected to show OS trust warnings:

- macOS may require right-click > Open, or Gatekeeper approval.
- Windows may show SmartScreen warnings.

To remove those warnings later, configure:

- Apple Developer ID certificate and notarization credentials for macOS.
- Windows code-signing certificate for Windows installers.

## Current Limitations

- Desktop packaging is intentionally a thin wrapper around the existing local-first web app.
- PDF export may fall back to a printable HTML view if Playwright Chromium is unavailable in a packaged environment.
- Auto-update is not enabled yet.
- The app is single-user and local-only.
