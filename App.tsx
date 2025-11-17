import React, { useState, useEffect, useCallback } from 'react';
import { MonthData, GoalStatus, Goal, StorePlan, FavouriteLink, FavouriteFolder } from './types';
import MonthCard from './components/MonthCard';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import StorePlanView from './components/StorePlanView';
import { PlusIcon } from './components/Icons';
import HomePage from './components/HomePage';
import PowerfulWebSitesPage from './components/WelcomePage';

// Initial sample data for the application, used only if no saved data is found.
const initialData: MonthData[] = [
    {
    id: 'november-2025',
    name: 'November 2025',
    date: '2025-11-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 1, endValue: 41, status: GoalStatus.NOT_STARTED },
      { id: 'g2', name: 'within 10 minutes', progress: 1, endValue: 21, status: GoalStatus.NOT_STARTED },
      { id: 'g3', name: 'within 20 minutes', progress: 1, endValue: 20, status: GoalStatus.NOT_STARTED },
      { id: 'g4', name: 'who rejected', progress: 1, endValue: 71, status: GoalStatus.NOT_STARTED },
      { id: 'g5', name: 'created by sellers', progress: 0, endValue: 153, status: GoalStatus.NOT_STARTED },
    ],
  },
  {
    id: 'december-2025',
    name: 'December 2025',
    date: '2025-12-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 0, endValue: 41, status: GoalStatus.NOT_STARTED },
      { id: 'g2', name: 'within 10 minutes', progress: 0, endValue: 21, status: GoalStatus.NOT_STARTED },
      { id: 'g3', name: 'within 20 minutes', progress: 0, endValue: 20, status: GoalStatus.NOT_STARTED },
      { id: 'g4', name: 'who rejected', progress: 0, endValue: 71, status: GoalStatus.NOT_STARTED },
      { id: 'g5', name: 'created by sellers', progress: 0, endValue: 153, status: GoalStatus.NOT_STARTED },
    ],
  },
  {
    id: 'january-2026',
    name: 'January 2026',
    date: '2026-01-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 0, endValue: 41, status: GoalStatus.NOT_STARTED },
      { id: 'g2', name: 'within 10 minutes', progress: 0, endValue: 21, status: GoalStatus.NOT_STARTED },
      { id: 'g3', name: 'within 20 minutes', progress: 0, endValue: 20, status: GoalStatus.NOT_STARTED },
      { id: 'g4', name: 'who rejected', progress: 0, endValue: 71, status: GoalStatus.NOT_STARTED },
      { id: 'g5', name: 'created by sellers', progress: 0, endValue: 153, status: GoalStatus.NOT_STARTED },
    ],
  },
];

const initialStorePlans: StorePlan[] = [
  { id: 'sp1', name: 'Store Plan', plan100: 3100000000, actualSum: 397366143 },
  { id: 'sp2', name: '1st Decade', plan100: 1033333333, actualSum: 397366143 },
  { id: 'sp3', name: '2nd Decade', plan100: 1033333333, actualSum: 0 },
  { id: 'sp4', name: '3rd Decade', plan100: 1033333333, actualSum: 0 },
];

const initialLinks: FavouriteLink[] = [
  { id: 'l1', title: 'MMV Clock', url: 'https://mmvclock.netlify.app/', description: 'A real-time clock application.', folderId: null },
  { id: 'l2', title: 'MMV JSON', url: 'https://mmvjson.netlify.app/', description: 'A tool for JSON data management.', folderId: null },
];

const initialFolders: FavouriteFolder[] = [];


/**
 * The main component of the application.
 * Manages the state for all month data and handles CRUD operations.
 * Also handles saving and loading data to/from the browser's localStorage.
 */
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'welcome' | 'mmv' | 'branch' | 'seller' | 'powerful_sites'>('welcome');

  const [data, setData] = useState<MonthData[]>(() => {
    try {
      const savedData = localStorage.getItem('salaryGoalTrackerData');
      return savedData ? JSON.parse(savedData) : initialData;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialData;
    }
  });
  
  const [storePlans, setStorePlans] = useState<StorePlan[]>(() => {
    try {
      const savedPlans = localStorage.getItem('storePlansData');
      return savedPlans ? JSON.parse(savedPlans) : initialStorePlans;
    } catch (error) {
      console.error("Error reading store plans from localStorage", error);
      return initialStorePlans;
    }
  });

  const [links, setLinks] = useState<FavouriteLink[]>(() => {
    try {
      const savedLinks = localStorage.getItem('favouriteLinks');
      return savedLinks ? JSON.parse(savedLinks) : initialLinks;
    } catch (error) {
      console.error("Error reading links from localStorage", error);
      return initialLinks;
    }
  });

  const [folders, setFolders] = useState<FavouriteFolder[]>(() => {
    try {
      const savedFolders = localStorage.getItem('favouriteFolders');
      return savedFolders ? JSON.parse(savedFolders) : initialFolders;
    } catch (error) {
      console.error("Error reading folders from localStorage", error);
      return initialFolders;
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('salaryGoalTrackerData', JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem('storePlansData', JSON.stringify(storePlans));
    } catch (error) {
      console.error("Error writing store plans to localStorage", error);
    }
  }, [storePlans]);

  useEffect(() => {
    try {
      localStorage.setItem('favouriteLinks', JSON.stringify(links));
    } catch (error) {
      console.error("Error writing links to localStorage", error);
    }
  }, [links]);

  useEffect(() => {
    try {
      localStorage.setItem('favouriteFolders', JSON.stringify(folders));
    } catch (error) {
      console.error("Error writing folders to localStorage", error);
    }
  }, [folders]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleGoalUpdate = useCallback((monthId: string, goalId: string, updatedValues: Partial<Goal>) => {
    setData(currentData =>
      currentData.map(month => (month.id === monthId ? { ...month, goals: month.goals.map(goal => (goal.id === goalId ? { ...goal, ...updatedValues } : goal)) } : month))
    );
  }, []);
  
  const handleStorePlanUpdate = (planId: string, updatedValues: Partial<StorePlan>) => {
    setStorePlans(currentPlans =>
      currentPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updatedValues } : plan
      )
    );
  };

  const handleUpdateMonth = (monthId: string, updatedValues: Partial<MonthData>) => {
    setData(currentData => currentData.map(month => (month.id === monthId ? { ...month, ...updatedValues } : month)));
  };

  const handleDeleteMonth = (monthId: string) => {
    setData(currentData => currentData.filter(month => month.id !== monthId));
  };
  
  const handleNewMonth = () => {
    setData(currentData => {
        // Find the latest date from the existing data to determine the next month
        const latestDate = currentData.length > 0 
            ? currentData.reduce((max, month) => new Date(month.date) > new Date(max.date) ? month : max).date
            : new Date(2025, 10, 15).toISOString(); // Fallback if no data

        const newMonthDate = new Date(latestDate);
        newMonthDate.setUTCMonth(newMonthDate.getUTCMonth() + 1);
        
        const newMonthName = newMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        const newMonth: MonthData = {
            id: `month-${new Date().getTime()}`,
            name: newMonthName,
            date: newMonthDate.toISOString(),
            goals: [
              { id: 'g1', name: 'within 5 minutes', progress: 0, endValue: 41, status: GoalStatus.NOT_STARTED },
              { id: 'g2', name: 'within 10 minutes', progress: 0, endValue: 21, status: GoalStatus.NOT_STARTED },
              { id: 'g3', name: 'within 20 minutes', progress: 0, endValue: 20, status: GoalStatus.NOT_STARTED },
              { id: 'g4', name: 'who rejected', progress: 0, endValue: 71, status: GoalStatus.NOT_STARTED },
              { id: 'g5', name: 'created by sellers', progress: 0, endValue: 153, status: GoalStatus.NOT_STARTED },
            ],
        };
        
        return [...currentData, newMonth];
    });
  };

  // --- Favourite Links and Folders Handlers ---

  const handleAddOrUpdateLink = (link: Omit<FavouriteLink, 'id'> & { id?: string }) => {
    setLinks(currentLinks => {
      if (link.id) {
        return currentLinks.map(l => l.id === link.id ? { ...l, ...link } : l);
      } else {
        return [...currentLinks, { ...link, id: `l-${Date.now()}` }];
      }
    });
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks(currentLinks => currentLinks.filter(l => l.id !== linkId));
  };

  const handleAddFolder = (name: string) => {
    const newFolder: FavouriteFolder = { id: `f-${Date.now()}`, name };
    setFolders(currentFolders => [...currentFolders, newFolder]);
  };

  const handleUpdateFolder = (folderId: string, updatedValues: Partial<FavouriteFolder>) => {
    setFolders(currentFolders =>
      currentFolders.map(f => (f.id === folderId ? { ...f, ...updatedValues } : f))
    );
  };

  const handleRemoveFolder = (folderId: string) => {
    setFolders(currentFolders => currentFolders.filter(f => f.id !== folderId));
    // Also set links in this folder to be ungrouped
    setLinks(currentLinks => currentLinks.map(l => l.folderId === folderId ? { ...l, folderId: null } : l));
  };


  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        return <HomePage />;
      case 'powerful_sites':
        return <PowerfulWebSitesPage 
          links={links}
          folders={folders}
          onAddOrUpdateLink={handleAddOrUpdateLink}
          onRemoveLink={handleRemoveLink}
          onAddFolder={handleAddFolder}
          onUpdateFolder={handleUpdateFolder}
          onRemoveFolder={handleRemoveFolder}
        />;
      case 'branch':
        return <StorePlanView plans={storePlans} onPlanUpdate={handleStorePlanUpdate} />;
      case 'seller':
        return <div className="text-center p-8"><h2 className="text-2xl font-bold">Seller View Coming Soon</h2></div>;
      case 'mmv':
      default:
        return (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Dashboard</h2>
              <button 
                onClick={handleNewMonth}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-colors text-sm font-semibold"
                aria-label="Create new month"
              >
                <PlusIcon />
                <span>New Month</span>
              </button>
            </div>

            <Dashboard allMonths={data} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {data.map(monthData => (
                <MonthCard 
                  key={monthData.id} 
                  monthData={monthData} 
                  onGoalUpdate={handleGoalUpdate}
                  onUpdateMonth={(updatedValues) => handleUpdateMonth(monthData.id, updatedValues)}
                  onDeleteCard={() => handleDeleteMonth(monthData.id)}
                />
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#28282B] text-zinc-800 dark:text-zinc-200 font-sans transition-colors duration-300">
      <TopNav 
        theme={theme}
        toggleTheme={toggleTheme}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
