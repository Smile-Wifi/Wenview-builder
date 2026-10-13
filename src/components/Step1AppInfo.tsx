import React from 'react';
import type { AppConfig } from '../types.ts';
import { PACKAGE_NAME_REGEX } from '../utils/validation.ts';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Step1Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step1AppInfo: React.FC<Step1Props> = ({ config, onChange }) => {
  const isPackageValid = PACKAGE_NAME_REGEX.test(config.packageName) && !config.packageName.includes('..');

  const handleAppNameChange = (name: string) => {
    const updates: Partial<AppConfig> = { appName: name };
    // Auto-suggest package name if user hasn't heavily customized it
    if (config.packageName.startsWith('com.example.') || config.packageName === 'com.htmltoapk.builder') {
      const sanitized = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20);
      if (sanitized) {
        updates.packageName = `com.app.${sanitized}`;
      }
    }
    onChange(updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">01. Application Identity</h2>
        <p className="text-sm text-slate-400 mt-1">
          Specify core Android metadata. Package name must strictly conform to Android package namespace conventions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* App Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Application Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => handleAppNameChange(e.target.value)}
            placeholder="e.g. My Modern Web App"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <p className="text-xs text-slate-500">Displayed on the Android home screen launcher and app drawer.</p>
        </div>

        {/* Package Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-200">
              Package Name (Application ID) <span className="text-rose-400">*</span>
            </label>
            <span className="text-xs text-slate-500 font-mono">^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={config.packageName}
              onChange={(e) => onChange({ packageName: e.target.value.toLowerCase().trim() })}
              placeholder="com.company.appname"
              className={`w-full px-3.5 py-2.5 pr-10 rounded-lg bg-slate-900 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-mono ${
                isPackageValid ? 'border-slate-700 focus:ring-blue-500' : 'border-rose-500 focus:ring-rose-500'
              }`}
            />
            <div className="absolute right-3 top-2.5 pointer-events-none">
              {isPackageValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
            </div>
          </div>
          {!isPackageValid ? (
            <p className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Must contain 2+ segments separated by single dots with lowercase letters and numbers only.
            </p>
          ) : (
            <p className="text-xs text-slate-500">Unique identifier for Google Play Store and Android OS installation.</p>
          )}
        </div>

        {/* Version Code & Version Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Version Code (Integer) <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              step={1}
              value={config.versionCode}
              onChange={(e) => onChange({ versionCode: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => onChange({ versionCode: config.versionCode + 1 })}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 whitespace-nowrap transition-colors"
            >
              +1 Increment
            </button>
          </div>
          <p className="text-xs text-slate-500">Monotonically increasing integer used by Android package manager.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Version Name (SemVer) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={config.versionName}
            onChange={(e) => onChange({ versionName: e.target.value })}
            placeholder="1.0.0"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono"
          />
          <p className="text-xs text-slate-500">User-facing version string displayed in App Info.</p>
        </div>

        {/* SDK Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Minimum SDK Level
          </label>
          <select
            value={config.minSdk}
            onChange={(e) => onChange({ minSdk: parseInt(e.target.value) })}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
          >
            <option value={21}>API 21: Android 5.0 Lollipop (99.8% coverage)</option>
            <option value={24}>API 24: Android 7.0 Nougat (Recommended, 96.5%)</option>
            <option value={26}>API 26: Android 8.0 Oreo (93.1%)</option>
            <option value={28}>API 28: Android 9.0 Pie (88.4%)</option>
            <option value={30}>API 30: Android 11.0 (78.2%)</option>
            <option value={33}>API 33: Android 13.0 (Modern)</option>
            <option value={34}>API 34: Android 14.0 (Latest)</option>
          </select>
          <p className="text-xs text-slate-500">Oldest Android OS release supported by this APK.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Target SDK Level
          </label>
          <select
            value={config.targetSdk}
            onChange={(e) => onChange({ targetSdk: parseInt(e.target.value) })}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
          >
            <option value={34}>API 34: Android 14 (Google Play 2024+ Requirement)</option>
            <option value={33}>API 33: Android 13</option>
            <option value={31}>API 31: Android 12</option>
          </select>
          <p className="text-xs text-slate-500">Android API behavior target (API 34 required for modern stores).</p>
        </div>
      </div>

      {/* Auto-increment toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800">
        <div>
          <span className="text-sm font-medium text-slate-200">Auto-increment Version Code on Rebuild</span>
          <p className="text-xs text-slate-400 mt-0.5">Automatically advances versionCode by +1 whenever a successful build completes.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.autoIncrement}
            onChange={(e) => onChange({ autoIncrement: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};
