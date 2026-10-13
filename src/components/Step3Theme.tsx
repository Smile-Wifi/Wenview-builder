import React from 'react';
import type { AppConfig, Orientation } from '../types.ts';
import { Smartphone, RotateCw, Monitor } from 'lucide-react';

interface Step3Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step3Theme: React.FC<Step3Props> = ({ config, onChange }) => {
  const colorPresets = [
    { label: 'Royal Blue', hex: '#2563EB' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Violet', hex: '#7C3AED' },
    { label: 'Crimson', hex: '#DC2626' },
    { label: 'Slate Dark', hex: '#0F172A' },
    { label: 'Amber', hex: '#D97706' },
    { label: 'Cyan', hex: '#0891B2' },
    { label: 'Charcoal', hex: '#1E293B' },
  ];

  const orientationOptions: { id: Orientation; label: string; desc: string; icon: any }[] = [
    {
      id: 'portrait',
      label: 'Portrait Only',
      desc: 'Locked to vertical orientation (standard mobile apps)',
      icon: Smartphone,
    },
    {
      id: 'landscape',
      label: 'Landscape Only',
      desc: 'Locked to horizontal orientation (games & wide views)',
      icon: Monitor,
    },
    {
      id: 'sensor',
      label: 'Sensor / Dynamic',
      desc: 'Rotates automatically with device gyro sensor',
      icon: RotateCw,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">03. Visual Theme & Orientation</h2>
        <p className="text-sm text-slate-400 mt-1">
          Colors are injected into Android <code className="text-slate-300">res/values/colors.xml</code>, the status bar, and system navigation bar.
        </p>
      </div>

      {/* Screen Orientation */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-200">Screen Orientation</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {orientationOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = config.orientation === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ orientation: opt.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 text-slate-100'
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Brand Color */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-200">
          Primary Brand & Status Bar Color <span className="text-rose-400">*</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={config.primaryColor}
            onChange={(e) => onChange({ primaryColor: e.target.value })}
            className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
          />
          <input
            type="text"
            value={config.primaryColor}
            onChange={(e) => onChange({ primaryColor: e.target.value })}
            placeholder="#2563EB"
            className="w-32 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono"
          />
          <div className="flex flex-wrap items-center gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChange({ primaryColor: preset.hex })}
                style={{ backgroundColor: preset.hex }}
                className="w-7 h-7 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                title={preset.label}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">Injected into Android status bar and splash screen background.</p>
      </div>

      {/* Navigation Bar Color */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-200">
          Android Navigation Bar Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={config.navBarColor}
            onChange={(e) => onChange({ navBarColor: e.target.value })}
            className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
          />
          <input
            type="text"
            value={config.navBarColor}
            onChange={(e) => onChange({ navBarColor: e.target.value })}
            placeholder="#0F172A"
            className="w-32 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono"
          />
          <span className="text-xs text-slate-500">Controls the bottom software system bar color (Android 8.0+).</span>
        </div>
      </div>

      {/* Status Bar Light Icons Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800">
        <div>
          <span className="text-sm font-medium text-slate-200">Light Status Bar Icons</span>
          <p className="text-xs text-slate-400 mt-0.5">Use white icons on dark status bars, or dark icons on bright status bars.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.statusBarLightIcons}
            onChange={(e) => onChange({ statusBarLightIcons: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};
