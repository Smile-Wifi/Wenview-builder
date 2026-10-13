import React from 'react';
import type { AppConfig } from '../types.ts';
import { Code, Database, File, ZoomIn, RefreshCw, ShieldAlert, Navigation, Bug, Cpu, ArrowLeft, Undo2 } from 'lucide-react';

interface Step7Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step7WebView: React.FC<Step7Props> = ({ config, onChange }) => {
  const updateWebView = (key: keyof AppConfig['webView'], val: boolean) => {
    onChange({
      webView: {
        ...config.webView,
        [key]: val,
      },
    });
  };

  const settingsList: {
    key: keyof AppConfig['webView'];
    title: string;
    description: string;
    kotlinMapping: string;
    icon: any;
    danger?: boolean;
    featured?: boolean;
  }[] = [
    {
      key: 'hardwareBackNav',
      title: 'Hardware & Gesture Back Button Navigation',
      description: 'Navigates back in web page history (wv.goBack()) on system back press/gesture instead of closing the app.',
      kotlinMapping: 'onBackPressedDispatcher.addCallback { if (wv.canGoBack()) wv.goBack() else finish() }',
      icon: Undo2,
      featured: true,
    },
    {
      key: 'inAppBackButton',
      title: 'In-App Visible Top Back Button / App Bar',
      description: 'Displays a visible back button arrow (←) at the top of the WebView so users have an on-screen back target.',
      kotlinMapping: 'findViewById<View>(R.id.btnBack).setOnClickListener { if (wv.canGoBack()) wv.goBack() }',
      icon: ArrowLeft,
      featured: true,
    },
    {
      key: 'js',
      title: 'JavaScript Execution',
      description: 'Enables JavaScript execution inside the WebView container.',
      kotlinMapping: 'ws.javaScriptEnabled = cfg.webView.js',
      icon: Code,
    },
    {
      key: 'dom',
      title: 'DOM Storage (localStorage / sessionStorage)',
      description: 'Permits web apps to read and store persistent local data.',
      kotlinMapping: 'ws.domStorageEnabled = cfg.webView.dom',
      icon: Database,
    },
    {
      key: 'file',
      title: 'Local File System Access',
      description: 'Allows reading bundled files from android_asset and device storage.',
      kotlinMapping: 'ws.allowFileAccess = cfg.webView.file',
      icon: File,
    },
    {
      key: 'zoom',
      title: 'Pinch-to-Zoom & Built-in Zoom Controls',
      description: 'Allows user pinch gestures to zoom the web page viewport.',
      kotlinMapping: 'ws.setSupportZoom(cfg.webView.zoom); ws.builtInZoomControls = cfg.webView.zoom',
      icon: ZoomIn,
    },
    {
      key: 'cache',
      title: 'Aggressive Browser Caching',
      description: 'Uses LOAD_DEFAULT instead of LOAD_NO_CACHE for faster loads.',
      kotlinMapping: 'ws.cacheMode = if (cfg.webView.cache) LOAD_DEFAULT else LOAD_NO_CACHE',
      icon: RefreshCw,
    },
    {
      key: 'mixed',
      title: 'Mixed Content Mode (HTTP in HTTPS)',
      description: 'Allows loading non-secure HTTP assets inside HTTPS web pages.',
      kotlinMapping: 'ws.mixedContentMode = MIXED_CONTENT_ALWAYS_ALLOW / NEVER_ALLOW',
      icon: ShieldAlert,
      danger: true,
    },
    {
      key: 'geo',
      title: 'Geolocation API',
      description: 'Allows navigator.geolocation coordinate queries from web apps.',
      kotlinMapping: 'ws.setGeolocationEnabled(cfg.webView.geo)',
      icon: Navigation,
    },
    {
      key: 'debug',
      title: 'Remote Chrome DevTools Debugging',
      description: 'Enables live inspect and console debugging via chrome://inspect.',
      kotlinMapping: 'WebView.setWebContentsDebuggingEnabled(cfg.webView.debug)',
      icon: Bug,
    },
    {
      key: 'bridge',
      title: 'Native Android JavaScript Bridge',
      description: 'Injects window.Android object (showToast, vibrate, device info).',
      kotlinMapping: 'wv.addJavascriptInterface(Bridge(this), "Android")',
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">07. Android WebSettings Architecture</h2>
        <p className="text-sm text-slate-400 mt-1">
          Each switch directly generates runtime <code className="text-slate-300">WebSettings</code> calls in <code className="text-slate-300">MainActivity.kt</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {settingsList.map((item) => {
          const Icon = item.icon;
          const isEnabled = config.webView[item.key];
          return (
            <div
              key={item.key}
              onClick={() => updateWebView(item.key, !isEnabled)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isEnabled
                  ? 'border-blue-500/80 bg-blue-500/10'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${isEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-100">{item.title}</span>
                      {item.danger && (
                        <span className="text-[10px] text-amber-400 font-mono">Security</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">{item.description}</p>
                    <div className="mt-2 text-[11px] font-mono text-slate-500">
                      <code>{item.kotlinMapping}</code>
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => updateWebView(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
