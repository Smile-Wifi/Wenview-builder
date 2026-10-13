import React, { useEffect, useRef, useState } from 'react';
import type { BuildStatusResult } from '../types.ts';
import {
  Download,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  FileArchive,
  RefreshCw,
  FolderGit2,
  ArrowLeft,
} from 'lucide-react';

interface BuildPanelProps {
  buildStatus: BuildStatusResult | null;
  isBuilding: boolean;
  onRefreshStatus: () => void;
  onOpenQrModal: () => void;
  onBackToWizard?: () => void;
}

export const BuildPanel: React.FC<BuildPanelProps> = ({
  buildStatus,
  isBuilding,
  onRefreshStatus,
  onOpenQrModal,
  onBackToWizard,
}) => {
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal when new log lines arrive
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [buildStatus?.logs, autoScroll]);

  const copySha256 = () => {
    if (buildStatus?.sha256) {
      navigator.clipboard.writeText(buildStatus.sha256);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    }
  };

  const copyAllLogs = () => {
    if (buildStatus?.logs) {
      navigator.clipboard.writeText(buildStatus.logs.join('\n'));
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    }
  };

  const handleDownloadApk = async () => {
    if (!buildStatus?.downloadUrl) return;

    try {
      const response = await fetch(buildStatus.downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const appName = buildStatus.metadata?.appName || 'app';
      a.download = `${appName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}-release.apk`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Could not download APK: ${err.message}`);
    }
  };

  const handleDownloadProjectZip = () => {
    if (!buildStatus?.projectZipUrl) return;
    window.location.href = buildStatus.projectZipUrl;
  };

  if (!buildStatus && !isBuilding) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <Terminal className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-semibold text-slate-300">Build Console Idle</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Complete the configuration wizard and click "Build Signed Android APK" in Step 10 to launch the build engine.
        </p>
        {onBackToWizard && (
          <button
            type="button"
            onClick={onBackToWizard}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Wizard
          </button>
        )}
      </div>
    );
  }

  const isSuccess = buildStatus?.status === 'success';
  const isFailed = buildStatus?.status === 'failed';
  const isRunning = isBuilding || buildStatus?.status === 'running' || buildStatus?.status === 'queued';

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isFailed
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isFailed ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <RefreshCw className="w-5 h-5 animate-spin" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-100">
                  {isSuccess
                    ? 'APK Built & Signed Successfully'
                    : isFailed
                    ? 'Build Engine Encountered Errors'
                    : 'Building Android Package...'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {buildStatus?.buildId || 'initializing'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isSuccess
                  ? 'Signed release APK generated. Verified cryptographic digest and alignment.'
                  : isFailed
                  ? buildStatus?.error || 'Build halted during assembly'
                  : 'Assembling DEX bytecode, binary AXML, and JAR signature block...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToWizard && (
              <button
                type="button"
                onClick={onBackToWizard}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Return to configuration wizard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                <span>Back to Wizard</span>
              </button>
            )}
            <button
              type="button"
              onClick={onRefreshStatus}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Compilation Progress</span>
            <span className="tabular-nums">{buildStatus?.progress || (isSuccess ? 100 : 15)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-blue-500'
              }`}
              style={{ width: `${buildStatus?.progress || (isSuccess ? 100 : 15)}%` }}
            />
          </div>
        </div>

        {/* Success Metrics: SHA-256, Size, Action Buttons */}
        {isSuccess && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Verified Package SHA-256 Digest:</span>
                <button
                  type="button"
                  onClick={copySha256}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copiedSha ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 break-all select-all">
                {buildStatus.sha256}
              </div>
              <div className="text-xs text-slate-400">
                Package Size: <span className="font-mono text-slate-200">{((buildStatus.sizeBytes || 0) / 1024).toFixed(1)} KB</span> ({buildStatus.sizeBytes} bytes)
              </div>
            </div>

            <div className="flex flex-col justify-end gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadApk}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed APK</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenQrModal}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
                  title="Scan QR Code to install on Android phone"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>

              {buildStatus.projectZipUrl && (
                <button
                  type="button"
                  onClick={handleDownloadProjectZip}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FolderGit2 className="w-4 h-4 text-purple-400" />
                  <span>Download Complete Android Studio Source Project (.zip)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Terminal Logs Viewer */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-200 font-mono">Build Console Output</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-blue-600"
              />
              <span>Auto-scroll</span>
            </label>

            <button
              type="button"
              onClick={copyAllLogs}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedLogs ? 'Copied' : 'Copy Logs'}</span>
            </button>
          </div>
        </div>

        <div
          ref={terminalRef}
          className="p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto space-y-1 leading-relaxed selection:bg-blue-600"
        >
          {buildStatus?.logs && buildStatus.logs.length > 0 ? (
            buildStatus.logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-slate-600 select-none tabular-nums w-8 shrink-0 text-right">
                  {index + 1}
                </span>
                <span
                  className={
                    log.includes('error') || log.includes('Failed')
                      ? 'text-rose-400 font-medium'
                      : log.includes('Success') || log.includes('completed')
                      ? 'text-emerald-400 font-medium'
                      : log.includes('Warning')
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-600 italic">Waiting for engine logs...</div>
          )}
        </div>
      </div>
    </div>
  );
};
