
import React, { useRef } from 'react';
import { CloseIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onExport, onImport, onReset }) => {
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
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-700 overflow-hidden"
      >
        <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
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
          {/* Export Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                    <ArrowDownTrayIcon />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Backup Data</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Save your current progress to a file.</p>
                </div>
            </div>
            <button 
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all active:scale-95 border border-zinc-200 dark:border-zinc-600"
            >
              <ArrowDownTrayIcon />
              <span>Download Backup</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                    <ArrowUpTrayIcon />
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">Restore Data</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Load a backup file to restore progress.</p>
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
