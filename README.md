# HTML to Android APK / AAB Builder

A production-grade, fully functional web application and build system that turns uploaded HTML (files, ZIP, URL, or pasted code) into genuine, signed, installable Android APK and AAB packages.

## Architecture

```
[React + Vite Frontend (10-Step Wizard)]
       ↓ POST /api/build (multipart/form-data)
[Express / Node 20 Server Engine]
       ↓ writes config.json + assets into android-template/
[Capacitor v6 Android Project + custom WebView Activity]
       ↓ Assemble DEX + Binary AXML + Resource Tables + Apksigner
[Signed APK / AAB + Complete Project ZIP]
       ↓ Real-time status polling / SSE streaming (/api/status, /api/logs)
[Download Signed APK + SHA-256 + QR Code Installation]
```

## Features

- **10-Step Wizard**:
  1. **App Info**: Package name validation (`^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$`), min/target SDK, semantic versioning.
  2. **Content Source**: Single HTML upload, ZIP with client-side JSZip inspection, Web URL, Pasted HTML, or Project folder.
  3. **Theme**: Orientation (portrait/landscape/sensor), primary color injection into Android resources, status bar theme.
  4. **Permissions**: Real mapping to Android `<uses-permission>` (Internet, Camera, Storage, Audio, Location, Notifications).
  5. **Icon & Splash Assets**: Client-side canvas resizing to 512×512, mipmap densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`), MP4 intro video upload or YouTube embed.
  6. **Splash Screen**: Configurable duration, loop/play-once behavior, skip on tap.
  7. **WebView Settings**: Real mapping to Android `WebSettings` (`javaScriptEnabled`, `domStorageEnabled`, `allowFileAccess`, `builtInZoomControls`, `cacheMode`, `mixedContentMode`, `geolocationEnabled`, `setWebContentsDebuggingEnabled`, `addJavascriptInterface`).
  8. **AdMob**: Real Google Mobile Ads dependency injection and meta-data with test ad unit toggle.
  9. **Summary**: Full audit with jump links.
  10. **Output & Signing**: APK / AAB choice, release signing with keystore, and GitHub Actions worker option.
- **Real Build Panel**:
  - Live log streaming without fake timers or mocked progress.
  - Verification of binary APK structure, SHA-256 checksum, and file size.
  - Direct APK download with `Content-Type: application/vnd.android.package-archive`.
  - Android device installation QR code.
  - "Download Android Studio Source Project (.zip)" to open directly in Android Studio or compile with `./gradlew assembleRelease`.

## Deployment & Setup

### 1. Local Development
```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

### 2. GitHub Actions Build Worker Setup (Optional / Production)
1. Fork or push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings > Secrets and variables > Actions**.
3. Add the following repository secrets:
   - `KEYSTORE_BASE64`: Base64 string of your release keystore (`cat release.jks | base64 -w 0`)
   - `KEYSTORE_PASS`: Password for keystore
   - `KEY_ALIAS`: Alias of your signing key (e.g. `myapp`)
   - `CALLBACK_URL`: Webhook URL of your deployed app (`https://your-domain.com/api/callback`)
4. In your app environment or wizard settings, configure:
   - `GH_TOKEN`: GitHub Personal Access Token with `repo` and `workflow` permissions
   - `GITHUB_REPO`: `owner/repository-name`

### 3. Vercel Deployment
```bash
# Set environment variables in Vercel project settings
vercel env add KEYSTORE_BASE64
vercel env add KEYSTORE_PASS
vercel env add KEY_ALIAS
vercel env add GH_TOKEN
vercel env add CALLBACK_URL

# Deploy to production
vercel --prod
```

## Security & Verification

- Server-side Zod validation rejects invalid package names (`com.1bad..name` returns 400).
- 50MB file size ceiling and path traversal prevention (`../`).
- Rate-limited build dispatch per IP.
- Keystores and private signing keys are never exposed to the client.
