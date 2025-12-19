
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MonthData, GoalStatus, Goal, StorePlan, Seller, Todo } from './types.ts';
import MonthCard from './components/MonthCard.tsx';
import TopNav from './components/TopNav.tsx';
import Dashboard from './components/Dashboard.tsx';
import StorePlanView from './components/StorePlanView.tsx';
import { PlusIcon, ChevronDownIcon, ChevronRightIcon, FolderIcon } from './components/Icons.tsx';
import HomePage from './components/HomePage.tsx';
import ComparisonDashboard from './components/ComparisonDashboard.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import NewMonthModal from './components/NewMonthModal.tsx';
import IntegrationsPage from './components/IntegrationsPage.tsx';
import SellerView from './components/SellerView.tsx';
import AIDashboard from './components/AIDashboard.tsx';
import MonthlyIncomeView from './components/MonthlyIncomeView.tsx';
import TodoList from './components/TodoList.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import { loadFromNeon, saveToNeon } from './services/neon.ts';

// These constants will now pull from the Render Dashboard environment variables
// Vite will replace 'process.env.X' with the actual value during deployment.
const SYSTEM_PIN = process.env.AUTH_PIN || '';
const SYSTEM_NEON_URI = process.env.NEON_CONNECTION_STRING || '';

const initialData: MonthData[] = [
  {
    "id": "september-2024",
    "name": "September 2024",
    "date": "2024-09-15T00:00:00Z",
    "goals": [
      { "id": "g1", "name": "within 5 minutes", "progress": 16, "endValue": 16, "status": GoalStatus.COMPLETED },
      { "id": "g2", "name": "within 10 minutes", "progress": 13, "endValue": 13, "status": GoalStatus.COMPLETED },
      { "id": "g3", "name": "within 20 minutes", "progress": 12, "endValue": 12, "status": GoalStatus.COMPLETED },
      { "id": "g4", "name": "who rejected", "progress": 15, "endValue": 15, "status": GoalStatus.COMPLETED },
      { "id": "g5", "name": "created by sellers", "progress": 0, "endValue": 0, "status": GoalStatus.COMPLETED }
    ]
  }
];

const initialStorePlans: StorePlan[] = [
  { "id": "sp1", "name": "Store Plan", "plan100": 3100000000, "actualSum": 397366143 },
  { "id": "sp2", "name": "1st Decade", "plan100": 1033333333, "actualSum": 397366143 },
  { "id": "sp3", "name": "2nd Decade", "plan100": 1033333333, "actualSum": 0 },
  { "id": "sp4", "name": "3rd Decade", "plan100": 1033333333, "actualSum": 0 }
];

const initialSellers: Seller[] = [
  {
    "id": "s1",
    "name": "John Doe",
    "totalFact": 845572497,
    "totalPlan": 500000000,
    "totalCount": 221,
    "bonus": 4594566,
    "ceFact": 210345970,
    "cePlan": 300000000,
    "tcFact": 535093390,
    "tcPlan": 200000000
  }
];

const LOCAL_STORAGE_KEY = 'salaryGoalTracker_v2_backup';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'welcome' | 'mmv' | 'ai' | 'branch' | 'seller' | 'comparison' | 'integrations' | 'income_detail' | 'todo'>('welcome');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [expandedDashboardYears, setExpandedDashboardYears] = useState<Record<number, boolean>>({});

  // Initialize state from local storage first
  const [data, setData] = useState<MonthData[]>(() => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved).data.salaryGoalTrackerData : initialData;
  });
  const [storePlans, setStorePlans] = useState<StorePlan[]>(() => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved).data.storePlansData : initialStorePlans;
  });
  const [sellers, setSellers] = useState<Seller[]>(() => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved).data.sellersData : initialSellers;
  });
  const [todos, setTodos] = useState<Todo[]>(() => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved).data.todosData : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as any) || 'dark');
  const [appFont, setAppFont] = useState(() => localStorage.getItem('appFont') || 'Inter');
  const [appThemeColor, setAppThemeColor] = useState(() => localStorage.getItem('appThemeColor') || 'emerald');

  // Load from Neon using Environment Variable on startup
  useEffect(() => {
      if (SYSTEM_NEON_URI) {
          const loadData = async () => {
              const result = await loadFromNeon(SYSTEM_NEON_URI);
              if (result.success && result.data) {
                  const cloudData = result.data;
                  if (cloudData.salaryGoalTrackerData) setData(cloudData.salaryGoalTrackerData);
                  if (cloudData.storePlansData) setStorePlans(cloudData.storePlansData);
                  if (cloudData.sellersData) setSellers(cloudData.sellersData);
                  if (cloudData.todosData) setTodos(cloudData.todosData); 
                  if (cloudData.theme) setTheme(cloudData.theme);
                  if (cloudData.appFont) setAppFont(cloudData.appFont);
                  if (cloudData.appThemeColor) setAppThemeColor(cloudData.appThemeColor);
                  console.log("Auto-synced from Neon Cloud.");
              }
          };
          loadData();
      }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('appFont', appFont); }, [appFont]);
  useEffect(() => { localStorage.setItem('appThemeColor', appThemeColor); }, [appThemeColor]);

  // Debounced Sync logic
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateBackupJSON = useCallback(() => {
    return JSON.stringify({
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
            salaryGoalTrackerData: data,
            storePlansData: storePlans,
            sellersData: sellers,
            todosData: todos,
            theme,
            appFont,
            appThemeColor
        }
    }, null, 2);
  }, [data, storePlans, sellers, todos, theme, appFont, appThemeColor]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
        const backupContent = generateBackupJSON();
        localStorage.setItem(LOCAL_STORAGE_KEY, backupContent);

        if (fileHandle) {
            try {
                const writable = await fileHandle.createWritable();
                await writable.write(backupContent);
                await writable.close();
            } catch (err) { console.error("FS Error:", err); }
        }

        if (SYSTEM_NEON_URI) {
            try {
                const rawData = JSON.parse(backupContent).data;
                await saveToNeon(SYSTEM_NEON_URI, rawData);
                console.log("Cloud update push success.");
            } catch (err) { console.error("Neon Sync Error:", err); }
        }
    }, 1000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [data, storePlans, sellers, todos, theme, fileHandle, generateBackupJSON]);

  const handleConnectFile = async () => {
      if ((window as any).showOpenFilePicker) {
          try {
              const [handle] = await (window as any).showOpenFilePicker({ types: [{ description: 'JSON', accept: { 'application/json': ['.json', '.txt'] } }], multiple: false });
              const file = await handle.getFile();
              const text = await file.text();
              const backup = JSON.parse(text);
              if (backup && backup.data) {
                  setData(backup.data.salaryGoalTrackerData || initialData);
                  setStorePlans(backup.data.storePlansData || initialStorePlans);
                  setSellers(backup.data.sellersData || initialSellers);
                  setTodos(backup.data.todosData || []);
                  setFileHandle(handle);
              }
          } catch (err: any) { if (err.name !== 'AbortError') alert("Error connecting."); }
      }
  };

  const handleGoalUpdate = useCallback((monthId: string, goalId: string, updatedValues: Partial<Goal>) => {
    setData(currentData => currentData.map(month => month.id === monthId ? { ...month, goals: month.goals.map(goal => goal.id === goalId ? { ...goal, ...updatedValues } : goal) } : month));
  }, []);

  const handleUpdateMonth = (monthId: string, updatedValues: Partial<MonthData>) => { setData(currentData => currentData.map(month => (month.id === monthId ? { ...month, ...updatedValues } : month))); };
  const handleDeleteMonth = (monthId: string) => { setData(currentData => currentData.filter(month => month.id !== monthId)); };

  const handleCreateSpecificMonth = (year: number, monthIndex: number) => {
    const newDate = new Date(year, monthIndex, 15, 12, 0, 0, 0);
    const newMonthName = newDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const newMonth: MonthData = {
        id: `month-${newDate.getTime()}`, name: newMonthName, date: newDate.toISOString(),
        goals: initialData[0].goals.map(g => ({ ...g, progress: 0, status: GoalStatus.NOT_STARTED })),
    };
    setData(prev => [...prev, newMonth].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsNewMonthModalOpen(false);
  };

  const dashboardGroupedData = useMemo(() => {
      const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const groups: Record<number, MonthData[]> = {};
      sorted.forEach(month => { const year = new Date(month.date).getFullYear(); if (!groups[year]) groups[year] = []; groups[year].push(month); });
      return { groups, years: Object.keys(groups).map(Number).sort((a, b) => b - a) };
  }, [data]);

  if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900" style={{ fontFamily: `"${appFont}", sans-serif` }}>
            <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} savedPin={SYSTEM_PIN} />
        </div>
      );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'welcome':
        const now = new Date();
        const currentMonthData = data.find(m => { const d = new Date(m.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
        return <HomePage monthData={currentMonthData} onNavigate={(view) => { if (['mmv', 'branch', 'seller', 'comparison', 'integrations', 'todo', 'income_detail'].includes(view)) setActiveView(view as any); }} />;
      case 'branch': return <StorePlanView plans={storePlans} onPlanUpdate={(id, vals) => setStorePlans(currentPlans => currentPlans.map(p => p.id === id ? { ...p, ...vals } : p))} />;
      case 'seller': return <SellerView sellers={sellers} onUpdate={(id, vals) => setSellers(prev => prev.map(s => s.id === id ? {...s, ...vals} : s))} onAdd={() => setSellers(p => [...p, { id: `s-${Date.now()}`, name: 'New Consultant', totalFact: 0, totalPlan: 500000000, totalCount: 0, bonus: 0, ceFact: 0, cePlan: 300000000, tcFact: 0, tcPlan: 200000000 }])} onDelete={(id) => setSellers(p => p.filter(s => s.id !== id))} onBulkUpdate={setSellers} />;
      case 'comparison': return <ComparisonDashboard allMonths={data} />;
      case 'ai': return <AIDashboard allMonths={data} />;
      case 'income_detail': return <MonthlyIncomeView allMonths={data} onUpdateMonth={handleUpdateMonth} />;
      case 'todo': return <TodoList todos={todos} onAddTodo={(vals) => setTodos(p => [...p, { id: `todo-${Date.now()}`, completed: false, createdAt: new Date().toISOString(), ...vals }])} onToggleTodo={(id) => setTodos(p => p.map(t => t.id === id ? {...t, completed: !t.completed} : t))} onDeleteTodo={(id) => setTodos(p => p.filter(t => t.id !== id))} onEditTodo={(id, vals) => setTodos(p => p.map(t => t.id === id ? {...t, ...vals} : t))} />;
      case 'integrations': return <IntegrationsPage onConnectDrive={handleConnectFile} isConnected={!!fileHandle} />;
      case 'mmv': default:
        return (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button onClick={handleConnectFile} className={`w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 ${fileHandle ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-lg shadow-md hover:opacity-90 transition-colors text-sm font-semibold`} aria-label="Connect Drive"><FolderIcon /><span>{fileHandle ? 'Drive Connected' : 'Connect Drive'}</span></button>
                <button onClick={() => setIsNewMonthModalOpen(true)} className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-colors text-sm font-semibold"><PlusIcon /><span>New Month</span></button>
              </div>
            </div>
            <Dashboard allMonths={data} />
            <div className="space-y-8">
                {dashboardGroupedData.years.map(year => (
                    <div key={year} className="animate-fade-in">
                        <button onClick={() => setExpandedDashboardYears(prev => ({ ...prev, [year]: !prev[year] }))} className="flex items-center gap-3 w-full mb-4 group">
                            <div className={`p-1 rounded-md transition-colors ${expandedDashboardYears[year] ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>{expandedDashboardYears[year] ? <ChevronDownIcon /> : <ChevronRightIcon />}</div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{year}</h3>
                            <div className="h-px flex-grow bg-gray-200 dark:bg-gray-700"></div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">{dashboardGroupedData.groups[year].length} Months</span>
                        </button>
                        {expandedDashboardYears[year] && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {dashboardGroupedData.groups[year].map(monthData => (
                                    <MonthCard key={monthData.id} monthData={monthData} onGoalUpdate={handleGoalUpdate} onUpdateMonth={(updatedValues) => handleUpdateMonth(monthData.id, updatedValues)} onDeleteCard={() => handleDeleteMonth(monthData.id)} onCloneCard={() => {}} />
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300" style={{ fontFamily: `"${appFont}", sans-serif` }}>
      <TopNav theme={theme} toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} activeView={activeView} onViewChange={setActiveView} onOpenSettings={() => setIsSettingsOpen(true)} isCloudSyncActive={!!SYSTEM_NEON_URI} onLock={() => setIsAuthenticated(false)} />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onConnectFile={handleConnectFile} isFileConnected={!!fileHandle} currentFont={appFont} setFont={setAppFont} currentTheme={appThemeColor} setTheme={setAppThemeColor} />
      <NewMonthModal isOpen={isNewMonthModalOpen} onClose={() => setIsNewMonthModalOpen(false)} onSelectMonth={handleCreateSpecificMonth} existingMonths={new Set(data.map(m => { const d = new Date(m.date); return `${d.getFullYear()}-${d.getMonth()}`; }))} />
    </div>
  );
};

export default App;
