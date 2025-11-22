
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCodeIcon, DownloadIcon, WifiIcon, MailIcon, LinkIcon, 
  IdentificationIcon, PhotoIcon, DocumentTextIcon, TrashIcon 
} from './Icons';

type QRMode = 'text' | 'url' | 'wifi' | 'email' | 'vcard';

interface SavedQR {
    id: string;
    name: string;
    date: string;
    content: string;
    mode: QRMode;
}

const QRCodePage: React.FC = () => {
  // Mode Selection
  const [mode, setMode] = useState<QRMode>('url');

  // Content States
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  
  // WiFi States
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const [isHidden, setIsHidden] = useState(false);

  // Email States
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // VCard States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [org, setOrg] = useState('');
  const [vCardEmail, setVCardEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Appearance States
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(1024); // Default resolution
  const [margin, setMargin] = useState(2);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

  // Logo States
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20); // Percentage of QR size

  // Output
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Construct QR String based on mode
  const getQRString = () => {
    switch (mode) {
      case 'url':
        return url;
      case 'text':
        return text;
      case 'wifi':
        return `WIFI:T:${encryption};S:${ssid};P:${password};${isHidden ? 'H:true;' : ''};`;
      case 'email':
        return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName}\nFN:${firstName} ${lastName}\nORG:${org}\nTEL:${phone}\nEMAIL:${vCardEmail}\nURL:${website}\nEND:VCARD`;
      default:
        return '';
    }
  };

  const addToHistory = () => {
      const content = getQRString();
      if (!content) return;
      
      const newEntry: SavedQR = {
          id: Date.now().toString(),
          name: mode === 'url' ? url : mode === 'wifi' ? ssid : mode === 'email' ? email : mode,
          date: new Date().toLocaleDateString(),
          content,
          mode
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 10)); // Keep last 10
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogo(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate QR Code
  useEffect(() => {
    const generate = async () => {
      const qrString = getQRString();
      if (!qrString || (mode === 'url' && !url) || (mode === 'text' && !text)) {
        setQrDataUrl(null);
        return;
      }

      try {
        // 1. Generate QR on a temporary canvas
        const tempCanvas = document.createElement('canvas');
        await QRCode.toCanvas(tempCanvas, qrString, {
          width: size,
          margin: margin,
          color: {
            dark: color,
            light: bgColor
          },
          errorCorrectionLevel: errorLevel
        });

        // 2. If Logo exists, draw it on top
        if (logo) {
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.src = logo;
            await new Promise((resolve) => {
              img.onload = resolve;
            });

            // Calculate logo position (center)
            const logoPxSize = (size * (logoSize / 100));
            const x = (size - logoPxSize) / 2;
            const y = (size - logoPxSize) / 2;

            ctx.drawImage(img, x, y, logoPxSize, logoPxSize);
          }
        }

        setQrDataUrl(tempCanvas.toDataURL('image/png'));
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(generate, 500); // Debounce
    return () => clearTimeout(timer);
  }, [mode, text, url, ssid, password, encryption, isHidden, email, subject, body, firstName, lastName, phone, org, vCardEmail, website, color, bgColor, size, margin, errorLevel, logo, logoSize]);


  const handleDownload = () => {
    if (!qrDataUrl) return;
    addToHistory(); // Save to history on download
    const link = document.createElement('a');
    link.download = `qrcode-${mode}-${Date.now()}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContentInputs = () => {
    switch (mode) {
      case 'url':
        return (
          <div>
             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Website URL</label>
             <input 
                type="url" 
                placeholder="https://example.com" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all"
             />
          </div>
        );
      case 'text':
        return (
          <div>
             <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Plain Text</label>
             <textarea 
                rows={5}
                placeholder="Enter your text here..." 
                value={text} 
                onChange={e => setText(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all resize-none"
             />
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Network Name (SSID)</label>
               <input type="text" value={ssid} onChange={e => setSsid(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Password</label>
               <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
             </div>
             <div className="flex gap-4">
               <div className="w-1/2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Encryption</label>
                  <select value={encryption} onChange={e => setEncryption(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
               </div>
               <div className="w-1/2 flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} className="w-5 h-5 text-slate-600 rounded focus:ring-slate-500" />
                    <span className="text-zinc-700 dark:text-zinc-300">Hidden Network</span>
                  </label>
               </div>
             </div>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
               <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Subject</label>
               <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Body</label>
               <textarea rows={3} value={body} onChange={e => setBody(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none resize-none" />
             </div>
          </div>
        );
      case 'vcard':
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">First Name</label>
                 <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Last Name</label>
                 <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Phone</label>
               <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
               <input type="email" value={vCardEmail} onChange={e => setVCardEmail(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
             </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Organization</label>
                    <input type="text" value={org} onChange={e => setOrg(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Website</label>
                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                </div>
             </div>
          </div>
        );
    }
  };

  const tabs = [
      { id: 'url', icon: <LinkIcon />, label: 'URL' },
      { id: 'text', icon: <DocumentTextIcon />, label: 'Text' },
      { id: 'wifi', icon: <WifiIcon />, label: 'WiFi' },
      { id: 'email', icon: <MailIcon />, label: 'Email' },
      { id: 'vcard', icon: <IdentificationIcon />, label: 'VCard' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-800 dark:bg-white rounded-xl shadow-lg shadow-slate-500/20">
            <QrCodeIcon />
        </div>
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">QR Code Generator</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Create custom QR codes for any purpose.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-7 space-y-6">
            
            {/* Tabs */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-2 border border-zinc-200 dark:border-zinc-700 shadow-sm flex overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setMode(tab.id as QRMode)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                            mode === tab.id 
                            ? 'bg-slate-600 text-white shadow-md' 
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Input */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Content</h3>
                {renderContentInputs()}
            </div>

             {/* Appearance Settings */}
             <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Appearance</h3>
                
                <div className="space-y-6">
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Foreground</label>
                            <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-300 dark:border-zinc-600">
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" />
                                <span className="text-xs font-mono text-zinc-500">{color}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Background</label>
                            <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-300 dark:border-zinc-600">
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" />
                                <span className="text-xs font-mono text-zinc-500">{bgColor}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Logo Upload */}
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Logo Overlay</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-grow cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                <PhotoIcon />
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">Upload Image</span>
                            </label>
                            {logo && (
                                <button onClick={() => setLogo(null)} className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl hover:bg-rose-200 transition-colors">
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                        {logo && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                    <span>Logo Size</span>
                                    <span>{logoSize}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="10" 
                                    max="30" 
                                    value={logoSize} 
                                    onChange={e => setLogoSize(parseInt(e.target.value))} 
                                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                                />
                            </div>
                        )}
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-2 gap-6">
                         <div>
                            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                <span>Margin</span>
                                <span>{margin} blocks</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="5" 
                                value={margin} 
                                onChange={e => setMargin(parseInt(e.target.value))} 
                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                            />
                        </div>
                        <div>
                             <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                <span>Error Correction</span>
                                <span>{errorLevel}</span>
                            </div>
                             <div className="flex bg-zinc-100 dark:bg-zinc-900/50 rounded-lg p-1">
                                {(['L', 'M', 'Q', 'H'] as const).map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setErrorLevel(l)}
                                        className={`flex-1 text-xs font-bold py-1 rounded ${errorLevel === l ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                     
                     {/* Size Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                            <span>Resolution</span>
                            <span>{size}px</span>
                        </div>
                         <input 
                            type="range" 
                            min="200" 
                            max="2000" 
                            step="100"
                            value={size} 
                            onChange={e => setSize(parseInt(e.target.value))} 
                            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                        />
                    </div>

                </div>
            </div>
        </div>

        {/* Right Column: Preview & History */}
        <div className="lg:col-span-5 space-y-8">
           <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    {qrDataUrl ? (
                        <div className="relative group transition-transform duration-300 hover:scale-105">
                           <div className="bg-white p-4 rounded-xl shadow-2xl border border-zinc-100">
                                <img src={qrDataUrl} alt="Generated QR Code" className="max-w-full h-auto" style={{ maxHeight: '350px' }} />
                           </div>
                        </div>
                    ) : (
                        <div className="text-center text-zinc-400">
                           <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <QrCodeIcon />
                           </div>
                           <p className="text-lg font-medium">Enter content to generate</p>
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
                    Download High-Res PNG
                </button>
           </div>

           {history.length > 0 && (
               <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                   <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center justify-between">
                       <span>History</span>
                       <button onClick={() => setHistory([])} className="text-xs text-rose-500 hover:text-rose-600">Clear</button>
                   </h3>
                   <div className="space-y-2">
                       {history.map(h => (
                           <div key={h.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/30 flex justify-between items-center">
                               <div className="min-w-0">
                                   <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{h.name}</p>
                                   <p className="text-xs text-zinc-500 uppercase">{h.mode} • {h.date}</p>
                               </div>
                               <button 
                                  onClick={() => {
                                      // Quick restore partial state logic could go here
                                      // For now just a visual indicator
                                  }}
                                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                               >
                                   <DownloadIcon />
                               </button>
                           </div>
                       ))}
                   </div>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
