
import React, { useState } from 'react';
import { 
  SunIcon, MoonIcon, MenuIcon, ChartBarIcon, CogIcon, CheckCircleIcon,
  HomeIcon, Squares2X2Icon, BuildingStoreIcon, UserGroupIcon, PuzzlePieceIcon, PresentationChartLineIcon,
  CalendarIcon, WalletIcon, ClipboardListIcon, LogOutIcon
} from './Icons';

/**
 * Props for the TopNav component.
 */
interface TopNavProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeView: 'welcome' | 'mmv' | 'ai' | 'branch' | 'seller' | 'comparison' | 'integrations' | 'income_detail' | 'todo';
  onViewChange: (view: 'welcome' | 'mmv' | 'ai' | 'branch' | 'seller' | 'comparison' | 'integrations' | 'income_detail' | 'todo') => void;
  onOpenSettings: () => void;
  isCloudSyncActive?: boolean;
  onLock?: () => void;
}

/**
 * The top navigation bar for the application.
 */
const TopNav: React.FC<TopNavProps> = ({ theme, toggleTheme, activeView, onViewChange, onOpenSettings, isCloudSyncActive, onLock }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleViewClick = (view: 'welcome' | 'mmv' | 'ai' | 'branch' | 'seller' | 'comparison' | 'integrations' | 'income_detail' | 'todo') => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  const getButtonClass = (view: string) => {
    const baseClass = "text-left p-3 rounded-xl transition-all w-full font-medium flex items-center gap-3 text-sm";
    if (activeView === view) {
      return `${baseClass} bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md`;
    }
    return `${baseClass} hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`;
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 mb-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-white transition-colors"
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <MenuIcon />
                </button>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-wider truncate">MMV</div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
               {isCloudSyncActive && (
                   <div className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2 sm:px-3 py-1.5 rounded-full border border-sky-100 dark:border-sky-900/30 animate-pulse">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="hidden sm:inline">Cloud Sync Active</span>
                   </div>
               )}
               <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  <span>Auto-saved</span>
               </div>
               <div className="flex items-center gap-1">
                  <button
                      onClick={onOpenSettings}
                      className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-white transition-colors"
                      aria-label="Open Settings"
                  >
                      <CogIcon />
                  </button>
                  <button
                      onClick={toggleTheme}
                      className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-white transition-colors"
                      aria-label="Toggle theme"
                  >
                      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                  </button>
                  {onLock && (
                      <button
                          onClick={onLock}
                          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                          aria-label="Lock / Sign Out"
                      >
                          <LogOutIcon />
                      </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Sidebar Menu and Overlay */}
      <div 
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Overlay */}
        <div 
          onClick={() => setIsMenuOpen(false)} 
          className="absolute inset-0 bg-black/50"
          aria-hidden="true"
        ></div>
        
        {/* Sidebar */}
        <div 
          className={`relative h-full w-72 bg-gray-50 dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-6 flex-grow overflow-y-auto">
            <div className="flex items-center justify-between mb-8 pl-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Navigation</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <nav className="flex flex-col gap-2">
              {/* 1. Home Page */}
              <button className={getButtonClass('welcome')} onClick={() => handleViewClick('welcome')}>
                <HomeIcon className="w-5 h-5" /> Home Page
              </button>

              {/* 2. Months (Formerly Dashboard/MMV) */}
              <button className={getButtonClass('mmv')} onClick={() => handleViewClick('mmv')}>
                <CalendarIcon className="w-5 h-5" /> Months
              </button>

              {/* 3. AI Dashboard */}
              <button className={getButtonClass('ai')} onClick={() => handleViewClick('ai')}>
                <PresentationChartLineIcon className="w-5 h-5" /> AI Dashboard
              </button>

              {/* 4. Dashboard (Formerly Analytics/Comparison) */}
              <button className={getButtonClass('comparison')} onClick={() => handleViewClick('comparison')}>
                  <Squares2X2Icon className="w-5 h-5" /> Dashboard
              </button>

              {/* 5. Monthly Income (New) */}
              <button className={getButtonClass('income_detail')} onClick={() => handleViewClick('income_detail')}>
                  <WalletIcon className="w-5 h-5" /> Monthly Income(in detail)
              </button>

              {/* 6. Branch Plan */}
              <button className={getButtonClass('branch')} onClick={() => handleViewClick('branch')}>
                <BuildingStoreIcon className="w-5 h-5" /> Branch Plan
              </button>

              {/* 7. Sellers Plan */}
              <button className={getButtonClass('seller')} onClick={() => handleViewClick('seller')}>
                <UserGroupIcon className="w-5 h-5" /> Sellers Plan
              </button>

              {/* 8. Todo List (New) */}
              <button className={getButtonClass('todo')} onClick={() => handleViewClick('todo')}>
                <ClipboardListIcon className="w-5 h-5" /> Todo List
              </button>

              <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
              
              <button className={getButtonClass('integrations')} onClick={() => handleViewClick('integrations')}>
                <PuzzlePieceIcon className="w-5 h-5" /> Integrations
              </button>
            </nav>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-center text-gray-400">Salary & Goal Tracker v9.7</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNav;
