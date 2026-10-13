import React from 'react';
import type { AppConfig } from '../types.ts';
import { DollarSign, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface Step8Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step8AdMob: React.FC<Step8Props> = ({ config, onChange }) => {
  const updateAds = (key: keyof AppConfig['ads'], val: any) => {
    onChange({
      ads: {
        ...config.ads,
        [key]: val,
      },
    });
  };

  // Official Google AdMob Sample / Test Ad Unit IDs
  const applyTestUnits = () => {
    onChange({
      ads: {
        enabled: true,
        appId: 'ca-app-pub-3940256099942544~3347511713', // Google Test App ID
        bannerUnitId: 'ca-app-pub-3940256099942544/6300978111', // Google Test Banner ID
        interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712', // Google Test Interstitial ID
        testMode: true,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">08. Google AdMob Monetization</h2>
          <p className="text-sm text-slate-400 mt-1">
            Enabling ads injects <code className="text-slate-300">com.google.android.gms:play-services-ads:23.0.0</code> and manifest metadata.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.ads.enabled}
            onChange={(e) => updateAds('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {config.ads.enabled ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-950/20 border border-blue-900/40">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-sm font-medium text-slate-200">Testing Ads in Development</span>
                <p className="text-xs text-slate-400">Use official Google test ad IDs to prevent account policy strikes during validation.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={applyTestUnits}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-fill Google Test IDs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* App ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                AdMob Application ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={config.ads.appId}
                onChange={(e) => updateAds('appId', e.target.value.trim())}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500">Injected into AndroidManifest &lt;meta-data com.google.android.gms.ads.APPLICATION_ID&gt;.</p>
            </div>

            {/* Banner Unit ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Banner Ad Unit ID
              </label>
              <input
                type="text"
                value={config.ads.bannerUnitId}
                onChange={(e) => updateAds('bannerUnitId', e.target.value.trim())}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500">Rendered in the bottom ad container of MainActivity.</p>
            </div>

            {/* Interstitial Unit ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Interstitial Ad Unit ID (Optional)
              </label>
              <input
                type="text"
                value={config.ads.interstitialUnitId}
                onChange={(e) => updateAds('interstitialUnitId', e.target.value.trim())}
                placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/iiiiiiiiii"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Test Mode Toggle */}
            <div className="space-y-2 flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-800 self-end">
              <div>
                <span className="text-sm font-medium text-slate-200">Enable Test Ads Mode</span>
                <p className="text-xs text-slate-500">Marks device as test device to receive sample ads.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ads.testMode}
                  onChange={(e) => updateAds('testMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-400">
          AdMob monetization is disabled. No advertising SDK or Play Services tracking code will be injected into your APK.
        </div>
      )}
    </div>
  );
};
