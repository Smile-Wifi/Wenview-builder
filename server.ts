import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';
import { AppConfigSchema } from './src/utils/validation.ts';
import { generateSignedApk } from './src/utils/apkGenerator.ts';
import { prepareAndroidTemplate } from './scripts/prepare-template.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Robots.txt disallow /api/* per security specifications
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /api/\n');
});

// Configure Multer storage in memory / temporary upload
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB hard limit per spec
  },
  storage: multer.memoryStorage(),
});

interface StoredBuild {
  buildId: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  progress: number;
  logs: string[];
  apkBuffer?: Buffer;
  projectZipBuffer?: Buffer;
  downloadUrl?: string;
  projectZipUrl?: string;
  sha256?: string;
  sizeBytes?: number;
  error?: string | null;
  config: any;
  timestamp: number;
  ip: string;
}

// In-memory job registry + persistent directory fallback
const buildsStore = new Map<string, StoredBuild>();
const rateLimitMap = new Map<string, number[]>();

// Rate limiting: 10 builds per hour per IP
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const requests = rateLimitMap.get(ip) || [];
  const validRequests = requests.filter(t => now - t < windowMs);
  if (validRequests.length >= 10) {
    return false;
  }
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

// -------------------------------------------------------------
// POST /api/validate: Validate configuration before building
// -------------------------------------------------------------
app.post('/api/validate', (req: Request, res: Response) => {
  const parseResult = AppConfigSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      valid: false,
      errors: parseResult.error.issues.map((err: any) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }
  return res.json({ valid: true });
});

// -------------------------------------------------------------
// POST /api/build: Validate inputs and trigger APK build
// -------------------------------------------------------------
app.post(
  '/api/build',
  upload.fields([
    { name: 'config', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'zipFile', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Rate limit exceeded: Maximum 10 builds per hour per IP. Please wait before triggering another build.',
      });
    }

    let payload: any;
    try {
      if (req.body.configJson) {
        payload = JSON.parse(req.body.configJson);
      } else if (req.body.appName) {
        payload = req.body;
      } else {
        payload = req.body;
      }
    } catch (e: any) {
      return res.status(400).json({ error: 'Malformed JSON payload: ' + e.message });
    }

    // Server-side Zod validation
    const validation = AppConfigSchema.safeParse(payload);
    if (!validation.success) {
      const errorDetails = validation.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(400).json({
        error: `Validation failed: ${errorDetails}`,
        issues: validation.error.issues,
      });
    }

    const config = validation.data;
    const buildId = 'build_' + crypto.randomBytes(8).toString('hex');
    const logs: string[] = [
      `[${new Date().toISOString()}] Job initialized with ID ${buildId}`,
      `[${new Date().toISOString()}] Target application: ${config.appName} (${config.packageName})`,
      `[${new Date().toISOString()}] Version: ${config.versionName} (code: ${config.versionCode}), Min SDK: ${config.minSdk}, Target SDK: ${config.targetSdk}`,
      `[${new Date().toISOString()}] Verifying manifest permissions (${config.permissions.length} declared)...`,
    ];

    const newBuild: StoredBuild = {
      buildId,
      status: 'queued',
      progress: 5,
      logs,
      config,
      timestamp: Date.now(),
      ip: clientIp,
    };
    buildsStore.set(buildId, newBuild);

    // If GitHub Actions workflow dispatch is selected and token provided
    const ghToken = config.githubToken || process.env.GH_TOKEN;
    const ghRepo = config.githubRepo || process.env.GITHUB_REPO;

    if (config.buildWorkerMode === 'github_actions' && ghToken && ghRepo) {
      try {
        logs.push(`[${new Date().toISOString()}] Dispatching build worker to GitHub Actions (${ghRepo})...`);
        const [owner, repo] = ghRepo.split('/');
        const dispatchRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/actions/workflows/build-apk.yml/dispatches`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `Bearer ${ghToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'HTML-To-APK-Builder',
            },
            body: JSON.stringify({
              ref: 'main',
              inputs: {
                jobId: buildId,
                configUrl: JSON.stringify({
                  appName: config.appName,
                  packageName: config.packageName,
                  versionCode: config.versionCode,
                  versionName: config.versionName,
                  minSdk: config.minSdk,
                  targetSdk: config.targetSdk,
                  orientation: config.orientation,
                  primaryColor: config.primaryColor,
                  navBarColor: config.navBarColor,
                  permissions: config.permissions,
                  sourceType: config.sourceType,
                  webUrl: config.webUrl,
                  webView: config.webView,
                  ads: config.ads,
                }),
              },
            }),
          }
        );

        if (!dispatchRes.ok) {
          const errText = await dispatchRes.text();
          throw new Error(`GitHub dispatch failed (${dispatchRes.status}): ${errText}`);
        }

        newBuild.status = 'running';
        newBuild.progress = 25;
        logs.push(`[${new Date().toISOString()}] GitHub Actions workflow triggered successfully.`);

        return res.json({
          buildId,
          status: 'running',
          provider: 'github',
          message: 'Workflow dispatched to GitHub Actions worker',
        });
      } catch (err: any) {
        logs.push(`[${new Date().toISOString()}] GitHub dispatch error: ${err.message}. Falling back to container build engine.`);
        // Fallback to local build engine below
      }
    }

    // Direct production build engine execution
    processBuildDirectly(buildId, config);

    return res.json({
      buildId,
      status: 'queued',
      provider: 'local',
      message: 'Build initialized in build engine',
    });
  }
);

// -------------------------------------------------------------
// Direct build processor: packages real signed APK & project ZIP
// -------------------------------------------------------------
async function processBuildDirectly(buildId: string, config: any) {
  const build = buildsStore.get(buildId);
  if (!build) return;

  build.status = 'running';
  build.progress = 15;

  try {
    build.logs.push(`[${new Date().toISOString()}] Compiling AndroidManifest.xml into binary AXML specification...`);
    build.progress = 30;

    // Compile DEX and resources
    build.logs.push(`[${new Date().toISOString()}] Assembling Dalvik Executable (classes.dex) with MainActivity and WebSettings interfaces...`);
    build.progress = 50;

    if (config.webView) {
      build.logs.push(
        `[${new Date().toISOString()}] Injected WebSettings: js=${config.webView.js}, domStorage=${config.webView.dom}, fileAccess=${config.webView.file}, zoomSupport=${config.webView.zoom}, debug=${config.webView.debug}`
      );
    }

    if (config.splashEnabled) {
      build.logs.push(
        `[${new Date().toISOString()}] Splash screen configured: duration=${config.splashDurationMs}ms, videoBehavior=${config.videoBehavior}`
      );
    }

    build.logs.push(`[${new Date().toISOString()}] Packaging www web assets into assets/www/...`);
    build.progress = 70;

    // Generate real signed APK
    const { apkBuffer, sha256, sizeBytes } = await generateSignedApk(config);
    build.apkBuffer = apkBuffer;
    build.sha256 = sha256;
    build.sizeBytes = sizeBytes;
    build.downloadUrl = `/api/download/${buildId}`;

    build.logs.push(`[${new Date().toISOString()}] Generating release JAR & APK v1 RSA signatures (META-INF/MANIFEST.MF, CERT.SF, CERT.RSA)...`);
    build.logs.push(`[${new Date().toISOString()}] Running zipalign 4-byte boundary alignment on output archive...`);
    build.logs.push(`[${new Date().toISOString()}] Computed APK SHA-256: ${sha256}`);
    build.logs.push(`[${new Date().toISOString()}] Final signed APK archive generated: ${sizeBytes} bytes`);

    // Also generate complete ready-to-run Android Studio project zip
    build.logs.push(`[${new Date().toISOString()}] Bundling full Capacitor v6 Android Studio project with source code...`);
    const projectZipBuffer = await bundleCompleteAndroidProject(config);
    build.projectZipBuffer = projectZipBuffer;
    build.projectZipUrl = `/api/export-project/${buildId}`;

    build.status = 'success';
    build.progress = 100;
    build.logs.push(`[${new Date().toISOString()}] Build completed successfully! Signed package ready for installation.`);
  } catch (err: any) {
    console.error(`Build ${buildId} failed:`, err);
    build.status = 'failed';
    build.error = err.message || 'Build failed during assembly';
    build.logs.push(`[${new Date().toISOString()}] Build error: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Bundle complete Android Studio source project into a ZIP
// -------------------------------------------------------------
async function bundleCompleteAndroidProject(config: any): Promise<Buffer> {
  const zip = new JSZip();
  const root = zip.folder('android-project')!;

  // Read template directory recursively
  const templateDir = path.resolve(__dirname, 'android-template');
  function addDirToZip(currentDir: string, zipFolder: JSZip) {
    if (!fs.existsSync(currentDir)) return;
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(item)!;
        addDirToZip(fullPath, subFolder);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(item, content);
      }
    }
  }

  addDirToZip(templateDir, root);

  // Inject user www files and config
  const assetsFolder = root.folder('app/src/main/assets')!;
  assetsFolder.file('config.json', JSON.stringify(config, null, 2));

  const wwwFolder = assetsFolder.folder('www')!;
  const html = config.htmlContent || '<!DOCTYPE html><html><body><h1>' + config.appName + '</h1></body></html>';
  wwwFolder.file('index.html', html);

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  return Buffer.from(buffer);
}

// -------------------------------------------------------------
// GET /api/status: Check build status
// -------------------------------------------------------------
app.get('/api/status', (req: Request, res: Response) => {
  const buildId = req.query.buildId as string;
  if (!buildId) {
    return res.status(400).json({ error: 'Missing buildId query parameter' });
  }

  const build = buildsStore.get(buildId);
  if (!build) {
    return res.status(404).json({ error: 'Build not found' });
  }

  return res.json({
    buildId: build.buildId,
    status: build.status,
    progress: build.progress,
    logs: build.logs,
    downloadUrl: build.downloadUrl,
    projectZipUrl: build.projectZipUrl,
    sha256: build.sha256,
    sizeBytes: build.sizeBytes,
    error: build.error,
    timestamp: build.timestamp,
    metadata: {
      appName: build.config.appName,
      packageName: build.config.packageName,
      versionName: build.config.versionName,
      versionCode: build.config.versionCode,
      format: build.config.outputFormat || 'apk',
    },
  });
});

// -------------------------------------------------------------
// GET /api/logs: SSE endpoint for real-time log streaming
// -------------------------------------------------------------
app.get('/api/logs', (req: Request, res: Response) => {
  const buildId = req.query.buildId as string;
  if (!buildId) {
    return res.status(400).send('Missing buildId parameter');
  }

  const build = buildsStore.get(buildId);
  if (!build) {
    return res.status(404).send('Build not found');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current logs
  for (const log of build.logs) {
    res.write(`data: ${JSON.stringify({ log, progress: build.progress, status: build.status })}\n\n`);
  }

  if (build.status === 'success' || build.status === 'failed') {
    res.write(`data: ${JSON.stringify({ finished: true, status: build.status })}\n\n`);
    res.end();
  }
});

// -------------------------------------------------------------
// POST /api/callback: Remote webhook callback from GitHub Actions
// -------------------------------------------------------------
app.post('/api/callback', (req: Request, res: Response) => {
  const { jobId, status, downloadUrl, sha256, sizeBytes, error } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'Missing jobId in callback body' });
  }

  const build = buildsStore.get(jobId);
  if (build) {
    build.status = status === 'success' ? 'success' : 'failed';
    build.progress = status === 'success' ? 100 : build.progress;
    if (downloadUrl) build.downloadUrl = downloadUrl;
    if (sha256) build.sha256 = sha256;
    if (sizeBytes) build.sizeBytes = Number(sizeBytes);
    if (error) build.error = error;
    build.logs.push(`[${new Date().toISOString()}] Remote build worker callback: status=${status}`);
  }

  return res.json({ received: true });
});

// -------------------------------------------------------------
// GET /api/download/:buildId: Download real signed APK
// -------------------------------------------------------------
app.get('/api/download/:buildId', (req: Request, res: Response) => {
  const buildId = req.params.buildId;
  const build = buildsStore.get(buildId);

  if (!build || !build.apkBuffer) {
    return res.status(404).send('APK file not found for this build');
  }

  const sanitizedAppName = (build.config.appName || 'app')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `${sanitizedAppName}-release.apk`;

  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', build.apkBuffer.length);
  res.setHeader('X-Checksum-SHA256', build.sha256 || '');

  return res.end(build.apkBuffer);
});

// -------------------------------------------------------------
// GET /api/export-project/:buildId: Download full Android project ZIP
// -------------------------------------------------------------
app.get('/api/export-project/:buildId', (req: Request, res: Response) => {
  const buildId = req.params.buildId;
  const build = buildsStore.get(buildId);

  if (!build || !build.projectZipBuffer) {
    return res.status(404).send('Project archive not found');
  }

  const sanitizedAppName = (build.config.appName || 'app')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `${sanitizedAppName}-android-source.zip`;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', build.projectZipBuffer.length);

  return res.end(build.projectZipBuffer);
});

// -------------------------------------------------------------
// Start server with Vite middleware in development
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[HTML-To-APK Builder] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
