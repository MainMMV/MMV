
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCodeIcon, DownloadIcon } from './Icons';

const QRCodePage: React.FC = () => {
  const [text, setText] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  useEffect(() => {
    if (!text.trim()) {
      setQrDataUrl(null);
      return;
    }

    QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: color,
        light: bgColor
      },
      errorCorrectionLevel: errorLevel
    })
    .then(url => {
      setQrDataUrl(url);
    })
    .catch(err => {
      console.error("QR Generation Error:", err);
    });
  }, [text, color, bgColor, errorLevel]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-800 dark:bg-white rounded-xl shadow-lg shadow-slate-500/20">
            <QrCodeIcon />
        </div>
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">QR Code Generator</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Convert text or URLs into scannable QR codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <div className="space-y-6">
            <div>
              <label htmlFor="qr-text" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Content</label>
              <textarea
                id="qr-text"
                rows={5}
                placeholder="Enter text, URL, or data..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Foreground Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-full rounded cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                   <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-full rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Error Correction</label>
               <div className="grid grid-cols-4 gap-2">
                  {['L', 'M', 'Q', 'H'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setErrorLevel(level as any)}
                      className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                        errorLevel === level 
                        ? 'bg-slate-600 text-white shadow-md' 
                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
               </div>
               <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                 Higher levels allow the QR code to be scanned even if partially damaged or covered.
               </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col gap-4">
           <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              {qrDataUrl ? (
                <div className="relative group">
                   <div className="bg-white p-4 rounded-xl shadow-md">
                      <img src={qrDataUrl} alt="Generated QR Code" className="max-w-full h-auto" />
                   </div>
                </div>
              ) : (
                <div className="text-center text-zinc-400">
                   <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <QrCodeIcon />
                   </div>
                   <p className="text-lg font-medium">Enter text to generate preview</p>
                </div>
              )}
           </div>
           
           <button
              disabled={!qrDataUrl}
              onClick={handleDownload}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                qrDataUrl 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
              }`}
           >
             <DownloadIcon />
             Download PNG
           </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
