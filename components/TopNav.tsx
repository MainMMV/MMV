
import React, { useState } from 'react';
import { 
  SunIcon, MoonIcon, MenuIcon, ChartBarIcon, CogIcon, CheckCircleIcon,
  HomeIcon, Squares2X2Icon, BuildingStoreIcon, UserGroupIcon, WalletIcon, GlobeAltIcon, PuzzlePieceIcon 
} from './Icons';

/**
 * Props for the TopNav component.
 */
interface TopNavProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeView: 'welcome' | 'mmv' | 'branch' | 'seller' | 'spending' | 'powerful_sites' | 'comparison' | 'integrations';
  onViewChange: (view: 'welcome' | 'mmv' | 'branch' | 'seller' | 'spending' | 'powerful_sites' | 'comparison' | 'integrations') => void;
  onOpenSettings: () => void;
}

/**
 * The top navigation bar for the application.
 */
const TopNav: React.FC<TopNavProps> = ({ theme, toggleTheme, activeView, onViewChange, onOpenSettings }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleViewClick = (view: 'welcome' | 'mmv' | 'branch' | 'seller' | 'spending' | 'powerful_sites' | 'comparison' | 'integrations') => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  const getButtonClass = (view: 'welcome' | 'mmv' | 'branch' | 'seller' | 'spending' | 'powerful_sites' | 'comparison' | 'integrations') => {
    const baseClass = "text-left p-2 rounded-md transition-colors w-full font-medium flex items-center gap-2";
    if (activeView === view) {
      return `${baseClass} bg-zinc-300 dark:bg-zinc-700 font-semibold text-zinc-900 dark:text-white`;
    }
    return `${baseClass} hover:bg-zinc-200 dark:hover:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300`;
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/70 dark:bg-[#28282B]/70 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700/50 mb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:text-zinc-800 dark:hover:text-white transition-colors"
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <MenuIcon />
                </button>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-wider">MMV</div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
               <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  <span>Auto-saved</span>
               </div>
               <button
                  onClick={onOpenSettings}
                  className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:text-zinc-800 dark:hover:text-white transition-colors"
                  aria-label="Open Settings"
              >
                  <CogIcon />
              </button>
              <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:text-zinc-800 dark:hover:text-white transition-colors"
                  aria-label="Toggle theme"
              >
                  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
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
          className={`relative h-full w-64 bg-zinc-100 dark:bg-[#28282B] shadow-xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-8 text-zinc-900 dark:text-white">Menu</h2>
            <nav className="flex flex-col gap-2">
              <button className={getButtonClass('welcome')} onClick={() => handleViewClick('welcome')}>
                <HomeIcon /> Home
              </button>
              <button className={getButtonClass('mmv')} onClick={() => handleViewClick('mmv')}>
                <Squares2X2Icon /> Dashboard
              </button>
              <button className={getButtonClass('comparison')} onClick={() => handleViewClick('comparison')}>
                  <ChartBarIcon /> Comparison
              </button>
              <button className={getButtonClass('branch')} onClick={() => handleViewClick('branch')}>
                <BuildingStoreIcon /> Branch Plan
              </button>
              <button className={getButtonClass('seller')} onClick={() => handleViewClick('seller')}>
                <UserGroupIcon /> Seller View
              </button>
              <button className={getButtonClass('spending')} onClick={() => handleViewClick('spending')}>
                <WalletIcon /> Spending Page
              </button>
              <button className={getButtonClass('powerful_sites')} onClick={() => handleViewClick('powerful_sites')}>
                <GlobeAltIcon /> Powerful Web Sites
              </button>
              <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>
              <button className={getButtonClass('integrations')} onClick={() => handleViewClick('integrations')}>
                <PuzzlePieceIcon /> Integrations
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNav;
