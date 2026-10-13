import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Download, Check, Copy } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string;
  appName: string;
  sha256?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  downloadUrl,
  appName,
  sha256,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fullDownloadUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${downloadUrl}`
      : downloadUrl;

  useEffect(() => {
    if (isOpen && fullDownloadUrl) {
      QRCode.toDataURL(fullDownloadUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, fullDownloadUrl]);

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(fullDownloadUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-100">Install on Android Device</h3>
          <p className="text-xs text-slate-400">
            Scan this QR code with your Android phone's camera to download and install <strong className="text-slate-200">{appName}</strong>.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-xl flex items-center justify-center max-w-[260px] mx-auto shadow-inner">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Download QR Code" className="w-full h-full object-contain" />
          ) : (
            <div className="w-60 h-60 flex items-center justify-center text-slate-500 text-xs">
              Generating QR Code...
            </div>
          )}
        </div>

        {/* URL and copy */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="truncate flex-1">{fullDownloadUrl}</span>
            <button
              onClick={copyLink}
              className="text-blue-400 hover:text-blue-300 p-1 shrink-0"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {sha256 && (
            <div className="text-[10px] text-slate-500 font-mono truncate text-center">
              SHA-256: {sha256}
            </div>
          )}
        </div>

        {/* Installation Instructions */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Quick Installation Steps:</div>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Open camera or Google Lens on Android phone</li>
            <li>Tap the detected download banner link</li>
            <li>If prompted "File might be harmful", tap <strong>Download anyway</strong></li>
            <li>Open downloaded APK and tap <strong>Install</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
};
