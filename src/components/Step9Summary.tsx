import React from 'react';
import type { AppConfig } from '../types.ts';
import { Edit3, CheckCircle2, AlertCircle, Smartphone, Shield, Video, Layers } from 'lucide-react';

interface Step9Props {
  config: AppConfig;
  onJumpToStep: (step: number) => void;
}

export const Step9Summary: React.FC<Step9Props> = ({ config, onJumpToStep }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">09. Build Manifest Review</h2>
        <p className="text-sm text-slate-400 mt-1">
          Review all configured parameters prior to package generation. Click any edit link to modify.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: App Info */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-semibold text-slate-200">Application Identity</span>
            <button
              onClick={() => onJumpToStep(1)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">App Title:</span>
              <span className="text-slate-200 font-medium">{config.appName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Package Name:</span>
              <span className="text-slate-200 font-mono">{config.packageName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Version:</span>
              <span className="text-slate-200 font-mono">
                {config.versionName} (Code: {config.versionCode})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SDK Target:</span>
              <span className="text-slate-200">Min {config.minSdk} · Target {config.targetSdk}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Web Content */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-semibold text-slate-200">Content Source</span>
            <button
              onClick={() => onJumpToStep(2)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Source Type:</span>
              <span className="text-slate-200 font-medium capitalize">{config.sourceType}</span>
            </div>
            {config.sourceType === 'url' ? (
              <div className="flex justify-between">
                <span className="text-slate-400">Target URL:</span>
                <span className="text-slate-200 font-mono truncate max-w-[200px]">{config.webUrl}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-slate-400">Embedded Assets:</span>
                <span className="text-slate-200">
                  {config.zipFileName || `${config.htmlContent.length} chars HTML`}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Entrypoint:</span>
              <span className="text-slate-200 font-mono">
                {config.sourceType === 'url' ? config.webUrl : 'file:///android_asset/www/index.html'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Theme & Assets */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-semibold text-slate-200">Theme & Visual Assets</span>
            <button
              onClick={() => onJumpToStep(3)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Primary Color:</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-700"
                  style={{ backgroundColor: config.primaryColor }}
                />
                <span className="text-slate-200 font-mono">{config.primaryColor}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Orientation:</span>
              <span className="text-slate-200 capitalize">{config.orientation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Icon:</span>
              <span className="text-slate-200">{config.iconBase64 ? '512×512 Custom Icon' : 'Default Icon'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Intro Video:</span>
              <span className="text-slate-200 capitalize">
                {config.introVideoType !== 'none' ? `${config.introVideoType.toUpperCase()} (${config.introDurationSec}s)` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: WebSettings & Ads */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-semibold text-slate-200">WebSettings & Advertising</span>
            <button
              onClick={() => onJumpToStep(7)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">JavaScript:</span>
              <span className={config.webView.js ? 'text-emerald-400' : 'text-slate-500'}>
                {config.webView.js ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pinch Zoom:</span>
              <span className={config.webView.zoom ? 'text-emerald-400' : 'text-slate-500'}>
                {config.webView.zoom ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chrome Inspect:</span>
              <span className={config.webView.debug ? 'text-emerald-400' : 'text-slate-500'}>
                {config.webView.debug ? 'Active (chrome://inspect)' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AdMob Ads:</span>
              <span className={config.ads.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                {config.ads.enabled ? (config.ads.testMode ? 'Test Mode Active' : 'Live Ads Active') : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Breakdown */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-sm font-semibold text-slate-200">
            Declared Android Permissions ({config.permissions.length})
          </span>
          <button
            onClick={() => onJumpToStep(4)}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {config.permissions.map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300"
            >
              {p.replace('android.permission.', '')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
