
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCodeIcon, DownloadIcon, LinkIcon, DocumentTextIcon, TrashIcon, CheckCircleIcon
} from './Icons';

type QRMode = 'url' | 'text';

interface SavedQR {
    id: string;
    name: string;
    date: string;
    content: string;
    mode: QRMode;
}

const QRCodePage: React.FC = () => {
  const [mode, setMode] = useState<QRMode>('url');
  const [inputValue, setInputValue] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<SavedQR[]>(() => {
      try {
          const saved = localStorage.getItem('qrHistory');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  useEffect(() => {
      localStorage.setItem('qrHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = () => {
      if (!inputValue) return;
      
      const newEntry: SavedQR = {
          id: Date.now().toString(),
          name: inputValue,
          date: new Date().toLocaleDateString(),
          content: inputValue,
          mode
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5)); // Keep last 5
  };

  // Generate QR Code
  useEffect(() => {
    const generate = async () => {
      if (!inputValue) {
        setQrDataUrl(null);
        return;
      }

      try {
        const url = await QRCode.toDataURL(inputValue, {
          width: 1024,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(generate, 300); // Debounce
    return () => clearTimeout(timer);
  }, [inputValue]);


  const handleDownload = () => {
    if (!qrDataUrl) return;
    addToHistory(); 
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30">
            <QrCodeIcon className="w-8 h-8 text-gray-800 dark:text-white" />
        </div>
        <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">QR Generator</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Create and share instant QR codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input */}
        <div className="flex flex-col gap-6">
            
            {/* Glass Card Input Area */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 dark:border-gray-700/30 shadow-xl">
                
                {/* Mode Toggles */}
                <div className="flex p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl mb-6 border border-white/20 dark:border-gray-700/30">
                    <button
                        onClick={() => setMode('url')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                            mode === 'url' 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <LinkIcon />
                        <span>Link URL</span>
                    </button>
                    <button
                        onClick={() => setMode('text')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
                            mode === 'text' 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <DocumentTextIcon />
                        <span>Plain Text</span>
                    </button>
                </div>

                {/* Input Field */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                        {mode === 'url' ? 'Destination URL' : 'Content Text'}
                    </label>
                    {mode === 'url' ? (
                        <input 
                            type="url" 
                            placeholder="https://example.com" 
                            value={inputValue} 
                            onChange={e => setInputValue(e.target.value)}
                            className="w-full px-5 py-4 bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-lg backdrop-blur-sm placeholder:text-gray-400"
                        />
                    ) : (
                        <textarea 
                            rows={4}
                            placeholder="Enter text to convert..." 
                            value={inputValue} 
                            onChange={e => setInputValue(e.target.value)}
                            className="w-full px-5 py-4 bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all text-lg backdrop-blur-sm resize-none placeholder:text-gray-400"
                        />
                    )}
                </div>
            </div>

            {/* History Card */}
            {history.length > 0 && (
               <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/30 dark:border-gray-700/30 shadow-lg">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-gray-800 dark:text-white">Recent Codes</h3>
                       <button onClick={() => setHistory([])} className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">Clear</button>
                   </div>
                   <div className="space-y-2">
                       {history.map(h => (
                           <button 
                                key={h.id} 
                                onClick={() => { setMode(h.mode); setInputValue(h.content); }}
                                className="w-full text-left p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors flex items-center gap-3 group border border-transparent hover:border-white/40"
                           >
                               <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                                   {h.mode === 'url' ? <LinkIcon className="w-4 h-4"/> : <DocumentTextIcon className="w-4 h-4"/>}
                               </div>
                               <div className="min-w-0 flex-1">
                                   <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{h.name}</p>
                                   <p className="text-[10px] text-gray-500 font-medium uppercase">{h.date}</p>
                               </div>
                           </button>
                       ))}
                   </div>
               </div>
            )}
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col h-full">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-1 border border-white/20 dark:border-gray-700/50 shadow-2xl h-full flex flex-col">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[20px] p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                    
                    {/* Decorative Background Blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center w-full">
                        {qrDataUrl ? (
                            <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 mb-8 transform transition-transform hover:scale-105 duration-300">
                                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64 sm:w-80 sm:h-80 object-contain" />
                            </div>
                        ) : (
                             <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 mb-8">
                                <QrCodeIcon className="w-16 h-16 mb-4 opacity-50" />
                                <span className="font-medium text-sm">Enter content to generate</span>
                             </div>
                        )}

                        <button
                            disabled={!qrDataUrl}
                            onClick={handleDownload}
                            className={`w-full max-w-xs py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                                qrDataUrl 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:-translate-y-1 shadow-emerald-500/30' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <DownloadIcon />
                            Download PNG
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default QRCodePage;
