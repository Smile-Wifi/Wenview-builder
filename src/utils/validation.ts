import { z } from 'zod';

// Android package name regex:
// Must have at least two segments separated by dot.
// Each segment must start with a letter, followed by letters, numbers, or underscores.
// Cannot contain consecutive dots, uppercase letters, spaces, or illegal symbols.
export const PACKAGE_NAME_REGEX = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/;

export const AppConfigSchema = z.object({
  appName: z
    .string()
    .min(1, 'App name is required')
    .max(50, 'App name cannot exceed 50 characters')
    .regex(/^[^<>&"']+$/, 'App name cannot contain XML characters (<, >, &, ", \')'),

  packageName: z
    .string()
    .min(3, 'Package name is too short')
    .max(100, 'Package name is too long')
    .refine((val) => !val.includes('..'), 'Package name cannot contain consecutive dots (..)')
    .refine((val) => !/[\/\\$`'"]/.test(val), 'Package name contains illegal characters')
    .refine(
      (val) => PACKAGE_NAME_REGEX.test(val),
      'Package name must follow Android convention (e.g. com.example.myapp) with lowercase letters and numbers'
    ),

  versionCode: z
    .number()
    .int('Version code must be an integer')
    .min(1, 'Version code must be at least 1')
    .max(2100000000, 'Version code exceeds Android maximum'),

  versionName: z
    .string()
    .min(1, 'Version name is required')
    .regex(/^v?[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9.]+)?$/, 'Version name must follow semantic format (e.g. 1.0.0)'),

  minSdk: z.number().int().min(21, 'Minimum SDK must be at least 21 (Android 5.0)').max(34, 'Minimum SDK cannot exceed 34'),
  targetSdk: z.number().int().min(28, 'Target SDK must be at least 28').max(35, 'Target SDK cannot exceed 35'),
  autoIncrement: z.boolean(),

  sourceType: z.enum(['file', 'zip', 'url', 'paste', 'folder']),
  htmlContent: z.string().default(''),
  webUrl: z.string().default(''),
  zipFileName: z.string().optional(),
  filesCount: z.number().optional(),

  orientation: z.enum(['portrait', 'landscape', 'sensor']),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Primary color must be a valid hex color code'),
  navBarColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Navigation bar color must be a valid hex color code'),
  statusBarLightIcons: z.boolean(),

  permissions: z.array(z.string()),

  iconBase64: z.string().min(1, 'Application icon is required'),
  iconFileName: z.string().default('icon.png'),
  inAppLogoBase64: z.string().optional(),

  introVideoType: z.enum(['none', 'mp4', 'youtube']),
  introVideoBase64: z.string().optional(),
  introVideoFileName: z.string().optional(),
  introVideoUrl: z.string().optional(),
  introDurationSec: z.number().min(1).max(60),
  introTransition: z.enum(['fade', 'slide', 'zoom']),
  introAllowSkip: z.boolean(),

  splashEnabled: z.boolean(),
  splashBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  splashLogoPosition: z.enum(['center', 'top']),
  videoBehavior: z.enum(['play_once', 'loop', 'skip_on_tap']),
  splashDurationMs: z.number().min(500).max(10000),

  webView: z.object({
    js: z.boolean(),
    dom: z.boolean(),
    file: z.boolean(),
    zoom: z.boolean(),
    cache: z.boolean(),
    mixed: z.boolean(),
    geo: z.boolean(),
    debug: z.boolean(),
    bridge: z.boolean(),
    hardwareBackNav: z.boolean().default(true),
    inAppBackButton: z.boolean().default(true),
  }),

  ads: z.object({
    enabled: z.boolean(),
    appId: z.string().default(''),
    bannerUnitId: z.string().default(''),
    interstitialUnitId: z.string().default(''),
    testMode: z.boolean().default(true),
  }),

  outputFormat: z.enum(['apk', 'aab', 'both']),
  keystoreType: z.enum(['default', 'upload', 'generate']),
  keystoreBase64: z.string().optional(),
  keystorePass: z.string().optional(),
  keyAlias: z.string().optional(),
  keyPass: z.string().optional(),

  buildWorkerMode: z.enum(['direct', 'github_actions']).default('direct'),
  githubRepo: z.string().optional(),
  githubToken: z.string().optional(),
}).superRefine((data, ctx) => {
  // Guarantee INTERNET permission is always present for WebView
  if (!data.permissions.includes('android.permission.INTERNET')) {
    data.permissions.unshift('android.permission.INTERNET');
  }

  // Validate webUrl when sourceType is 'url'
  if (data.sourceType === 'url') {
    if (!data.webUrl || !data.webUrl.startsWith('https://')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['webUrl'],
        message: 'A secure HTTPS URL is required when choosing Web URL source',
      });
    }
  }

  // Validate HTML content when sourceType is 'paste' or 'file'
  if (data.sourceType === 'paste' || data.sourceType === 'file') {
    if (!data.htmlContent || data.htmlContent.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['htmlContent'],
        message: 'HTML content cannot be empty',
      });
    }
  }

  // Validate AdMob configuration when enabled
  if (data.ads.enabled) {
    if (!data.ads.appId && !data.ads.testMode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ads', 'appId'],
        message: 'AdMob App ID is required when ads are enabled (or turn on Test Mode)',
      });
    }
  }
});

export const AVAILABLE_PERMISSIONS = [
  {
    id: 'android.permission.INTERNET',
    name: 'Internet Access',
    description: 'Allows the WebView to load web pages, remote fonts, and API requests.',
    category: 'core' as const,
    recommended: true,
    required: true,
  },
  {
    id: 'android.permission.ACCESS_NETWORK_STATE',
    name: 'Network State',
    description: 'Allows checking connectivity status (online/offline).',
    category: 'core' as const,
    recommended: true,
  },
  {
    id: 'android.permission.CAMERA',
    name: 'Camera',
    description: 'Required if the web app accesses navigator.mediaDevices.getUserMedia() for camera.',
    category: 'hardware' as const,
  },
  {
    id: 'android.permission.RECORD_AUDIO',
    name: 'Record Audio / Microphone',
    description: 'Allows microphone access for speech recognition or audio capture.',
    category: 'hardware' as const,
  },
  {
    id: 'android.permission.ACCESS_FINE_LOCATION',
    name: 'Precise Location (GPS)',
    description: 'Allows navigator.geolocation to read high-accuracy GPS coordinates.',
    category: 'location' as const,
  },
  {
    id: 'android.permission.ACCESS_COARSE_LOCATION',
    name: 'Approximate Location',
    description: 'Allows reading approximate cell/wifi location.',
    category: 'location' as const,
  },
  {
    id: 'android.permission.READ_EXTERNAL_STORAGE',
    name: 'Read Storage',
    description: 'Allows accessing files on external storage (Android 12 and below).',
    category: 'storage' as const,
  },
  {
    id: 'android.permission.WRITE_EXTERNAL_STORAGE',
    name: 'Write Storage',
    description: 'Allows downloading and saving files to storage.',
    category: 'storage' as const,
  },
  {
    id: 'android.permission.POST_NOTIFICATIONS',
    name: 'Post Notifications',
    description: 'Required on Android 13+ (API 33) to push notifications to user.',
    category: 'core' as const,
  },
  {
    id: 'android.permission.VIBRATE',
    name: 'Vibrate',
    description: 'Allows using window.navigator.vibrate() for haptic feedback.',
    category: 'hardware' as const,
  },
  {
    id: 'android.permission.WAKE_LOCK',
    name: 'Wake Lock',
    description: 'Prevents screen from sleeping during video playback or long tasks.',
    category: 'core' as const,
  },
];
