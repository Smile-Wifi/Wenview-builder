import React, { useRef, useState } from 'react';
import type { AppConfig } from '../types.ts';
import { Wifi, Battery, RotateCw, RefreshCw, ArrowLeft, ChevronLeft } from 'lucide-react';

interface DevicePreviewProps {
  config: AppConfig;
}

export const DevicePreview: React.FC<DevicePreviewProps> = ({ config }) => {
  const [viewMode, setViewMode] = useState<'splash' | 'webview'>('webview');
  const [rotated, setRotated] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const isPortrait = config.orientation === 'portrait' || (!rotated && config.orientation === 'sensor');

  const handleBackNavigation = () => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.history.back();
      }
    } catch (e) {
      console.warn('Cannot navigate history directly across cross-origin', e);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top Preview Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('webview')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'webview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WebView Mode
          </button>
          <button
            type="button"
            onClick={() => setViewMode('splash')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'splash' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Splash Preview
          </button>
        </div>

        {/* Back Button Test Action */}
        <button
          type="button"
          onClick={handleBackNavigation}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          title="Simulate pressing Android Back Button"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Press Back</span>
        </button>

        <button
          type="button"
          onClick={() => setRotated(!rotated)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Rotate device"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Reload preview"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div
        className={`transition-all duration-300 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 bg-slate-950 relative overflow-hidden ${
          isPortrait ? 'w-[320px] h-[640px]' : 'w-[640px] h-[320px]'
        }`}
      >
        {/* Device Camera Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
        </div>

        {/* Screen container */}
        <div className="w-full h-full rounded-[34px] overflow-hidden flex flex-col bg-slate-900 relative">
          {/* Status Bar */}
          <div
            className="h-7 px-5 flex items-center justify-between text-[11px] font-mono z-20 shrink-0 select-none"
            style={{
              backgroundColor: config.primaryColor || '#2563EB',
              color: config.statusBarLightIcons ? '#FFFFFF' : '#0F172A',
            }}
          >
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Optional Native In-App App Bar with Back Button */}
          {viewMode === 'webview' && config.webView.inAppBackButton && (
            <div
              className="h-10 px-3 flex items-center gap-2 border-b border-black/10 shrink-0 select-none z-10 shadow-sm"
              style={{
                backgroundColor: config.primaryColor || '#2563EB',
                color: '#FFFFFF',
              }}
            >
              <button
                type="button"
                onClick={handleBackNavigation}
                className="p-1 rounded-full hover:bg-black/10 active:bg-black/20 text-white transition-colors"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-semibold truncate flex-1">{config.appName}</span>
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1 rounded-full hover:bg-black/10 text-white/80 hover:text-white"
                title="Reload"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Screen Content */}
          <div className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
            {viewMode === 'splash' && config.splashEnabled ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative"
                style={{ backgroundColor: config.splashBackgroundColor || config.primaryColor }}
              >
                {/* Optional Video Preview */}
                {config.introVideoType === 'mp4' && config.introVideoBase64 ? (
                  <video
                    src={config.introVideoBase64}
                    autoPlay
                    loop={config.videoBehavior === 'loop'}
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : config.introVideoType === 'youtube' && config.introVideoUrl ? (
                  <div className="absolute inset-0 bg-black flex items-center justify-center text-white text-xs p-4">
                    YouTube Intro Video Configured
                  </div>
                ) : null}

                {/* Logo & App Name overlay */}
                <div
                  className={`z-10 flex flex-col items-center ${
                    config.splashLogoPosition === 'top' ? 'mt-8' : ''
                  }`}
                >
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center shadow-lg border border-white/20">
                    {config.inAppLogoBase64 || config.iconBase64 ? (
                      <img
                        src={config.inAppLogoBase64 || config.iconBase64}
                        alt="Logo"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {(config.appName || 'A').charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-3 drop-shadow">
                    {config.appName || 'My Web App'}
                  </h3>

                  <div className="mt-4 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span className="text-[11px] text-white/80 font-mono">Initializing WebView...</span>
                  </div>
                </div>

                {config.introAllowSkip && (
                  <button
                    onClick={() => setViewMode('webview')}
                    className="absolute top-3 right-3 z-20 px-2 py-1 rounded bg-black/40 text-white text-[10px] backdrop-blur-sm"
                  >
                    Skip
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Real WebView Container */}
                {config.sourceType === 'url' && config.webUrl ? (
                  <iframe
                    ref={iframeRef}
                    key={iframeKey}
                    src={config.webUrl}
                    title="Web Preview"
                    className="w-full flex-1 border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <iframe
                    ref={iframeRef}
                    key={iframeKey}
                    srcDoc={config.htmlContent || '<h1>Hello World</h1>'}
                    title="HTML Preview"
                    className="w-full flex-1 border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                )}

                {/* AdMob Banner Simulation */}
                {config.ads.enabled && (
                  <div className="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-center px-2 shrink-0">
                    <div className="w-full h-10 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono gap-1">
                      <span className="text-amber-400 font-bold">AdMob</span>
                      <span>320×50 Banner Unit</span>
                      {config.ads.testMode && <span className="text-blue-400">[Test Mode]</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Android Navigation Bar with Interactive Back Button */}
          <div
            className="h-7 flex items-center justify-center gap-10 shrink-0 select-none z-20"
            style={{ backgroundColor: config.navBarColor || '#0F172A' }}
          >
            {/* Back Button (Triangle pointing left) */}
            <button
              type="button"
              onClick={handleBackNavigation}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Android Back Button"
            >
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-slate-400" />
            </button>

            {/* Home Button (Circle) */}
            <div className="w-3.5 h-3.5 rounded-full border border-slate-500 opacity-60" />

            {/* Recents Button (Square) */}
            <div className="w-3.5 h-3.5 rounded-sm border border-slate-500 opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
};
