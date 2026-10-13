import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const templateDir = path.resolve(rootDir, 'android-template');

export interface BuildConfigPayload {
  appName: string;
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdk: number;
  targetSdk: number;
  orientation: 'portrait' | 'landscape' | 'sensor';
  primaryColor: string;
  navBarColor: string;
  permissions: string[];
  sourceType: string;
  htmlContent?: string;
  webUrl?: string;
  iconBase64?: string;
  introVideoBase64?: string;
  introVideoType?: string;
  introDurationSec?: number;
  splashEnabled?: boolean;
  splashDurationMs?: number;
  webView?: {
    js: boolean;
    dom: boolean;
    file: boolean;
    zoom: boolean;
    cache: boolean;
    mixed: boolean;
    geo: boolean;
    debug: boolean;
    bridge: boolean;
  };
  ads?: {
    enabled: boolean;
    appId: string;
    bannerUnitId: string;
  };
  [key: string]: any;
}

export function prepareAndroidTemplate(config: BuildConfigPayload, targetDir: string = templateDir) {
  console.log(`[prepare-template] Preparing Android project for ${config.packageName} (${config.appName})...`);

  const appSrcDir = path.join(targetDir, 'app', 'src', 'main');
  const assetsDir = path.join(appSrcDir, 'assets');
  const wwwDir = path.join(assetsDir, 'www');
  const resDir = path.join(appSrcDir, 'res');
  const rawDir = path.join(resDir, 'raw');

  // Ensure directories exist
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.mkdirSync(wwwDir, { recursive: true });
  fs.mkdirSync(resDir, { recursive: true });
  fs.mkdirSync(rawDir, { recursive: true });

  // 1. Write config.json into assets
  fs.writeFileSync(path.join(assetsDir, 'config.json'), JSON.stringify(config, null, 2), 'utf-8');

  // 2. Write HTML assets into www
  if (config.sourceType !== 'url') {
    const html = config.htmlContent || '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + config.appName + '</title></head><body><h1>' + config.appName + '</h1></body></html>';
    fs.writeFileSync(path.join(wwwDir, 'index.html'), html, 'utf-8');
  }

  // 3. Write intro video if provided
  if (config.introVideoBase64 && config.introVideoType === 'mp4') {
    try {
      const cleanBase64 = config.introVideoBase64.replace(/^data:video\/[a-z0-9]+;base64,/, '');
      const videoBuffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(path.join(rawDir, 'intro.mp4'), videoBuffer);
      console.log(`[prepare-template] Injected intro.mp4 (${videoBuffer.length} bytes)`);
    } catch (e) {
      console.error('[prepare-template] Failed to write intro video:', e);
    }
  }

  // 4. Update colors.xml
  const colorsXmlPath = path.join(resDir, 'values', 'colors.xml');
  const primaryColor = config.primaryColor || '#2563EB';
  const navBarColor = config.navBarColor || '#0F172A';
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary_color">${primaryColor}</color>
    <color name="primary_dark">${primaryColor}</color>
    <color name="accent_color">${primaryColor}</color>
    <color name="window_background">#FFFFFF</color>
    <color name="navigation_bar">${navBarColor}</color>
</resources>`;
  fs.writeFileSync(colorsXmlPath, colorsXml, 'utf-8');

  // 5. Update strings.xml
  const stringsXmlPath = path.join(resDir, 'values', 'strings.xml');
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${escapeXml(config.appName)}</string>
    <string name="title_activity_main">${escapeXml(config.appName)}</string>
    <string name="package_name">${config.packageName}</string>
</resources>`;
  fs.writeFileSync(stringsXmlPath, stringsXml, 'utf-8');

  // 6. Update AndroidManifest.xml
  const manifestPath = path.join(appSrcDir, 'AndroidManifest.xml');
  let manifest = fs.readFileSync(manifestPath, 'utf-8');

  // Replace package attribute
  manifest = manifest.replace(/package="[^"]*"/, `package="${config.packageName}"`);

  // Build permissions XML (INTERNET is strictly guaranteed)
  const effectivePermissions = Array.from(
    new Set(['android.permission.INTERNET', ...(config.permissions || ['android.permission.ACCESS_NETWORK_STATE'])])
  );
  const permLines = effectivePermissions
    .map(p => `    <uses-permission android:name="${p}" />`)
    .join('\n');

  manifest = manifest.replace(
    /<!-- Permissions will be generated dynamically -->[\s\S]*?<application/,
    `<!-- Permissions will be generated dynamically -->\n${permLines}\n\n    <application`
  );

  // Screen orientation
  const orientationAttr = config.orientation === 'portrait'
    ? 'android:screenOrientation="portrait"'
    : config.orientation === 'landscape'
      ? 'android:screenOrientation="landscape"'
      : 'android:screenOrientation="unspecified"';

  manifest = manifest.replace(/android:screenOrientation="[^"]*"/, orientationAttr);

  // AdMob Application ID meta-data
  if (config.ads?.enabled && config.ads.appId) {
    const admobMeta = `\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${config.ads.appId}" />`;
    if (!manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
      manifest = manifest.replace('</application>', `${admobMeta}\n    </application>`);
    }
  }

  fs.writeFileSync(manifestPath, manifest, 'utf-8');

  // 7. Update app/build.gradle
  const buildGradlePath = path.join(targetDir, 'app', 'build.gradle');
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf-8');

  buildGradle = buildGradle.replace(/namespace "[^"]*"/, `namespace "${config.packageName}"`);
  buildGradle = buildGradle.replace(/applicationId "[^"]*"/, `applicationId "${config.packageName}"`);
  buildGradle = buildGradle.replace(/minSdk \d+/, `minSdk ${config.minSdk || 24}`);
  buildGradle = buildGradle.replace(/targetSdk \d+/, `targetSdk ${config.targetSdk || 34}`);
  buildGradle = buildGradle.replace(/versionCode \d+/, `versionCode ${config.versionCode || 1}`);
  buildGradle = buildGradle.replace(/versionName "[^"]*"/, `versionName "${config.versionName || '1.0.0'}"`);

  if (config.ads?.enabled) {
    const admobDep = `implementation 'com.google.android.gms:play-services-ads:23.0.0'`;
    if (!buildGradle.includes('play-services-ads')) {
      buildGradle = buildGradle.replace('dependencies {', `dependencies {\n    ${admobDep}`);
    }
  }

  fs.writeFileSync(buildGradlePath, buildGradle, 'utf-8');

  // 8. Write Icon to mipmap folders if provided
  if (config.iconBase64) {
    try {
      const cleanIcon = config.iconBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const iconBuffer = Buffer.from(cleanIcon, 'base64');
      const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
      densities.forEach(d => {
        const mipmapDir = path.join(resDir, `mipmap-${d}`);
        fs.mkdirSync(mipmapDir, { recursive: true });
        fs.writeFileSync(path.join(mipmapDir, 'ic_launcher.png'), iconBuffer);
        fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_round.png'), iconBuffer);
      });
      console.log(`[prepare-template] Injected icon across all mipmap densities`);
    } catch (e) {
      console.error('[prepare-template] Failed to write mipmap icons:', e);
    }
  }

  console.log(`[prepare-template] Successfully prepared Android template!`);
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Standalone execution if run via CLI
if (process.argv[1] && process.argv[1].endsWith('prepare-template.ts')) {
  let configPath = '';
  process.argv.forEach(arg => {
    if (arg.startsWith('--config=')) {
      configPath = arg.substring(9);
    }
  });

  if (configPath) {
    try {
      let configData: BuildConfigPayload;
      if (configPath.startsWith('{')) {
        configData = JSON.parse(configPath);
      } else {
        configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      prepareAndroidTemplate(configData);
    } catch (err) {
      console.error('[prepare-template] Error reading config:', err);
      process.exit(1);
    }
  }
}
