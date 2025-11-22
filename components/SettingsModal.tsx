
import React, { useRef, useState } from 'react';
import { CloseIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, FolderIcon, PuzzlePieceIcon, GoogleSheetsIcon, CheckCircleIcon, ExternalLinkIcon } from './Icons';

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
  const [activeTab, setActiveTab] = useState<'general' | 'integrations'>('general');
  
  // Integrations State
  const [integrations, setIntegrations] = useState([
        {
            id: 'google-sheets',
            name: 'Google Sheets',
            description: 'Sync your goal data directly to spreadsheets for analysis.',
            icon: <GoogleSheetsIcon />,
            connected: true,
            type: 'utility'
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Receive daily summary notifications in your team channel.',
            icon: (
                <svg className="h-6 w-6 text-zinc-700 dark:text-zinc-200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
            ),
            connected: false,
            type: 'messaging'
        },
        {
            id: 'google-drive',
            name: 'Google Drive',
            description: 'Sync data to a local file monitored by Google Drive.',
            icon: (
                 <svg className="h-6 w-6 text-zinc-700 dark:text-zinc-200" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M7.784 14l4.22-7.304 2.11-3.653h7.22L12 14H7.784zM6.528 12L2.636 5.26 8.673 2h10.582l-2.166 3.75H9.342L6.528 12zm.844 1.5L2.118 22.5h-.005l6.526.001 10.552.003L13.01 13.5H7.372z"/>
                 </svg>
            ),
            connected: false,
            type: 'storage'
        }
    ]);

    const handleDriveConnection = () => {
        const driveIntegration = integrations.find(i => i.id === 'google-drive');
        if (driveIntegration && !driveIntegration.connected && onConnectFile) {
            onConnectFile();
        } else {
            toggleConnection('google-drive');
        }
    };

    const toggleConnection = (id: string) => {
        setIntegrations(prev => prev.map(integration => {
            if (integration.id === id) {
                return { ...integration, connected: !integration.connected };
            }
            return integration;
        }));
    };


  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
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
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
            >
                General
            </button>
            <button 
                onClick={() => setActiveTab('integrations')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'integrations' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`}
            >
                Integrations
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* Live File Sync */}
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
          )}

          {activeTab === 'integrations' && (
              <div className="space-y-4">
                  <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl p-4 mb-6">
                      <p className="text-sm text-violet-800 dark:text-violet-200">
                          Connect external tools to automate your workflow. Some integrations may require specific setup.
                      </p>
                  </div>

                  {integrations.map((item) => (
                    <div key={item.id} className="bg-zinc-50 dark:bg-zinc-700/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                                {item.icon}
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${item.connected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-600 dark:text-zinc-400'}`}>
                                {item.connected ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-zinc-900 dark:text-white">{item.name}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-4 min-h-[32px]">{item.description}</p>
                        
                        <button
                            onClick={() => item.id === 'google-drive' ? handleDriveConnection() : toggleConnection(item.id)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                                item.connected 
                                ? 'bg-white border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-600 dark:border-zinc-500 dark:text-zinc-200'
                                : 'bg-violet-600 text-white hover:bg-violet-700'
                            }`}
                        >
                            {item.connected ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>
                ))}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
