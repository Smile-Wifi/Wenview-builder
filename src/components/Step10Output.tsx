import React, { useState } from 'react';
import type { AppConfig, OutputFormat, KeystoreType } from '../types.ts';
import { Package, Key, Hammer, Upload, Github, Server, ShieldCheck, AlertCircle } from 'lucide-react';

interface Step10Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
  onStartBuild: () => void;
  isBuilding: boolean;
  validationError?: string | null;
}

export const Step10Output: React.FC<Step10Props> = ({
  config,
  onChange,
  onStartBuild,
  isBuilding,
  validationError,
}) => {
  const [keystoreFileName, setKeystoreFileName] = useState<string>('');

  const handleKeystoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setKeystoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      onChange({
        keystoreType: 'upload',
        keystoreBase64: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">10. Output Format & Keystore Signing</h2>
        <p className="text-sm text-slate-400 mt-1">
          Select target package formats, configure release cryptographic signing, and trigger the compilation build.
        </p>
      </div>

      {/* Package Format */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-200">Target Output Package</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { id: 'apk', title: 'Universal APK (.apk)', desc: 'Directly installable on any Android 5.0+ physical device' },
              { id: 'aab', title: 'App Bundle (.aab)', desc: 'Official Google Play publishing format with dynamic delivery' },
              { id: 'both', title: 'Both (APK + AAB)', desc: 'Generates aligned APK and Play Store App Bundle simultaneously' },
            ] as { id: OutputFormat; title: string; desc: string }[]
          ).map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => onChange({ outputFormat: fmt.id })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                config.outputFormat === fmt.id
                  ? 'border-blue-500 bg-blue-500/10 text-slate-100 shadow-sm'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <div className="text-sm font-semibold text-slate-200">{fmt.title}</div>
              <p className="text-xs text-slate-400 mt-1">{fmt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Keystore Signing Strategy */}
      <div className="space-y-3 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">Release Keystore & Cryptographic Signing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {(
            [
              { id: 'default', label: 'Default Production Keystore', desc: 'Pre-configured release key with 2048-bit RSA' },
              { id: 'upload', label: 'Upload Custom .jks Keystore', desc: 'Use your existing Google Play signing key' },
              { id: 'generate', label: 'Generate New Keystore Config', desc: 'Create fresh keytool credentials' },
            ] as { id: KeystoreType; label: string; desc: string }[]
          ).map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => onChange({ keystoreType: k.id })}
              className={`p-3 rounded-lg border text-left transition-all ${
                config.keystoreType === k.id
                  ? 'border-blue-500 bg-blue-500/10 text-slate-100'
                  : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200">{k.label}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{k.desc}</p>
            </button>
          ))}
        </div>

        {config.keystoreType === 'upload' && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950">
              <Upload className="w-6 h-6 text-slate-500 mb-1" />
              <span className="text-xs font-medium text-slate-200">
                {keystoreFileName ? `Uploaded: ${keystoreFileName}` : 'Select .jks or .keystore file'}
              </span>
              <input
                type="file"
                accept=".jks,.keystore"
                onChange={handleKeystoreUpload}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300">Keystore Password</label>
                <input
                  type="password"
                  value={config.keystorePass || ''}
                  onChange={(e) => onChange({ keystorePass: e.target.value })}
                  placeholder="Store password"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Key Alias</label>
                <input
                  type="text"
                  value={config.keyAlias || ''}
                  onChange={(e) => onChange({ keyAlias: e.target.value })}
                  placeholder="key0"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {config.keystoreType === 'generate' && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300">New Key Alias</label>
              <input
                type="text"
                value={config.keyAlias || 'release_key'}
                onChange={(e) => onChange({ keyAlias: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">New Keystore Password</label>
              <input
                type="password"
                value={config.keystorePass || ''}
                onChange={(e) => onChange({ keystorePass: e.target.value })}
                placeholder="Passphrase (min 6 chars)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Build Engine Selection */}
      <div className="space-y-3 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <label className="block text-sm font-semibold text-slate-200">Build Execution Engine</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ buildWorkerMode: 'direct' })}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              config.buildWorkerMode === 'direct'
                ? 'border-blue-500 bg-blue-500/10 text-slate-100'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">Direct Container Build Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Assembles signed APK and generates ready-to-compile Android Studio project zip immediately.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChange({ buildWorkerMode: 'github_actions' })}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              config.buildWorkerMode === 'github_actions'
                ? 'border-blue-500 bg-blue-500/10 text-slate-100'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">GitHub Actions Remote Worker</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Triggers workflow_dispatch on GitHub with Gradle 8.2 + Android SDK 34 + Temurin JDK 17.
            </p>
          </button>
        </div>

        {config.buildWorkerMode === 'github_actions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300">GitHub Repository (owner/repo)</label>
              <input
                type="text"
                value={config.githubRepo || ''}
                onChange={(e) => onChange({ githubRepo: e.target.value })}
                placeholder="myorg/html-apk-builder"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">Personal Access Token (ghp_...)</label>
              <input
                type="password"
                value={config.githubToken || ''}
                onChange={(e) => onChange({ githubToken: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {validationError && (
        <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-800/40 text-rose-300 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Build Trigger Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStartBuild}
          disabled={isBuilding}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 text-base cursor-pointer"
        >
          <Hammer className={`w-5 h-5 ${isBuilding ? 'animate-spin' : ''}`} />
          <span>{isBuilding ? 'Compiling Android Package...' : 'Build Signed Android APK'}</span>
        </button>
      </div>
    </div>
  );
};
