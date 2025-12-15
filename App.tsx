
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MonthData, GoalStatus, Goal, StorePlan, Seller } from './types.ts';
import MonthCard from './components/MonthCard.tsx';
import TopNav from './components/TopNav.tsx';
import Dashboard from './components/Dashboard.tsx';
import StorePlanView from './components/StorePlanView.tsx';
import { PlusIcon, GoogleSheetsIcon, ChevronDownIcon, ChevronRightIcon, FolderIcon } from './components/Icons.tsx';
import HomePage from './components/HomePage.tsx';
import ComparisonDashboard from './components/ComparisonDashboard.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import NewMonthModal from './components/NewMonthModal.tsx';
import IntegrationsPage from './components/IntegrationsPage.tsx';
import SellerView from './components/SellerView.tsx';
import AIDashboard from './components/AIDashboard.tsx';
import MonthlyIncomeView from './components/MonthlyIncomeView.tsx';

// Initial sample data for the application
const initialData: MonthData[] = [
  {
    id: 'september-2025',
    name: 'September 2025',
    date: '2025-09-30T12:00:00Z', // End of month for past
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 40, endValue: 40, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 16, endValue: 16, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 7, endValue: 7, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 60, endValue: 60, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 110, endValue: 110, status: GoalStatus.COMPLETED },
    ],
    salary65: 1820000,
    salary35: 980000,
    manualBonus: 1900800
  },
  {
    id: 'october-2025',
    name: 'October 2025',
    date: '2025-10-31T12:00:00Z', // End of month for past (relative to now in sample)
    goals: [
      { id: 'g1', name: 'within 5 minutes', progress: 26, endValue: 40, status: GoalStatus.COMPLETED },
      { id: 'g2', name: 'within 10 minutes', progress: 16, endValue: 16, status: GoalStatus.COMPLETED },
      { id: 'g3', name: 'within 20 minutes', progress: 6, endValue: 7, status: GoalStatus.COMPLETED },
      { id: 'g4', name: 'who rejected', progress: 58, endValue: 60, status: GoalStatus.COMPLETED },
      { id: 'g5', name: 'created by sellers', progress: 94, endValue: 110, status: GoalStatus.COMPLETED },
    ],
    salary65: 1820000,
    salary35: 980000,
    manualBonus: 1906320
  },
];

const initialStorePlans: StorePlan[] = [
  { id: 'sp1', name: 'Store Plan', plan100: 3100000000, actualSum: 397366143 },
  { id: 'sp2', name: '1st Decade', plan100: 1033333333, actualSum: 397366143 },
  { id: 'sp3', name: '2nd Decade', plan100: 1033333333, actualSum: 0 },
  { id: 'sp4', name: '3rd Decade', plan100: 1033333333, actualSum: 0 },
];

const initialSellers: Seller[] = [
    {
        id: 's1',
        name: 'John Doe',
        totalFact: 845572497,
        totalPlan: 500000000,
        totalCount: 221,
        bonus: 4594566,
        ceFact: 210345970,
        cePlan: 300000000,
        tcFact: 535093390,
        tcPlan: 200000000
    },
    {
        id: 's2',
        name: 'Jane Smith',
        totalFact: 800850752,
        totalPlan: 500000000,
        totalCount: 228,
        bonus: 2915008,
        ceFact: 330926135,
        cePlan: 300000000,
        tcFact: 441727026,
        tcPlan: 200000000
    }
];

// Define Theme Palette Mappings
// These map the 'emerald' values (used as default in components) to the selected theme's values
const THEME_PALETTES: Record<string, any> = {
    emerald: null, // Default, no override needed
    blue: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
        500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a'
    },
    indigo: {
        50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
        500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81'
    },
    violet: {
        50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
        500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95'
    },
    purple: {
        50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
        500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87'
    },
    fuchsia: {
        50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9',
        500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75'
    },
    pink: {
        50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6',
        500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843'
    },
    rose: {
        50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
        500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337'
    },
    orange: {
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
        500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12'
    },
    amber: {
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
        500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f'
    },
    yellow: {
        50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
        500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12'
    },
    lime: {
        50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
        500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314'
    },
    teal: {
        50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
        500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a'
    },
    cyan: {
        50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
        500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63'
    },
    sky: {
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
        500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e'
    },
};

/**
 * The main component of the application.
 * Manages the state for all month data and handles CRUD operations.
 */
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'welcome' | 'mmv' | 'ai' | 'branch' | 'seller' | 'comparison' | 'integrations' | 'income_detail'>('welcome');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [fileHandle, setFileHandle] = useState<any>(null); // FileSystemFileHandle
  
  // State to track expanded years in the dashboard view
  const [expandedDashboardYears, setExpandedDashboardYears] = useState<Record<number, boolean>>({});

  const [data, setData] = useState<MonthData[]>(initialData);
  const [storePlans, setStorePlans] = useState<StorePlan[]>(initialStorePlans);
  const [sellers, setSellers] = useState<Seller[]>(initialSellers);

  // Theme & Appearance State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });
  
  const [appFont, setAppFont] = useState(() => localStorage.getItem('appFont') || 'Inter');
  const [appThemeColor, setAppThemeColor] = useState(() => localStorage.getItem('appThemeColor') || 'emerald');

  // Only persist theme to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist font
  useEffect(() => {
      localStorage.setItem('appFont', appFont);
  }, [appFont]);

  // Persist Theme Color and Apply Styles
  useEffect(() => {
      localStorage.setItem('appThemeColor', appThemeColor);
      
      const palette = THEME_PALETTES[appThemeColor];
      const styleId = 'dynamic-theme-styles';
      let styleTag = document.getElementById(styleId);
      
      if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = styleId;
          document.head.appendChild(styleTag);
      }

      if (palette) {
          // Override default 'emerald' classes with selected theme colors
          styleTag.innerHTML = `
            .text-emerald-50 { color: ${palette[50]} !important; }
            .text-emerald-100 { color: ${palette[100]} !important; }
            .text-emerald-200 { color: ${palette[200]} !important; }
            .text-emerald-300 { color: ${palette[300]} !important; }
            .text-emerald-400 { color: ${palette[400]} !important; }
            .text-emerald-500 { color: ${palette[500]} !important; }
            .text-emerald-600 { color: ${palette[600]} !important; }
            .text-emerald-700 { color: ${palette[700]} !important; }
            .text-emerald-800 { color: ${palette[800]} !important; }
            .text-emerald-900 { color: ${palette[900]} !important; }

            .bg-emerald-50 { background-color: ${palette[50]} !important; }
            .bg-emerald-100 { background-color: ${palette[100]} !important; }
            .bg-emerald-200 { background-color: ${palette[200]} !important; }
            .bg-emerald-300 { background-color: ${palette[300]} !important; }
            .bg-emerald-400 { background-color: ${palette[400]} !important; }
            .bg-emerald-500 { background-color: ${palette[500]} !important; }
            .bg-emerald-600 { background-color: ${palette[600]} !important; }
            .bg-emerald-700 { background-color: ${palette[700]} !important; }
            .bg-emerald-800 { background-color: ${palette[800]} !important; }
            .bg-emerald-900 { background-color: ${palette[900]} !important; }

            .border-emerald-50 { border-color: ${palette[50]} !important; }
            .border-emerald-100 { border-color: ${palette[100]} !important; }
            .border-emerald-200 { border-color: ${palette[200]} !important; }
            .border-emerald-300 { border-color: ${palette[300]} !important; }
            .border-emerald-400 { border-color: ${palette[400]} !important; }
            .border-emerald-500 { border-color: ${palette[500]} !important; }
            .border-emerald-600 { border-color: ${palette[600]} !important; }
            .border-emerald-700 { border-color: ${palette[700]} !important; }
            
            .from-emerald-500 { --tw-gradient-from: ${palette[500]} !important; }
            .from-emerald-600 { --tw-gradient-from: ${palette[600]} !important; }
            .to-emerald-500 { --tw-gradient-to: ${palette[500]} !important; }
            
            .shadow-emerald-500\/20 { --tw-shadow-color: ${palette[500]}33 !important; }
            
            /* Specific overrides for opacities used in app */
            .bg-emerald-50\/30 { background-color: ${palette[50]}4D !important; }
            .bg-emerald-50\/50 { background-color: ${palette[50]}80 !important; }
            .bg-emerald-100\/50 { background-color: ${palette[100]}80 !important; }
            .bg-emerald-500\/10 { background-color: ${palette[500]}1A !important; }
            .bg-emerald-500\/20 { background-color: ${palette[500]}33 !important; }
            .bg-emerald-900\/20 { background-color: ${palette[900]}33 !important; }
            .bg-emerald-900\/30 { background-color: ${palette[900]}4D !important; }
            .bg-emerald-50\/20 { background-color: ${palette[50]}33 !important; }
            .bg-emerald-900\/5 { background-color: ${palette[900]}0D !important; }
            .bg-emerald-900\/10 { background-color: ${palette[900]}1A !important; }
          `;
      } else {
          styleTag.innerHTML = ''; // Clear overrides for default
      }

  }, [appThemeColor]);

  // --- Cloud / File System Sync Logic ---
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref for hidden file input (Mobile fallback)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateBackupJSON = useCallback(() => {
    return JSON.stringify({
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
            salaryGoalTrackerData: data,
            storePlansData: storePlans,
            sellersData: sellers,
            theme: theme,
            appFont: appFont,
            appThemeColor: appThemeColor
        }
    }, null, 2);
  }, [data, storePlans, sellers, theme, appFont, appThemeColor]);

  // Auto-save to file handle if connected (Desktop only)
  useEffect(() => {
    if (!fileHandle) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
        try {
            const writable = await fileHandle.createWritable();
            const content = generateBackupJSON();
            await writable.write(content);
            await writable.close();
            console.log("Auto-saved to file.");
        } catch (err) {
            console.error("Failed to auto-save to file:", err);
        }
    }, 2000); 

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, storePlans, sellers, theme, fileHandle, generateBackupJSON]);

  const loadDataFromText = (text: string) => {
      try {
          // Handle empty files
          if (!text.trim()) {
              alert("File is empty. Using current app data.");
              return true; // Return true to signal success (handled)
          }

          const backup = JSON.parse(text);
          if (backup && backup.data) {
              if (window.confirm("Do you want to LOAD data from this file? Cancel to overwrite file with current App data.")) {
                if (backup.data.salaryGoalTrackerData) setData(backup.data.salaryGoalTrackerData);
                if (backup.data.storePlansData) setStorePlans(backup.data.storePlansData);
                if (backup.data.sellersData) setSellers(backup.data.sellersData);
                if (backup.data.theme) setTheme(backup.data.theme);
                if (backup.data.appFont) setAppFont(backup.data.appFont);
                if (backup.data.appThemeColor) setAppThemeColor(backup.data.appThemeColor);
                alert("Data loaded successfully!");
              } else {
                alert("Keeping current data. It will be saved to the file.");
              }
              return true;
          } else {
              alert("Invalid file format.");
              return false;
          }
      } catch (e) {
          console.error(e);
          alert("Error parsing file.");
          return false;
      }
  };

  const handleConnectFile = async () => {
      // Check for File System Access API support (Desktop Chrome/Edge)
      // @ts-ignore
      if (window.showOpenFilePicker) {
          try {
              // @ts-ignore
              const [handle] = await window.showOpenFilePicker({
                  types: [{
                      description: 'JSON Data Files',
                      accept: { 'application/json': ['.json', '.txt'] }
                  }],
                  multiple: false
              });

              const file = await handle.getFile();
              const text = await file.text();
              
              if (loadDataFromText(text)) {
                  setFileHandle(handle);
                  setIsSettingsOpen(false);
              }

          } catch (err: any) {
              if (err.name !== 'AbortError') {
                  console.error(err);
                  alert("Error connecting to file.");
              }
          }
      } else {
          // Fallback for Mobile (iOS/Android) / Firefox / Safari
          // Triggers the hidden file input
          if (fileInputRef.current) {
              fileInputRef.current.click();
          }
      }
  };

  const handleMobileFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          loadDataFromText(text);
          // On mobile, we can't get a persistent handle to write back automatically
          // So we don't setFileHandle. Users must manually export/download to save.
      };
      reader.readAsText(file);
      // Reset input value so same file can be selected again if needed
      event.target.value = '';
      setIsSettingsOpen(false);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleGoalUpdate = useCallback((monthId: string, goalId: string, updatedValues: Partial<Goal>) => {
    setData(currentData => {
        // 1. First pass: Apply the update to the specific month/goal
        const dataWithUpdate = currentData.map(month => {
            if (month.id === monthId) {
                return {
                    ...month,
                    goals: month.goals.map(goal => 
                        goal.id === goalId ? { ...goal, ...updatedValues } : goal
                    )
                };
            }
            return month;
        });

        // 2. Calculate the global max progress for this specific goal ID across ALL months
        let maxProgress = 0;
        dataWithUpdate.forEach(month => {
            const goal = month.goals.find(g => g.id === goalId);
            if (goal && goal.progress > maxProgress) {
                maxProgress = goal.progress;
            }
        });

        // 3. Find the date of the month being updated
        const targetMonth = dataWithUpdate.find(m => m.id === monthId);
        const targetDateTimestamp = targetMonth ? new Date(targetMonth.date).getTime() : 0;

        // 4. Second pass: Update endValue for this goal ID ONLY for current and future months
        return dataWithUpdate.map(month => {
            const monthDate = new Date(month.date);
            
            // Only update target if the month is the one being edited or a future month
            // Past months retain their historical target
            if (monthDate.getTime() < targetDateTimestamp) {
                return month;
            }

            return {
                ...month,
                goals: month.goals.map(goal => {
                    if (goal.id === goalId) {
                        return { ...goal, endValue: maxProgress };
                    }
                    return goal;
                })
            };
        });
    });
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
        // Clone goals with 0 progress but keep the same endValues (which are already maxes)
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
    const now = new Date();
    let newDate;

    // Logic: 
    // If it's the current month (Active) -> Set to Yesterday (Noon)
    // If it's a past month (Ended) -> Set to End of Month (Noon)
    // Future Month -> Default to 15th (Noon)
    
    if (year === now.getFullYear() && monthIndex === now.getMonth()) {
        newDate = new Date(year, monthIndex, now.getDate() - 1, 12, 0, 0, 0);
    } else if (year < now.getFullYear() || (year === now.getFullYear() && monthIndex < now.getMonth())) {
        // Set to last day of that month (0th day of next month)
        newDate = new Date(year, monthIndex + 1, 0, 12, 0, 0, 0); 
    } else {
        newDate = new Date(year, monthIndex, 15, 12, 0, 0, 0);
    }

    const newMonthName = newDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    
    // Determine max values from existing data to initialize targets
    const maxValues: Record<string, number> = {};
    data.forEach(m => {
        m.goals.forEach(g => {
            const current = maxValues[g.id] || 0;
            if (g.progress > current) maxValues[g.id] = g.progress;
        });
    });

    const newMonth: MonthData = {
        id: `month-${newDate.getTime()}`,
        name: newMonthName,
        date: newDate.toISOString(),
        goals: [
          { id: 'g1', name: 'within 5 minutes', progress: 0, endValue: maxValues['g1'] || 0, status: GoalStatus.NOT_STARTED },
          { id: 'g2', name: 'within 10 minutes', progress: 0, endValue: maxValues['g2'] || 0, status: GoalStatus.NOT_STARTED },
          { id: 'g3', name: 'within 20 minutes', progress: 0, endValue: maxValues['g3'] || 0, status: GoalStatus.NOT_STARTED },
          { id: 'g4', name: 'who rejected', progress: 0, endValue: maxValues['g4'] || 0, status: GoalStatus.NOT_STARTED },
          { id: 'g5', name: 'created by sellers', progress: 0, endValue: maxValues['g5'] || 0, status: GoalStatus.NOT_STARTED },
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


  const handleSyncWithSheets = () => {
    // Helper for salary calculation
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

    // 1. Calculate Dashboard Stats for Summary
    let totalNetSalary = 0;
    let totalGoals = 0;
    let completedGoals = 0;
    let inProgressGoals = 0;

    data.forEach(month => {
        let monthGross = 0;
        month.goals.forEach(goal => {
            totalGoals++;
            if (goal.progress >= goal.endValue && goal.endValue > 0) {
                completedGoals++;
            }
            if (goal.status === GoalStatus.IN_PROGRESS) {
                inProgressGoals++;
            }
            const multiplier = getSalaryMultiplier(goal.name);
            monthGross += goal.progress * multiplier;
        });
        const tax = monthGross * 0.12;
        totalNetSalary += (monthGross - tax);
    });

    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // 2. Generate Styled HTML for all data
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
        .dashboard-summary { margin-bottom: 40px; }
      </style>
    `;

    let contentHtml = '';

    // Add Dashboard Summary Table
    contentHtml += `
        <div class="month-container dashboard-summary">
            <div class="header" style="background-color: #059669;">Dashboard Overview</div>
            <table>
                <thead>
                    <tr>
                        <th class="text-left">Metric</th>
                        <th class="text-right">Value</th>
                        <th class="text-left">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="font-bold">Total Net Salary</td>
                        <td class="text-right text-emerald font-bold" style="font-size: 1.2em;">${totalNetSalary.toLocaleString('en-US')}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td class="font-bold">Overall Goal Completion</td>
                        <td class="text-right font-bold">${completionRate.toFixed(2)}%</td>
                        <td>
                            <div style="width: 100px; background-color: #e4e4e7; height: 10px; border-radius: 5px;">
                                <div style="width: ${completionRate}%; background-color: #059669; height: 10px; border-radius: 5px;"></div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="font-bold">Active Goals</td>
                        <td class="text-right">${inProgressGoals}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    data.forEach(month => {
        // Logic duplicated from MonthCard to ensure consistent data export
        const rows = month.goals.map(goal => {
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

        contentHtml += `
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
            ${contentHtml}
        </body>
        </html>
    `;

    // 3. Download as .xls
    const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Salary_Tracker_Full_Report_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Seller Handlers ---
  const handleSellerUpdate = (id: string, updatedValues: Partial<Seller>) => {
      setSellers(prev => prev.map(s => s.id === id ? { ...s, ...updatedValues } : s));
  };

  const handleAddSeller = () => {
      const newSeller: Seller = {
          id: `s-${Date.now()}`,
          name: 'New Consultant',
          totalFact: 0,
          totalPlan: 500000000,
          totalCount: 0,
          bonus: 0,
          ceFact: 0,
          cePlan: 300000000,
          tcFact: 0,
          tcPlan: 200000000
      };
      setSellers(prev => [...prev, newSeller]);
  };

  const handleDeleteSeller = (id: string) => {
      setSellers(prev => prev.filter(s => s.id !== id));
  };

  const handleSellerBulkUpdate = (updatedSellers: Seller[]) => {
      setSellers(updatedSellers);
  };


  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        // Find current month data for dashboard summary on Home Page
        const now = new Date();
        const currentMonthData = data.find(m => {
            const d = new Date(m.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        return (
          <HomePage 
            monthData={currentMonthData}
            onNavigate={(view) => {
                // Ensure the view is compatible with activeView type
                if (view === 'mmv' || view === 'branch' || view === 'seller' || view === 'comparison' || view === 'integrations') {
                    setActiveView(view);
                }
            }}
          />
        );
      case 'branch':
        return <StorePlanView plans={storePlans} onPlanUpdate={handleStorePlanUpdate} />;
      case 'seller':
        return (
            <SellerView 
                sellers={sellers} 
                onUpdate={handleSellerUpdate} 
                onAdd={handleAddSeller}
                onDelete={handleDeleteSeller}
                onBulkUpdate={handleSellerBulkUpdate}
            />
        );
      case 'comparison':
        return <ComparisonDashboard allMonths={data} />;
      case 'ai':
        return <AIDashboard allMonths={data} />;
      case 'income_detail':
        return <MonthlyIncomeView allMonths={data} onUpdateMonth={handleUpdateMonth} />;
      case 'integrations':
        return <IntegrationsPage onConnectDrive={handleConnectFile} isConnected={!!fileHandle} />;
      case 'mmv':
      default:
        return (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleConnectFile}
                  className={`w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 ${fileHandle ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-lg shadow-md hover:opacity-90 transition-colors text-sm font-semibold`}
                  aria-label="Connect Drive"
                  title={fileHandle ? "Sync Active" : "Connect to Google Drive"}
                >
                  <FolderIcon />
                  <span>{fileHandle ? 'Drive Connected' : 'Connect Drive'}</span>
                </button>
                <button 
                  onClick={handleSyncWithSheets}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-colors text-sm font-semibold"
                  aria-label="Sync with Google Sheets"
                >
                  <GoogleSheetsIcon />
                  <span>Export Excel</span>
                </button>
                <button 
                  onClick={handleNewMonth}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-colors text-sm font-semibold"
                  aria-label="Create new month"
                >
                  <PlusIcon />
                  <span>New Month</span>
                </button>
              </div>
            </div>
            
            {/* Hidden Input for Mobile File Loading */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json,.txt"
                onChange={handleMobileFileImport}
            />

            <Dashboard allMonths={data} />
            
            <div className="space-y-8">
                {dashboardGroupedData.years.map(year => (
                    <div key={year} className="animate-fade-in">
                        <button 
                            onClick={() => toggleDashboardYear(year)}
                            className="flex items-center gap-3 w-full mb-4 group"
                        >
                            <div className={`p-1 rounded-md transition-colors ${expandedDashboardYears[year] ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                {expandedDashboardYears[year] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {year}
                            </h3>
                            <div className="h-px flex-grow bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors"></div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                {dashboardGroupedData.groups[year].length} Months
                            </span>
                        </button>

                        {expandedDashboardYears[year] && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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
    <div 
        className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300"
        style={{ fontFamily: `"${appFont}", sans-serif` }}
    >
      <TopNav 
        theme={theme}
        toggleTheme={toggleTheme}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCloudSyncActive={!!fileHandle}
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConnectFile={handleConnectFile}
        isFileConnected={!!fileHandle}
        currentFont={appFont}
        setFont={setAppFont}
        currentTheme={appThemeColor}
        setTheme={setAppThemeColor}
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
