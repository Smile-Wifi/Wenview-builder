import React, { useState, useEffect, useRef } from 'react';
import type { AppConfig, BuildStatusResult } from './types.ts';
import { WizardHeader } from './components/WizardHeader.tsx';
import { Step1AppInfo } from './components/Step1AppInfo.tsx';
import { Step2ContentSource } from './components/Step2ContentSource.tsx';
import { Step3Theme } from './components/Step3Theme.tsx';
import { Step4Permissions } from './components/Step4Permissions.tsx';
import { Step5Assets } from './components/Step5Assets.tsx';
import { Step6Splash } from './components/Step6Splash.tsx';
import { Step7WebView } from './components/Step7WebView.tsx';
import { Step8AdMob } from './components/Step8AdMob.tsx';
import { Step9Summary } from './components/Step9Summary.tsx';
import { Step10Output } from './components/Step10Output.tsx';
import { BuildPanel } from './components/BuildPanel.tsx';
import { DevicePreview } from './components/DevicePreview.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { DocsView } from './components/DocsView.tsx';
import { ChevronLeft, ChevronRight, CheckCircle2, Hammer, Terminal, Smartphone } from 'lucide-react';

const DEFAULT_CONFIG: AppConfig = {
  appName: 'My Modern Web App',
  packageName: 'com.app.mywebapp',
  versionCode: 1,
  versionName: '1.0.0',
  minSdk: 24,
  targetSdk: 34,
  autoIncrement: true,

  sourceType: 'paste',
  htmlContent: `<!DOCTYPE html>
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
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
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
      transition: background 0.2s;
    }
    button:active { transform: scale(0.98); }
    #bridgeOutput { margin-top: 16px; font-size: 13px; color: #38bdf8; min-height: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello World</h1>
    <p>This HTML is running inside a production Android WebView packaged with Capacitor v6.</p>
    <button onclick="testAndroidBridge()">Test Android Native Bridge</button>
    <div id="bridgeOutput">Tap button to test native bridge</div>
  </div>

  <script>
    function testAndroidBridge() {
      if (window.Android && window.Android.showToast) {
        window.Android.showToast("Native Toast from WebView!");
        if (window.Android.vibrate) window.Android.vibrate(50);
        document.getElementById("bridgeOutput").innerText = "Invoked Android Bridge: Toast + Haptic Feedback!";
      } else {
        document.getElementById("bridgeOutput").innerText = "Running in browser preview window.";
      }
    }
  </script>
</body>
</html>`,
  webUrl: 'https://example.com',

  orientation: 'portrait',
  primaryColor: '#2563EB',
  navBarColor: '#0F172A',
  statusBarLightIcons: true,

  permissions: [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
  ],

  iconBase64: '',
  iconFileName: 'default_icon.png',
  inAppLogoBase64: undefined,
  introVideoType: 'none',
  introDurationSec: 3,
  introTransition: 'fade',
  introAllowSkip: true,

  splashEnabled: true,
  splashBackgroundColor: '#2563EB',
  splashLogoPosition: 'center',
  videoBehavior: 'play_once',
  splashDurationMs: 2000,

  webView: {
    js: true,
    dom: true,
    file: true,
    zoom: true,
    cache: true,
    mixed: false,
    geo: false,
    debug: false,
    bridge: true,
    hardwareBackNav: true,
    inAppBackButton: true,
  },

  ads: {
    enabled: false,
    appId: '',
    bannerUnitId: '',
    interstitialUnitId: '',
    testMode: true,
  },

  outputFormat: 'apk',
  keystoreType: 'default',
  buildWorkerMode: 'direct',
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'wizard' | 'logs' | 'docs' | 'preview'>('wizard');

  const [buildStatus, setBuildStatus] = useState<BuildStatusResult | null>(null);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  const activePollingRef = useRef<boolean>(false);

  // Initialize default icon if empty
  useEffect(() => {
    if (!config.iconBase64) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(0, 0, 512, 512, 96);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 240px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', 256, 266);

        setConfig((prev) => ({
          ...prev,
          iconBase64: canvas.toDataURL('image/png'),
        }));
      }
    }
  }, []);

  const handleConfigChange = (updates: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setValidationError(null);
  };

  const handleReset = () => {
    if (confirm('Reset all builder fields to standard defaults?')) {
      setConfig(DEFAULT_CONFIG);
      setCurrentStep(1);
      setBuildStatus(null);
      setValidationError(null);
    }
  };

  // Poll status using chained timeout (real server feedback without fake polling)
  const pollStatus = async (buildId: string) => {
    if (!activePollingRef.current) return;

    try {
      const res = await fetch(`/api/status?buildId=${encodeURIComponent(buildId)}`);
      if (res.ok) {
        const data: BuildStatusResult = await res.json();
        setBuildStatus(data);

        if (data.status === 'success') {
          setIsBuilding(false);
          activePollingRef.current = false;
          // Auto-increment version code if toggled
          if (config.autoIncrement) {
            setConfig((prev) => ({ ...prev, versionCode: prev.versionCode + 1 }));
          }
          return;
        } else if (data.status === 'failed') {
          setIsBuilding(false);
          activePollingRef.current = false;
          return;
        }
      }
    } catch (err) {
      console.error('Status poll error:', err);
    }

    // Schedule next poll in 3 seconds if still active
    if (activePollingRef.current) {
      setTimeout(() => pollStatus(buildId), 3000);
    }
  };

  // Trigger real build
  const handleStartBuild = async () => {
    setValidationError(null);
    setIsBuilding(true);
    setActiveTab('logs');

    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsBuilding(false);
        const errMsg = data.error || 'Build rejected by server';
        setValidationError(errMsg);
        setBuildStatus({
          buildId: 'err_' + Date.now(),
          status: 'failed',
          progress: 0,
          logs: [`[${new Date().toISOString()}] Server validation failed: ${errMsg}`],
          error: errMsg,
          timestamp: Date.now(),
        });
        return;
      }

      setBuildStatus({
        buildId: data.buildId,
        status: data.status,
        progress: 10,
        logs: [`[${new Date().toISOString()}] Build job ${data.buildId} queued on provider: ${data.provider}`],
        timestamp: Date.now(),
      });

      // Start real polling loop with chained setTimeout
      activePollingRef.current = true;
      setTimeout(() => pollStatus(data.buildId), 1500);
    } catch (err: any) {
      setIsBuilding(false);
      setValidationError(err.message || 'Network error triggering build');
    }
  };

  const stepsList = [
    'App Identity',
    'Content Source',
    'Theme & Screen',
    'Permissions',
    'Icon & Assets',
    'Splash Screen',
    'WebSettings',
    'AdMob Ads',
    'Manifest Review',
    'Output & Build',
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <WizardHeader
        currentStep={currentStep}
        onNavigateTab={setActiveTab}
        activeTab={activeTab}
        onReset={handleReset}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: WIZARD */}
        {activeTab === 'wizard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 columns: 10-step wizard form */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stepper Progress Indicator */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
                  {stepsList.map((stepName, idx) => {
                    const stepNum = idx + 1;
                    const isDone = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;
                    return (
                      <button
                        key={stepNum}
                        onClick={() => setCurrentStep(stepNum)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : isDone
                            ? 'text-emerald-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                            isCurrent
                              ? 'bg-white text-blue-600 font-bold'
                              : isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isDone ? '✓' : stepNum}
                        </span>
                        <span>{stepName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wizard Step Body */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl min-h-[460px]">
                {currentStep === 1 && (
                  <Step1AppInfo config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 2 && (
                  <Step2ContentSource config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 3 && (
                  <Step3Theme config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 4 && (
                  <Step4Permissions config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 5 && (
                  <Step5Assets config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 6 && (
                  <Step6Splash config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 7 && (
                  <Step7WebView config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 8 && (
                  <Step8AdMob config={config} onChange={handleConfigChange} />
                )}
                {currentStep === 9 && (
                  <Step9Summary config={config} onJumpToStep={(step) => setCurrentStep(step)} />
                )}
                {currentStep === 10 && (
                  <Step10Output
                    config={config}
                    onChange={handleConfigChange}
                    onStartBuild={handleStartBuild}
                    isBuilding={isBuilding}
                    validationError={validationError}
                  />
                )}
              </div>

              {/* Navigation Back / Next Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Step
                </button>

                <div className="flex items-center gap-2">
                  {currentStep < 10 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => Math.min(10, s + 1))}
                      className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartBuild}
                      disabled={isBuilding}
                      className="px-6 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Hammer className="w-4 h-4" /> Build Signed Package
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right 4 columns: Live Device Preview */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Real-Time Android Simulator</span>
                </div>
                <button
                  onClick={() => setActiveTab('preview')}
                  className="text-[11px] text-blue-400 hover:text-blue-300"
                >
                  Full View
                </button>
              </div>

              <DevicePreview config={config} />
            </div>
          </div>
        )}

        {/* TAB 2: DEVICE PREVIEW ONLY */}
        {activeTab === 'preview' && (
          <div className="max-w-xl mx-auto py-6 space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('wizard')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-blue-400" />
                <span>Back to Wizard</span>
              </button>
              <span className="text-xs text-slate-400">Interactive Android Viewport</span>
            </div>
            <DevicePreview config={config} />
          </div>
        )}

        {/* TAB 3: BUILD CONSOLE / LOGS */}
        {activeTab === 'logs' && (
          <div className="max-w-4xl mx-auto">
            <BuildPanel
              buildStatus={buildStatus}
              isBuilding={isBuilding}
              onBackToWizard={() => setActiveTab('wizard')}
              onRefreshStatus={() => {
                if (buildStatus?.buildId) {
                  activePollingRef.current = true;
                  pollStatus(buildStatus.buildId);
                }
              }}
              onOpenQrModal={() => setIsQrModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: ARCHITECTURE & SPECS */}
        {activeTab === 'docs' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <button
              type="button"
              onClick={() => setActiveTab('wizard')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-blue-400" />
              <span>Back to Wizard</span>
            </button>
            <DocsView />
          </div>
        )}
      </main>

      {/* QR Code Modal for Mobile Phone Install */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        downloadUrl={buildStatus?.downloadUrl || `/api/download/${buildStatus?.buildId || ''}`}
        appName={config.appName}
        sha256={buildStatus?.sha256}
      />
    </div>
  );
}
