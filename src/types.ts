export type SourceType = 'file' | 'zip' | 'url' | 'paste' | 'folder';

export type Orientation = 'portrait' | 'landscape' | 'sensor';

export type VideoType = 'none' | 'mp4' | 'youtube';

export type TransitionType = 'fade' | 'slide' | 'zoom';

export type VideoBehavior = 'play_once' | 'loop' | 'skip_on_tap';

export type OutputFormat = 'apk' | 'aab' | 'both';

export type KeystoreType = 'default' | 'upload' | 'generate';

export interface AppConfig {
  // Step 1: App Info
  appName: string;
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdk: number;
  targetSdk: number;
  autoIncrement: boolean;

  // Step 2: Content Source
  sourceType: SourceType;
  htmlContent: string;
  webUrl: string;
  zipFileName?: string;
  filesCount?: number;

  // Step 3: Theme
  orientation: Orientation;
  primaryColor: string;
  navBarColor: string;
  statusBarLightIcons: boolean;

  // Step 4: Permissions
  permissions: string[];

  // Step 5: Icon & Splash Assets
  iconBase64: string; // 512x512 PNG data URL or base64
  iconFileName: string;
  inAppLogoBase64?: string;
  introVideoType: VideoType;
  introVideoBase64?: string;
  introVideoFileName?: string;
  introVideoUrl?: string;
  introDurationSec: number;
  introTransition: TransitionType;
  introAllowSkip: boolean;

  // Step 6: Splash Screen
  splashEnabled: boolean;
  splashBackgroundColor: string;
  splashLogoPosition: 'center' | 'top';
  videoBehavior: VideoBehavior;
  splashDurationMs: number;

  // Step 7: WebView Settings
  webView: {
    js: boolean;
    dom: boolean;
    file: boolean;
    zoom: boolean;
    cache: boolean;
    mixed: boolean;
    geo: boolean;
    debug: boolean;
    bridge: boolean;
    hardwareBackNav: boolean;
    inAppBackButton: boolean;
  };

  // Step 8: AdMob Ads
  ads: {
    enabled: boolean;
    appId: string;
    bannerUnitId: string;
    interstitialUnitId: string;
    testMode: boolean;
  };

  // Step 10: Output & Signing
  outputFormat: OutputFormat;
  keystoreType: KeystoreType;
  keystoreBase64?: string;
  keystorePass?: string;
  keyAlias?: string;
  keyPass?: string;

  // Remote / Worker configuration
  buildWorkerMode: 'direct' | 'github_actions';
  githubRepo?: string;
  githubToken?: string;
}

export type BuildStatusType = 'idle' | 'queued' | 'running' | 'success' | 'failed';

export interface BuildResponse {
  buildId: string;
  status: BuildStatusType;
  provider: 'local' | 'github';
  message?: string;
}

export interface BuildStatusResult {
  buildId: string;
  status: BuildStatusType;
  progress: number;
  logs: string[];
  downloadUrl?: string;
  aabDownloadUrl?: string;
  projectZipUrl?: string;
  sha256?: string;
  sizeBytes?: number;
  error?: string | null;
  timestamp: number;
  provider?: string;
  metadata?: {
    appName: string;
    packageName: string;
    versionName: string;
    versionCode: number;
    format: string;
  };
}

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'hardware' | 'storage' | 'location' | 'media';
  recommended?: boolean;
  required?: boolean;
}
