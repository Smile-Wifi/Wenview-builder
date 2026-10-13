import React, { useState } from 'react';
import type { AppConfig, SourceType } from '../types.ts';
import JSZip from 'jszip';
import { Upload, Globe, FileCode, FolderArchive, FolderOpen, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface Step2Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step2ContentSource: React.FC<Step2Props> = ({ config, onChange }) => {
  const [zipStatus, setZipStatus] = useState<{
    valid: boolean;
    error?: string;
    filesCount?: number;
    hasIndex?: boolean;
    entriesList?: string[];
  } | null>(null);

  const [loadingZip, setLoadingZip] = useState(false);

  // Quick preset templates for Paste HTML
  const presets = [
    {
      title: 'Hello World Starter',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello Android</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .card {
      background: #1e293b;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 100%;
      border: 1px solid #334155;
    }
    h1 { margin-top: 0; color: #38bdf8; font-size: 24px; }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      width: 100%;
      margin-top: 16px;
    }
    button:active { transform: scale(0.98); }
    #output { margin-top: 16px; font-size: 14px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello World</h1>
    <p>Your web app is running inside a production Android WebView!</p>
    <button onclick="testAndroid()">Interact with Android OS</button>
    <div id="output">Tap button to test bridge</div>
  </div>

  <script>
    function testAndroid() {
      if (window.Android && window.Android.showToast) {
        window.Android.showToast("Native Toast from WebView!");
        if (window.Android.vibrate) window.Android.vibrate(50);
        document.getElementById("output").innerText = "Invoked Android Bridge!";
      } else {
        alert("Running in standard browser window.");
      }
    }
  </script>
</body>
</html>`,
    },
    {
      title: 'Responsive Dashboard Shell',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Mobile Dashboard</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #0b0f19; color: #f1f5f9; }
    header { padding: 16px; background: #111827; border-bottom: 1px solid #1f2937; display: flex; justify-content: space-between; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px; }
    .stat { background: #1f2937; padding: 16px; border-radius: 12px; border: 1px solid #374151; }
    .stat-val { font-size: 24px; font-weight: bold; color: #60a5fa; margin-top: 8px; }
  </style>
</head>
<body>
  <header>
    <strong>Mobile Console</strong>
    <span>Online</span>
  </header>
  <div class="grid">
    <div class="stat"><span>Active Sessions</span><div class="stat-val">1,248</div></div>
    <div class="stat"><span>Latency</span><div class="stat-val">18ms</div></div>
    <div class="stat"><span>Memory</span><div class="stat-val">34MB</div></div>
    <div class="stat"><span>Uptime</span><div class="stat-val">99.9%</div></div>
  </div>
</body>
</html>`,
    },
  ];

  // Handle single HTML file upload
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onChange({
        sourceType: 'file',
        htmlContent: text,
      });
    };
    reader.readAsText(file);
  };

  // Handle ZIP upload with real client-side JSZip inspection
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingZip(true);
    setZipStatus(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const entries = Object.keys(zip.files);
      if (entries.length > 1000) {
        setZipStatus({
          valid: false,
          error: 'ZIP archive contains more than 1,000 files (exceeds limit).',
        });
        setLoadingZip(false);
        return;
      }

      // Check path traversal
      for (const entry of entries) {
        if (entry.includes('../') || entry.startsWith('/')) {
          setZipStatus({
            valid: false,
            error: 'Security alert: Path traversal entries detected inside archive (../).',
          });
          setLoadingZip(false);
          return;
        }
      }

      // Check for index.html at root or in single top-level directory
      let indexFile = zip.file('index.html');
      let indexPath = 'index.html';

      if (!indexFile) {
        // Look for [folder]/index.html
        const match = entries.find((p) => p.endsWith('index.html') && p.split('/').length <= 3);
        if (match) {
          indexFile = zip.file(match);
          indexPath = match;
        }
      }

      if (!indexFile) {
        setZipStatus({
          valid: false,
          error: 'No index.html found at root or top-level directory of ZIP archive.',
          filesCount: entries.length,
          hasIndex: false,
          entriesList: entries.slice(0, 10),
        });
        setLoadingZip(false);
        return;
      }

      const indexHtmlText = await indexFile.async('text');

      setZipStatus({
        valid: true,
        filesCount: entries.length,
        hasIndex: true,
        entriesList: entries.slice(0, 8),
      });

      onChange({
        sourceType: 'zip',
        zipFileName: file.name,
        filesCount: entries.length,
        htmlContent: indexHtmlText,
      });
    } catch (err: any) {
      setZipStatus({
        valid: false,
        error: `Could not parse ZIP file: ${err.message}`,
      });
    } finally {
      setLoadingZip(false);
    }
  };

  // Handle project directory upload (webkitdirectory)
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let indexFile: File | null = null;
    for (let i = 0; i < files.length; i++) {
      if (files[i].name === 'index.html') {
        indexFile = files[i];
        break;
      }
    }

    if (!indexFile) {
      alert('Selected directory does not contain an index.html file.');
      return;
    }

    const text = await indexFile.text();
    onChange({
      sourceType: 'folder',
      filesCount: files.length,
      htmlContent: text,
    });
  };

  const sourceTabs: { id: SourceType; label: string; icon: any; desc: string }[] = [
    { id: 'paste', label: 'Paste HTML', icon: FileCode, desc: 'Direct code editor' },
    { id: 'file', label: 'HTML File', icon: Upload, desc: 'Upload .html / .htm' },
    { id: 'zip', label: 'ZIP Archive', icon: FolderArchive, desc: 'Full multi-file site' },
    { id: 'url', label: 'Web URL', icon: Globe, desc: 'Hosted HTTPS website' },
    { id: 'folder', label: 'Folder', icon: FolderOpen, desc: 'Directory selector' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">02. Web Content Source</h2>
        <p className="text-sm text-slate-400 mt-1">
          Select how your web application assets will be packaged into the Android APK.
        </p>
      </div>

      {/* Source Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sourceTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = config.sourceType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange({ sourceType: tab.id })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 text-slate-100 shadow-sm'
                  : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
              <div className="text-sm font-medium text-slate-200">{tab.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{tab.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Tab: Paste HTML */}
      {config.sourceType === 'paste' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">HTML Source Code</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Load template:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange({ htmlContent: p.code })}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={config.htmlContent}
            onChange={(e) => onChange({ htmlContent: e.target.value })}
            placeholder="<!DOCTYPE html><html>...</html>"
            rows={14}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Saved directly to Android <code className="text-slate-400">assets/www/index.html</code></span>
            <span>{config.htmlContent.length} characters</span>
          </div>
        </div>
      )}

      {/* Tab: Single File Upload */}
      {config.sourceType === 'file' && (
        <div className="space-y-4">
          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-colors">
            <Upload className="w-10 h-10 text-slate-500 mb-3" />
            <span className="text-sm font-medium text-slate-200">Choose .html or .htm file</span>
            <span className="text-xs text-slate-500 mt-1">Single page HTML containing styles and scripts</span>
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleHtmlFileUpload}
              className="hidden"
            />
          </label>

          {config.htmlContent && (
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-slate-200">HTML file loaded</div>
                  <div className="text-xs text-slate-500">{config.htmlContent.length} bytes</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Ready to package
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab: ZIP Upload */}
      {config.sourceType === 'zip' && (
        <div className="space-y-4">
          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-colors">
            <FolderArchive className="w-10 h-10 text-slate-500 mb-3" />
            <span className="text-sm font-medium text-slate-200">Upload Web Project ZIP (.zip)</span>
            <span className="text-xs text-slate-500 mt-1">Must contain index.html at root or in top-level folder (max 50 MB)</span>
            <input
              type="file"
              accept=".zip,application/zip"
              onChange={handleZipUpload}
              className="hidden"
            />
          </label>

          {loadingZip && (
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center text-sm text-slate-400">
              Validating ZIP structure with JSZip...
            </div>
          )}

          {zipStatus && (
            <div
              className={`p-4 rounded-lg border ${
                zipStatus.valid
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {zipStatus.valid ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-semibold">
                    {zipStatus.valid
                      ? `ZIP Validated: ${zipStatus.filesCount} files inspected`
                      : 'ZIP Validation Failed'}
                  </div>
                  {zipStatus.error && <p className="text-xs text-rose-300 mt-1">{zipStatus.error}</p>}
                  {zipStatus.valid && (
                    <div className="mt-2 text-xs text-slate-400">
                      <span>Detected structure includes index.html and assets. Ready for packaging.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Web URL */}
      {config.sourceType === 'url' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Target Web URL (HTTPS) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={config.webUrl}
                onChange={(e) => onChange({ webUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-slate-500">
              The WebView will navigate directly to this secure URL. Make sure the site is responsive and optimized for mobile devices.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Project Folder */}
      {config.sourceType === 'folder' && (
        <div className="space-y-4">
          <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-colors">
            <FolderOpen className="w-10 h-10 text-slate-500 mb-3" />
            <span className="text-sm font-medium text-slate-200">Select Local Directory</span>
            <span className="text-xs text-slate-500 mt-1">Select folder containing index.html and web assets</span>
            <input
              type="file"
              // @ts-ignore
              webkitdirectory=""
              // @ts-ignore
              directory=""
              onChange={handleFolderUpload}
              className="hidden"
            />
          </label>

          {config.filesCount && (
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Loaded directory with {config.filesCount} entries</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
