import React, { useState, useEffect } from 'react';
import { PuzzlePieceIcon, CheckCircleIcon, ExternalLinkIcon, FolderIcon } from './Icons';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    connected: boolean;
    type: 'storage' | 'messaging' | 'analytics' | 'utility' | 'external';
    url?: string;
}

interface IntegrationsPageProps {
    onConnectDrive?: () => void;
    isConnected: boolean;
}

const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ onConnectDrive, isConnected }) => {
    const [integrations, setIntegrations] = useState<Integration[]>([
        {
            id: 'slack',
            name: 'Slack',
            description: 'Receive daily summary notifications in your team channel.',
            icon: (
                <svg className="h-8 w-8 text-zinc-700 dark:text-zinc-200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
            ),
            connected: false,
            type: 'messaging'
        },
        {
            id: 'google-drive',
            name: 'Google Drive (via Desktop)',
            description: 'Sync data to a local file monitored by Google Drive.',
            icon: (
                 <svg className="h-8 w-8 text-zinc-700 dark:text-zinc-200" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M7.784 14l4.22-7.304 2.11-3.653h7.22L12 14H7.784zM6.528 12L2.636 5.26 8.673 2h10.582l-2.166 3.75H9.342L6.528 12zm.844 1.5L2.118 22.5h-.005l6.526.001 10.552.003L13.01 13.5H7.372z"/>
                 </svg>
            ),
            connected: isConnected,
            type: 'storage'
        }
    ]);

    useEffect(() => {
        setIntegrations(prev => prev.map(i => {
            if (i.id === 'google-drive') {
                return { ...i, connected: isConnected };
            }
            return i;
        }));
    }, [isConnected]);

    const handleDriveConnection = () => {
        const driveIntegration = integrations.find(i => i.id === 'google-drive');
        if (driveIntegration && !driveIntegration.connected && onConnectDrive) {
            onConnectDrive();
        } else if (driveIntegration && driveIntegration.connected) {
             // To "disconnect" from drive here, we usually just clear the handle in App.tsx
             // but we'll stick to triggering the connection for now.
             onConnectDrive && onConnectDrive();
        }
    };

    const toggleConnection = (id: string) => {
        if (id === 'google-drive') {
            handleDriveConnection();
            return;
        }
        setIntegrations(prev => prev.map(integration => {
            if (integration.id === id) {
                return { ...integration, connected: !integration.connected };
            }
            return integration;
        }));
    };

    return (
        <div className="w-full mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-violet-600 rounded-xl shadow-lg shadow-violet-500/20">
                    <PuzzlePieceIcon />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Integrations</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Connect your workspace with external tools.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-xl">
                                {item.icon}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${item.connected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                                {item.connected ? (
                                    <><CheckCircleIcon className="w-3 h-3" /> Connected</>
                                ) : (
                                    'Disconnected'
                                )}
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{item.name}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 h-10">{item.description}</p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => toggleConnection(item.id)}
                                className={`flex-grow py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                    item.connected 
                                    ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                                    : 'bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20'
                                }`}
                            >
                                {item.connected ? (item.id === 'google-drive' ? 'Reconnect' : 'Disconnect') : 'Connect'}
                            </button>
                            
                            {item.connected && item.url && (
                                <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center px-4 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                                    title="Open Portal"
                                >
                                    <ExternalLinkIcon />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Placeholder for "Add More" */}
                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[200px] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-violet-500 transition-colors mb-4">
                        <PuzzlePieceIcon />
                    </div>
                    <h3 className="font-semibold text-zinc-600 dark:text-zinc-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Request Integration</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Don't see what you need?</p>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPage;