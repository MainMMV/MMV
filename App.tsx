
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MonthData, GoalStatus, Goal, StorePlan, FavouriteLink, FavouriteFolder, SpendingItem } from './types';
import MonthCard from './components/MonthCard';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import StorePlanView from './components/StorePlanView';
import { PlusIcon, GoogleSheetsIcon, ChevronDownIcon, ChevronRightIcon } from './components/Icons';
import HomePage from './components/HomePage';
import PowerfulWebSitesPage from './components/WelcomePage';
import SpendingPage from './components/SpendingPage';
import ComparisonDashboard from './components/ComparisonDashboard';
import SettingsModal from './components/SettingsModal';
import NewMonthModal from './components/NewMonthModal';
import IntegrationsPage from './components/IntegrationsPage';

// Initial sample data for the application, imported from Incone 2.0.xlsx
const initialData: MonthData[] = [
  {
    id: 'september-2024',
    name: 'September 2024',
    date: '2024-09-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 16, endValue: 16, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 13, endValue: 13, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 12, endValue: 12, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 15, endValue: 15, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 0, endValue: 0, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'october-2024',
    name: 'October 2024',
    date: '2024-10-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 43, endValue: 43, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 22, endValue: 22, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 20, endValue: 20, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 41, endValue: 41, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 0, endValue: 0, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'november-2024',
    name: 'November 2024',
    date: '2024-11-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 63, endValue: 63, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 23, endValue: 23, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 11, endValue: 11, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 71, endValue: 71, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 0, endValue: 0, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'december-2024',
    name: 'December 2024',
    date: '2024-12-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 77, endValue: 77, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 23, endValue: 23, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 25, endValue: 25, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 59, endValue: 59, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 24, endValue: 24, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'january-2025',
    name: 'January 2025',
    date: '2025-01-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 28, endValue: 28, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 15, endValue: 15, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 13, endValue: 13, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 20, endValue: 20, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 118, endValue: 118, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'february-2025',
    name: 'February 2025',
    date: '2025-02-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 27, endValue: 27, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 10, endValue: 10, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 8, endValue: 8, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 11, endValue: 11, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 102, endValue: 102, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'march-2025',
    name: 'March 2025',
    date: '2025-03-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 23, endValue: 23, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 11, endValue: 11, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 6, endValue: 6, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 33, endValue: 33, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 77, endValue: 77, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'april-2025',
    name: 'April 2025',
    date: '2025-04-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 33, endValue: 33, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 19, endValue: 19, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 19, endValue: 19, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 41, endValue: 41, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 61, endValue: 61, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'may-2025',
    name: 'May 2025',
    date: '2025-05-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 20, endValue: 20, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 6, endValue: 6, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 10, endValue: 10, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 36, endValue: 36, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 76, endValue: 76, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'june-2025',
    name: 'June 2025',
    date: '2025-06-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 32, endValue: 32, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 21, endValue: 21, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 11, endValue: 11, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 64, endValue: 64, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 124, endValue: 124, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'august-2025',
    name: 'August 2025',
    date: '2025-08-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 41, endValue: 41, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 14, endValue: 14, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 8, endValue: 8, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 53, endValue: 53, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 153, endValue: 153, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'september-2025',
    name: 'September 2025',
    date: '2025-09-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 40, endValue: 40, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 16, endValue: 16, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 7, endValue: 7, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 60, endValue: 60, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 110, endValue: 110, status: GoalStatus.COMPLETED },
    ],
  },
  {
    id: 'october-2025',
    name: 'October 2025',
    date: '2025-10-15T00:00:00Z',
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 26, endValue: 26, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 16, endValue: 16, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 6, endValue: 6, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 58, endValue: 58, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 94, endValue: 94, status: GoalStatus.COMPLETED },
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

const initialSpending: SpendingItem[] = [];


/**
 * The main component of the application.
 * Manages the state for all month data and handles CRUD operations.
 * Also handles saving and loading data to/from the browser's localStorage.
 */
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'welcome' | 'mmv' | 'branch' | 'seller' | 'spending' | 'powerful_sites' | 'comparison' | 'integrations'>(() => {
      const saved = localStorage.getItem('activeView');
      if (saved && ['welcome', 'mmv', 'branch', 'seller', 'spending', 'powerful_sites', 'comparison', 'integrations'].includes(saved)) {
          return saved as any;
      }
      return 'welcome';
  });

  useEffect(() => {
      localStorage.setItem('activeView', activeView);
  }, [activeView]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  
  // State to track expanded years in the dashboard view
  const [expandedDashboardYears, setExpandedDashboardYears] = useState<Record<number, boolean>>(() => {
      try {
          const saved = localStorage.getItem('expandedDashboardYears');
          return saved ? JSON.parse(saved) : {};
      } catch {
          return {};
      }
  });

  useEffect(() => {
      localStorage.setItem('expandedDashboardYears', JSON.stringify(expandedDashboardYears));
  }, [expandedDashboardYears]);

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

  const [spendingData, setSpendingData] = useState<SpendingItem[]>(() => {
    try {
      const savedSpending = localStorage.getItem('spendingData');
      return savedSpending ? JSON.parse(savedSpending) : initialSpending;
    } catch (error) {
      console.error("Error reading spending data from localStorage", error);
      return initialSpending;
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
    try {
        localStorage.setItem('spendingData', JSON.stringify(spendingData));
    } catch (error) {
        console.error("Error writing spending data to localStorage", error);
    }
  }, [spendingData]);

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
  
  const handleCloneMonth = (monthId: string) => {
    const monthToClone = data.find(m => m.id === monthId);
    if (monthToClone) {
        const clonedGoals = monthToClone.goals.map(g => ({ ...g, progress: 0, status: GoalStatus.NOT_STARTED }));
        
        // Calculate next month date
        const cloneDate = new Date(monthToClone.date);
        cloneDate.setMonth(cloneDate.getMonth() + 1);
        const newMonthName = cloneDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const newMonth: MonthData = {
            ...monthToClone,
            id: `month-${Date.now()}`,
            name: newMonthName,
            date: cloneDate.toISOString(),
            goals: clonedGoals
        };
        setData(prev => [...prev, newMonth]);
    }
  };

  // Calculate existing months to disable them in the picker
  const existingMonths = useMemo(() => {
      const set = new Set<string>();
      data.forEach(month => {
          const d = new Date(month.date);
          set.add(`${d.getFullYear()}-${d.getMonth()}`);
      });
      return set;
  }, [data]);
  
  const handleNewMonth = () => {
      setIsNewMonthModalOpen(true);
  };

  const handleCreateSpecificMonth = (year: number, monthIndex: number) => {
    // Set date to the 15th to avoid timezone month shifting issues
    const newDate = new Date(year, monthIndex, 15);
    const newMonthName = newDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    const newMonth: MonthData = {
        id: `month-${newDate.getTime()}`,
        name: newMonthName,
        date: newDate.toISOString(),
        goals: [
          { id: 'g1', name: 'within 5 minutes', progress: 0, endValue: 41, status: GoalStatus.NOT_STARTED },
          { id: 'g2', name: 'within 10 minutes', progress: 0, endValue: 21, status: GoalStatus.NOT_STARTED },
          { id: 'g3', name: 'within 20 minutes', progress: 0, endValue: 20, status: GoalStatus.NOT_STARTED },
          { id: 'g4', name: 'who rejected', progress: 0, endValue: 71, status: GoalStatus.NOT_STARTED },
          { id: 'g5', name: 'created by sellers', progress: 0, endValue: 153, status: GoalStatus.NOT_STARTED },
        ],
    };
    
    setData(prev => {
        const updatedData = [...prev, newMonth];
        // Sort by date ascending
        return updatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    setIsNewMonthModalOpen(false);
  };

  // --- Grouping Logic for Dashboard ---
  const dashboardGroupedData = useMemo(() => {
      // Sort descending (newest first)
      const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Group by year
      const groups: Record<number, MonthData[]> = {};
      sorted.forEach(month => {
          const year = new Date(month.date).getFullYear();
          if (!groups[year]) groups[year] = [];
          groups[year].push(month);
      });
      
      const years = Object.keys(groups).map(Number).sort((a, b) => b - a); // Descending years
      
      return { groups, years };
  }, [data]);

  // Set default expanded year (latest) on first load or when years change
  useEffect(() => {
      if (dashboardGroupedData.years.length > 0) {
          setExpandedDashboardYears(prev => {
             if (Object.keys(prev).length === 0) {
                 return { [dashboardGroupedData.years[0]]: true };
             } 
             return prev;
          });
      }
  }, [dashboardGroupedData.years]);

  const toggleDashboardYear = (year: number) => {
      setExpandedDashboardYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // --- Data Management Handlers ---

  const handleExportBackup = () => {
      const backup = {
          version: 1,
          timestamp: new Date().toISOString(),
          data: {
            salaryGoalTrackerData: data,
            storePlansData: storePlans,
            favouriteLinks: links,
            favouriteFolders: folders,
            spendingData: spendingData,
            theme: theme
          }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `mmv-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportBackup = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              const backup = JSON.parse(text);
              
              if (backup && backup.data) {
                  if (window.confirm('This will overwrite all current data with the backup. Are you sure?')) {
                      if (backup.data.salaryGoalTrackerData) setData(backup.data.salaryGoalTrackerData);
                      if (backup.data.storePlansData) setStorePlans(backup.data.storePlansData);
                      if (backup.data.favouriteLinks) setLinks(backup.data.favouriteLinks);
                      if (backup.data.favouriteFolders) setFolders(backup.data.favouriteFolders);
                      if (backup.data.spendingData) setSpendingData(backup.data.spendingData);
                      if (backup.data.theme) setTheme(backup.data.theme);
                      alert('Backup restored successfully!');
                      setIsSettingsOpen(false);
                  }
              } else {
                  alert('Invalid backup file format.');
              }
          } catch (err) {
              console.error(err);
              alert('Error parsing backup file.');
          }
      };
      reader.readAsText(file);
  };

  const handleResetAllData = () => {
      if (window.confirm('WARNING: This will delete ALL your data permanently. This action cannot be undone. Are you sure?')) {
          setData(initialData);
          setStorePlans(initialStorePlans);
          setLinks(initialLinks);
          setFolders(initialFolders);
          setSpendingData(initialSpending);
          localStorage.clear();
          alert('All data has been reset.');
          setIsSettingsOpen(false);
      }
  };

  const handleSyncWithSheets = () => {
    // 1. Generate Styled HTML for all data
    const styles = `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; padding: 20px; }
        .month-container { margin-bottom: 40px; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #3f3f46; color: white; padding: 15px; font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { background-color: #f4f4f5; color: #3f3f46; border: 1px solid #e4e4e7; padding: 10px; text-align: center; font-weight: bold; }
        td { border: 1px solid #e4e4e7; padding: 8px; color: #18181b; vertical-align: middle; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .text-emerald { color: #059669; }
        .text-rose { color: #e11d48; }
        .bg-gray { background-color: #fafafa; }
        .total-row { background-color: #f4f4f5; font-weight: bold; }
      </style>
    `;

    let tablesHtml = '';

    data.forEach(month => {
        // Logic duplicated from MonthCard to ensure consistent data export
        const rows = month.goals.map(goal => {
             const getSalaryMultiplier = (goalName: string): number => {
                const lowerCaseName = goalName.toLowerCase();
                switch (lowerCaseName) {
                  case 'within 5 minutes': return 20000;
                  case 'within 10 minutes': return 12000;
                  case 'within 20 minutes': return 5000;
                  case 'who rejected': return 5000;
                  case 'created by sellers': return 12000;
                  default: return 0;
                }
             };

             const multiplier = getSalaryMultiplier(goal.name);
             const salary = goal.progress * multiplier;
             const percentage = goal.endValue > 0 ? (goal.progress / goal.endValue) * 100 : 0;
             
             return { ...goal, salary, percentage };
        });

        const totalSalary = rows.reduce((sum, r) => sum + r.salary, 0);
        const tax = totalSalary * 0.12;
        const net = totalSalary - tax;

        const tableRows = rows.map(r => `
            <tr>
                <td class="text-left font-bold">${r.name}</td>
                <td class="text-center font-bold">${r.progress}</td>
                <td class="text-center">${r.endValue}</td>
                <td class="text-center">${r.percentage.toFixed(2)}%</td>
                <td class="text-right text-emerald font-bold">${r.salary.toLocaleString('en-US')}</td>
            </tr>
        `).join('');

        tablesHtml += `
            <div class="month-container">
                <div class="header">${month.name}</div>
                <table>
                    <thead>
                        <tr>
                            <th class="text-left">Goal Name</th>
                            <th>Current</th>
                            <th>Target</th>
                            <th>Progress</th>
                            <th class="text-right">Salary</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="4" class="text-right">Total Gross:</td>
                            <td class="text-right text-emerald">${totalSalary.toLocaleString('en-US')}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="4" class="text-right" style="color: #71717a; font-size: 0.9em;">Tax (12%):</td>
                            <td class="text-right text-rose" style="font-size: 0.9em;">-${tax.toLocaleString('en-US')}</td>
                        </tr>
                        <tr class="total-row" style="font-size: 1.1em; background-color: #e4e4e7;">
                            <td colspan="4" class="text-right">Net Salary:</td>
                            <td class="text-right text-emerald">${net.toLocaleString('en-US')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    });

    const fullHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                  <x:ExcelWorksheet>
                    <x:Name>Full Report</x:Name>
                    <x:WorksheetOptions>
                      <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                  </x:ExcelWorksheet>
                </x:ExcelWorksheets>
              </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            ${styles}
        </head>
        <body>
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #18181b;">Salary & Goal Tracker - Full Report</h1>
            <p style="margin-bottom: 20px; color: #71717a;">Generated on ${new Date().toLocaleDateString()}</p>
            ${tablesHtml}
        </body>
        </html>
    `;

    // 2. Download as .xls
    const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Salary_Tracker_Full_Report_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // --- Spending Handlers ---
  const handleAddSpending = (item: Omit<SpendingItem, 'id'>) => {
    const newItem = { ...item, id: `spend-${Date.now()}` };
    setSpendingData(prev => [newItem, ...prev]);
  };

  const handleDeleteSpending = (id: string) => {
    setSpendingData(prev => prev.filter(item => item.id !== id));
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
      case 'spending':
        return <SpendingPage items={spendingData} onAdd={handleAddSpending} onDelete={handleDeleteSpending} />;
      case 'comparison':
        return <ComparisonDashboard allMonths={data} />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'mmv':
      default:
        return (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Dashboard</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSyncWithSheets}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-colors text-sm font-semibold"
                  aria-label="Sync with Google Sheets"
                >
                  <GoogleSheetsIcon />
                  <span>Sync with Sheets</span>
                </button>
                <button 
                  onClick={handleNewMonth}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-colors text-sm font-semibold"
                  aria-label="Create new month"
                >
                  <PlusIcon />
                  <span>New Month</span>
                </button>
              </div>
            </div>

            <Dashboard allMonths={data} />
            
            <div className="space-y-8">
                {dashboardGroupedData.years.map(year => (
                    <div key={year} className="animate-fade-in">
                        <button 
                            onClick={() => toggleDashboardYear(year)}
                            className="flex items-center gap-3 w-full mb-4 group"
                        >
                            <div className={`p-1 rounded-md transition-colors ${expandedDashboardYears[year] ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                                {expandedDashboardYears[year] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {year}
                            </h3>
                            <div className="h-px flex-grow bg-zinc-200 dark:bg-zinc-700 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors"></div>
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                                {dashboardGroupedData.groups[year].length} Months
                            </span>
                        </button>

                        {expandedDashboardYears[year] && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 items-start">
                                {dashboardGroupedData.groups[year].map(monthData => (
                                    <MonthCard 
                                      key={monthData.id} 
                                      monthData={monthData} 
                                      onGoalUpdate={handleGoalUpdate}
                                      onUpdateMonth={(updatedValues) => handleUpdateMonth(monthData.id, updatedValues)}
                                      onDeleteCard={() => handleDeleteMonth(monthData.id)}
                                      onCloneCard={() => handleCloneMonth(monthData.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
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
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
        onReset={handleResetAllData}
      />
      <NewMonthModal 
        isOpen={isNewMonthModalOpen}
        onClose={() => setIsNewMonthModalOpen(false)}
        onSelectMonth={handleCreateSpecificMonth}
        existingMonths={existingMonths}
      />
    </div>
  );
};

export default App;
