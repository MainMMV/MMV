
import React, { useRef } from 'react';
import { CloseIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, FolderIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onConnectFile?: () => void;
  isFileConnected?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onExport, onImport, onReset, onConnectFile, isFileConnected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Data Management</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Live File Sync Section (New) */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-lg">
                   <FolderIcon />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Live File Sync</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Sync with Google Drive, Dropbox, etc.</p>
                </div>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/10 rounded-lg p-3 text-xs text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/30 mb-2">
                Open a file in your Google Drive folder to enable auto-syncing.
            </div>
            <button 
              onClick={onConnectFile}
              disabled={isFileConnected}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all active:scale-95 border ${
                  isFileConnected 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30' 
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-600 border-zinc-200 dark:border-zinc-600'
              }`}
            >
              <FolderIcon />
              <span>{isFileConnected ? "File Connected & Syncing" : "Open File to Sync"}</span>
            </button>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700"></div>

          {/* Export Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                    <ArrowDownTrayIcon />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Manual Backup</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Download a copy of your data.</p>
                </div>
            </div>
            <button 
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all active:scale-95 border border-zinc-200 dark:border-zinc-600"
            >
              <ArrowDownTrayIcon />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                    <ArrowUpTrayIcon />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Restore Backup</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Load a JSON file to restore progress.</p>
                </div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
            />
            <button 
              onClick={triggerFileInput}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all active:scale-95 border border-zinc-200 dark:border-zinc-600"
            >
              <ArrowUpTrayIcon />
              <span>Select Backup File</span>
            </button>
          </div>

           {/* Reset Section */}
           <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
             <div className="space-y-3">
                <h3 className="font-semibold text-rose-600 dark:text-rose-400 text-sm uppercase tracking-wider">Danger Zone</h3>
                <button 
                  onClick={onReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl font-medium hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all active:scale-95 border border-rose-200 dark:border-rose-900/30"
                >
                  <TrashIcon />
                  <span>Clear All Data</span>
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
