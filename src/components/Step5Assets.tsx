import React, { useRef, useState } from 'react';
import type { AppConfig, VideoType, TransitionType } from '../types.ts';
import { Image, Video, Sparkles, AlertCircle, Play, X, Upload } from 'lucide-react';

interface Step5Props {
  config: AppConfig;
  onChange: (updates: Partial<AppConfig>) => void;
}

export const Step5Assets: React.FC<Step5Props> = ({ config, onChange }) => {
  const [videoError, setVideoError] = useState<string | null>(null);
  const iconCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize icon client-side to 512x512 via canvas per spec
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw smooth high-quality resized image
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 512, 512);

          const dataUrl = canvas.toDataURL('image/png');
          onChange({
            iconBase64: dataUrl,
            iconFileName: file.name,
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Generate a clean default SVG/Canvas icon if user wants a quick one
  const generateDefaultIcon = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, config.primaryColor || '#2563EB');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 512, 512, 96);
    ctx.fill();

    // App Initial letter
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 240px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initial = (config.appName || 'A').charAt(0).toUpperCase();
    ctx.fillText(initial, 256, 266);

    const dataUrl = canvas.toDataURL('image/png');
    onChange({
      iconBase64: dataUrl,
      iconFileName: `${config.appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_icon.png`,
    });
  };

  // Handle intro MP4 video upload (max 30MB)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      setVideoError(`Video file size is ${(file.size / 1024 / 1024).toFixed(1)} MB. Exceeds max 30 MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange({
        introVideoType: 'mp4',
        introVideoBase64: base64,
        introVideoFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">05. App Icon & Video Assets</h2>
        <p className="text-sm text-slate-400 mt-1">
          App icon is automatically resized to 512×512 on the client. The build engine generates all mipmap densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* App Icon Upload */}
        <div className="space-y-3 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-200">
              App Launcher Icon (512×512) <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={generateDefaultIcon}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate Clean Icon
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {config.iconBase64 ? (
                <img src={config.iconBase64} alt="App Icon" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-8 h-8 text-slate-500" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="inline-block px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Upload Icon (PNG / SVG / WebP)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleIconUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500">
                Resized to 512×512 and processed into adaptive icons with round launcher assets.
              </p>
            </div>
          </div>
        </div>

        {/* In-app logo */}
        <div className="space-y-3 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <label className="text-sm font-medium text-slate-200">
            In-App Splash Logo (Optional)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {config.inAppLogoBase64 ? (
                <img src={config.inAppLogoBase64} alt="In-App Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-xs text-slate-500 text-center px-1">Uses icon by default</span>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="inline-block px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Upload Custom Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const r = new FileReader();
                    r.onload = (ev) => onChange({ inAppLogoBase64: ev.target?.result as string });
                    r.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>
              {config.inAppLogoBase64 && (
                <button
                  type="button"
                  onClick={() => onChange({ inAppLogoBase64: undefined })}
                  className="text-xs text-rose-400 hover:text-rose-300 ml-2"
                >
                  Remove custom logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Intro Video Section */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div>
          <span className="text-base font-medium text-slate-100 flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-400" />
            Intro Splash Video (Optional)
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Play an intro animation or brand bumper before the web application launches.
          </p>
        </div>

        {/* Video Mode Selection */}
        <div className="flex items-center gap-2">
          {(['none', 'mp4', 'youtube'] as VideoType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ introVideoType: type })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                config.introVideoType === type
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {type === 'none' && 'No Intro Video'}
              {type === 'mp4' && 'Upload MP4 Video (≤ 30 MB)'}
              {type === 'youtube' && 'YouTube Video URL'}
            </button>
          ))}
        </div>

        {config.introVideoType === 'mp4' && (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950 transition-colors">
              <Play className="w-8 h-8 text-slate-500 mb-2" />
              <span className="text-xs font-medium text-slate-200">
                {config.introVideoFileName ? `Selected: ${config.introVideoFileName}` : 'Select .mp4 video file'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Stored inside Android res/raw/intro.mp4</span>
              <input
                type="file"
                accept="video/mp4"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>

            {videoError && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {videoError}
              </p>
            )}

            {config.introVideoBase64 && (
              <div className="aspect-video max-w-sm rounded-lg overflow-hidden border border-slate-800 bg-black">
                <video src={config.introVideoBase64} controls className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        )}

        {config.introVideoType === 'youtube' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">YouTube Embed or Watch URL</label>
            <input
              type="url"
              value={config.introVideoUrl || ''}
              onChange={(e) => onChange({ introVideoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />
          </div>
        )}

        {/* Video Settings: Duration, Transition, Skip */}
        {config.introVideoType !== 'none' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Duration: {config.introDurationSec}s
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={config.introDurationSec}
                onChange={(e) => onChange({ introDurationSec: parseInt(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Transition</label>
              <select
                value={config.introTransition}
                onChange={(e) => onChange({ introTransition: e.target.value as TransitionType })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs"
              >
                <option value="fade">Smooth Fade</option>
                <option value="slide">Slide Transition</option>
                <option value="zoom">Scale Zoom</option>
              </select>
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-3 pt-4 sm:pt-2">
              <span className="text-xs text-slate-300">Allow User to Skip</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.introAllowSkip}
                  onChange={(e) => onChange({ introAllowSkip: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
