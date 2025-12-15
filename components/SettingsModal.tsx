
import React, { useState } from 'react';
import { CloseIcon, FolderIcon, GoogleSheetsIcon, CheckCircleIcon, ExternalLinkIcon, PhotoIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectFile?: () => void;
  isFileConnected?: boolean;
  currentFont?: string;
  setFont?: (font: string) => void;
  currentTheme?: string;
  setTheme?: (theme: string) => void;
}

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  type: string;
  url?: string;
}

const FONTS = [
    { name: 'Inter', family: 'Inter' },
    { name: 'Roboto', family: 'Roboto' },
    { name: 'Open Sans', family: 'Open Sans' },
    { name: 'Lato', family: 'Lato' },
    { name: 'Poppins', family: 'Poppins' },
    { name: 'Montserrat', family: 'Montserrat' },
    { name: 'Raleway', family: 'Raleway' },
    { name: 'Oswald', family: 'Oswald' },
    { name: 'Source Sans', family: 'Source Sans 3' },
    { name: 'Merriweather', family: 'Merriweather' },
    { name: 'Playfair', family: 'Playfair Display' },
    { name: 'Nunito', family: 'Nunito' },
    { name: 'Ubuntu', family: 'Ubuntu' },
    { name: 'Quicksand', family: 'Quicksand' },
    { name: 'Mono', family: 'Space Mono' },
];

const THEMES = [
    { id: 'emerald', name: 'Emerald', colors: ['#ecfdf5', '#a7f3d0', '#34d399', '#059669'] },
    { id: 'blue', name: 'Blue', colors: ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb'] },
    { id: 'indigo', name: 'Indigo', colors: ['#eef2ff', '#c7d2fe', '#818cf8', '#4f46e5'] },
    { id: 'violet', name: 'Violet', colors: ['#f5f3ff', '#ddd6fe', '#a78bfa', '#7c3aed'] },
    { id: 'purple', name: 'Purple', colors: ['#faf5ff', '#e9d5ff', '#c084fc', '#9333ea'] },
    { id: 'fuchsia', name: 'Fuchsia', colors: ['#fdf4ff', '#f0abfc', '#e879f9', '#c026d3'] },
    { id: 'pink', name: 'Pink', colors: ['#fdf2f8', '#fbcfe8', '#f472b6', '#db2777'] },
    { id: 'rose', name: 'Rose', colors: ['#fff1f2', '#fecdd3', '#fb7185', '#e11d48'] },
    { id: 'orange', name: 'Orange', colors: ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c'] },
    { id: 'amber', name: 'Amber', colors: ['#fffbeb', '#fde68a', '#fbbf24', '#d97706'] },
    { id: 'yellow', name: 'Yellow', colors: ['#fefce8', '#fef08a', '#facc15', '#ca8a04'] },
    { id: 'lime', name: 'Lime', colors: ['#f7fee7', '#d9f99d', '#a3e635', '#65a30d'] },
    { id: 'teal', name: 'Teal', colors: ['#f0fdfa', '#99f6e4', '#2dd4bf', '#0d9488'] },
    { id: 'cyan', name: 'Cyan', colors: ['#ecfeff', '#a5f3fc', '#22d3ee', '#0891b2'] },
    { id: 'sky', name: 'Sky', colors: ['#f0f9ff', '#bae6fd', '#38bdf8', '#0284c7'] },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConnectFile, isFileConnected, currentFont = 'Inter', setFont, currentTheme = 'emerald', setTheme }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'integrations'>('general');
  
  // Integrations State
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
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
                <svg className="h-6 w-6 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
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
                 <svg className="h-6 w-6 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
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

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
                General
            </button>
            <button 
                onClick={() => setActiveTab('appearance')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'appearance' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
                Appearance
            </button>
            <button 
                onClick={() => setActiveTab('integrations')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'integrations' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
                Integrations
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* Live File Sync */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-lg">
                       <FolderIcon />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Live File Sync</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sync with Google Drive, Dropbox, etc.</p>
                    </div>
                </div>
                <button 
                  onClick={onConnectFile}
                  disabled={isFileConnected}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all active:scale-95 border ${
                      isFileConnected 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <FolderIcon />
                  <span>{isFileConnected ? "File Connected & Syncing" : "Open File to Sync"}</span>
                </button>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                      Live sync is active. Your data is automatically saved to your connected file.
                  </p>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
              <div className="space-y-8">
                  {/* Font Selection */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                          <span className="p-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Aa</span> Font Family
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                          {FONTS.map(font => (
                              <button
                                  key={font.family}
                                  onClick={() => setFont && setFont(font.family)}
                                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                                      currentFont === font.family
                                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-900 dark:border-white'
                                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  style={{ fontFamily: font.family }}
                              >
                                  {font.name}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Theme Selection */}
                  <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                          <PhotoIcon className="w-4 h-4" /> Color Theme
                      </h3>
                      <div className="grid grid-cols-5 gap-3">
                          {THEMES.map(theme => (
                              <button
                                  key={theme.id}
                                  onClick={() => setTheme && setTheme(theme.id)}
                                  className={`group relative flex flex-col items-center gap-2 rounded-xl p-2 border transition-all ${
                                      currentTheme === theme.id
                                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500 shadow-sm'
                                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                  }`}
                              >
                                  <div className="w-full h-8 rounded-lg overflow-hidden flex shadow-sm">
                                      {theme.colors.map(c => (
                                          <div key={c} style={{ backgroundColor: c }} className="flex-1 h-full"></div>
                                      ))}
                                  </div>
                                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{theme.name}</span>
                                  
                                  {currentTheme === theme.id && (
                                      <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                                          <svg className="w-2 h-2 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                      </div>
                                  )}
                              </button>
                          ))}
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
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                {item.icon}
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${item.connected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
                                {item.connected ? (
                                    <><CheckCircleIcon className="w-3 h-3" /> Connected</>
                                ) : (
                                    'Disconnected'
                                )}
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 min-h-[32px]">{item.description}</p>
                        
                        <button
                            onClick={() => item.id === 'google-drive' ? handleDriveConnection() : toggleConnection(item.id)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                                item.connected 
                                ? 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200'
                                : 'bg-violet-600 text-white hover:bg-violet-700'
                            }`}
                        >
                            {item.connected ? 'Disconnect' : 'Connect'}
                        </button>
                        
                        {item.connected && item.url && (
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-4 mt-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                                title="Open Portal"
                            >
                                <ExternalLinkIcon />
                            </a>
                        )}
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
