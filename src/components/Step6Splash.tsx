import React from 'react';
import type { AppConfig, VideoBehavior } from '../types.ts';
import { Eye, Clock, Shield } from 'lucide-react';

interface Step6Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step6Splash: React.FC<Step6Props> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">06. Splash Screen Architecture</h2>
          <p className="text-sm text-slate-400 mt-1">
            Displayed immediately upon app cold start while the Android WebView engine boots up.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.splashEnabled}
            onChange={(e) => onChange({ splashEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {config.splashEnabled ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Background Color */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="block text-sm font-medium text-slate-200">
                Splash Background Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={config.splashBackgroundColor}
                  onChange={(e) => onChange({ splashBackgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.splashBackgroundColor}
                  onChange={(e) => onChange({ splashBackgroundColor: e.target.value })}
                  className="w-32 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => onChange({ splashBackgroundColor: config.primaryColor })}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Match Brand Color
                </button>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Splash Duration
                </label>
                <span className="text-sm font-mono text-blue-400 font-semibold">
                  {(config.splashDurationMs / 1000).toFixed(1)}s ({config.splashDurationMs}ms)
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={6000}
                step={250}
                value={config.splashDurationMs}
                onChange={(e) => onChange({ splashDurationMs: parseInt(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <p className="text-xs text-slate-500">
                Minimum time to display the splash screen before releasing to the main WebView activity.
              </p>
            </div>

            {/* Logo Placement */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="block text-sm font-medium text-slate-200">Logo Layout Alignment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ splashLogoPosition: 'center' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    config.splashLogoPosition === 'center'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Centered in Viewport
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ splashLogoPosition: 'top' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    config.splashLogoPosition === 'top'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Top Header Offset
                </button>
              </div>
            </div>

            {/* Video Behavior */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <label className="block text-sm font-medium text-slate-200">Video Playback Behavior</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'play_once', label: 'Play Once' },
                    { id: 'loop', label: 'Loop' },
                    { id: 'skip_on_tap', label: 'Skip on Tap' },
                  ] as { id: VideoBehavior; label: string }[]
                ).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onChange({ videoBehavior: b.id })}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                      config.videoBehavior === b.id
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-400">
          Splash screen is disabled. The app will launch directly into the Android WebView on startup.
        </div>
      )}
    </div>
  );
};
