
import React, { useState } from 'react';
import { 
  SunIcon, MoonIcon, MenuIcon, ChartBarIcon, CogIcon, CheckCircleIcon,
  HomeIcon, Squares2X2Icon, BuildingStoreIcon, UserGroupIcon, PuzzlePieceIcon, PresentationChartLineIcon,
  CalendarIcon, WalletIcon, ClipboardListIcon, LogOutIcon, SaveIcon, CloseIcon
} from './Icons';

interface TopNavProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeView: 'welcome' | 'mmv' | 'ai' | 'branch' | 'seller' | 'comparison' | 'integrations' | 'income_detail' | 'todo';
  onViewChange: (view: any) => void;
  onOpenSettings: () => void;
  onManualSave: () => void;
  isCloudSyncActive?: boolean;
  onLock?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ theme, toggleTheme, activeView, onViewChange, onOpenSettings, onManualSave, isCloudSyncActive, onLock }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleManualSave = async () => {
    setIsSaving(true);
    await onManualSave();
    setTimeout(() => setIsSaving(false), 1500);
  };

  const getButtonClass = (view: string) => {
    const baseClass = "text-left p-3 rounded-xl transition-all w-full font-medium flex items-center gap-3 text-sm";
    if (activeView === view) {
      return `${baseClass} bg-indigo-600 text-white shadow-lg shadow-indigo-500/20`;
    }
    return `${baseClass} hover:bg-gray-800 text-gray-400 hover:text-white`;
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center">
        <div className="w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl text-gray-400 hover:bg-white/5 transition-colors">
                  <MenuIcon />
              </button>
              <div className="text-xl font-black text-white tracking-tighter">MMV<span className="text-indigo-500 text-sm ml-1 font-medium">PRO</span></div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             {isCloudSyncActive && (
                 <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      <span className="hidden sm:inline uppercase">Cloud Sync</span>
                 </div>
             )}
             
             <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    aria-label="Settings"
                >
                    <CogIcon />
                </button>
                
                <button
                    onClick={handleManualSave}
                    className={`p-2 rounded-xl transition-all ${isSaving ? 'text-emerald-400 scale-110' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    aria-label="Save Changes"
                >
                    <SaveIcon className={isSaving ? 'animate-bounce' : ''} />
                </button>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>

                {onLock && (
                    <button
                        onClick={onLock}
                        className="p-2 rounded-xl text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                    >
                        <LogOutIcon />
                    </button>
                )}
             </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar Navigation */}
      <div className={`fixed inset-0 z-30 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div onClick={() => setIsMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className={`relative h-full w-72 bg-[#0f172a] shadow-2xl transition-transform duration-500 ease-out flex flex-col border-r border-white/5 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex-grow overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Navigation</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-white">
                 <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button className={getButtonClass('welcome')} onClick={() => { onViewChange('welcome'); setIsMenuOpen(false); }}>
                <HomeIcon className="w-5 h-5" /> Home Page
              </button>
              <button className={getButtonClass('mmv')} onClick={() => { onViewChange('mmv'); setIsMenuOpen(false); }}>
                <CalendarIcon className="w-5 h-5" /> Months
              </button>
              <button className={getButtonClass('todo')} onClick={() => { onViewChange('todo'); setIsMenuOpen(false); }}>
                <ClipboardListIcon className="w-5 h-5" /> Todo List
              </button>
              <button className={getButtonClass('ai')} onClick={() => { onViewChange('ai'); setIsMenuOpen(false); }}>
                <PresentationChartLineIcon className="w-5 h-5" /> AI Dashboard
              </button>
              <button className={getButtonClass('comparison')} onClick={() => { onViewChange('comparison'); setIsMenuOpen(false); }}>
                  <Squares2X2Icon className="w-5 h-5" /> Analytics
              </button>
              <button className={getButtonClass('income_detail')} onClick={() => { onViewChange('income_detail'); setIsMenuOpen(false); }}>
                  <WalletIcon className="h-5 w-5" /> Monthly Income
              </button>
              <button className={getButtonClass('branch')} onClick={() => { onViewChange('branch'); setIsMenuOpen(false); }}>
                <BuildingStoreIcon className="w-5 h-5" /> Branch Plan
              </button>
              <button className={getButtonClass('seller')} onClick={() => { onViewChange('seller'); setIsMenuOpen(false); }}>
                <UserGroupIcon className="w-5 h-5" /> Sellers Plan
              </button>
              <div className="border-t border-white/5 my-4"></div>
              <button className={getButtonClass('integrations')} onClick={() => { onViewChange('integrations'); setIsMenuOpen(false); }}>
                <PuzzlePieceIcon className="w-5 h-5" /> Integrations
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNav;