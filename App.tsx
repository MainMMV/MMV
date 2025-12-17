
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MonthData, GoalStatus, Goal, StorePlan, Seller, Todo } from './types.ts';
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
import TodoList from './components/TodoList.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import { loadFromNeon, saveToNeon } from './services/neon.ts';
import { googleCalendar, googleDrive, googleSheets } from './services/google.ts';

const LOCAL_STORAGE_KEY = 'salaryGoalTracker_v3_premium';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'welcome' | 'mmv' | 'ai' | 'branch' | 'seller' | 'comparison' | 'integrations' | 'income_detail' | 'todo'>('welcome');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fileHandle, setFileHandle] = useState<any>(null);
  
  // Auth & Google State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  // Core Data State
  const [data, setData] = useState<MonthData[]>([]);
  const [storePlans, setStorePlans] = useState<StorePlan[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [authPin, setAuthPin] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [appFont, setAppFont] = useState('Inter');
  const [appThemeColor, setAppThemeColor] = useState('emerald');

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved).data;
        setData(parsed.salaryGoalTrackerData || []);
        setStorePlans(parsed.storePlansData || []);
        setSellers(parsed.sellersData || []);
        setTodos(parsed.todosData || []);
        setAuthPin(parsed.authPin || '0625');
        setTheme(parsed.theme || 'dark');
        setAppFont(parsed.appFont || 'Inter');
        setAppThemeColor(parsed.appThemeColor || 'emerald');
    }
  }, []);

  // Sync Logic
  const handleManualSave = useCallback(async () => {
    const backupState = {
        salaryGoalTrackerData: data,
        storePlansData: storePlans,
        sellersData: sellers,
        todosData: todos,
        authPin, theme, appFont, appThemeColor
    };
    const backupContent = JSON.stringify({ version: 3.5, timestamp: new Date().toISOString(), data: backupState }, null, 2);
    
    // 1. Local Storage
    localStorage.setItem(LOCAL_STORAGE_KEY, backupContent);
    
    // 2. File System (JSON)
    if (fileHandle) {
        try {
            const writable = await fileHandle.createWritable();
            await writable.write(backupContent);
            await writable.close();
        } catch (err) { console.error("File sync error", err); }
    }
    
    // 3. Neon DB
    const neonString = localStorage.getItem('neonConnectionString');
    if (neonString) {
        try { await saveToNeon(neonString, backupState); }
        catch (err) { console.error("Neon sync error", err); }
    }

    // 4. Google Drive & Sheets (If integrated)
    if (googleUser) {
        await googleDrive.saveBackup(backupContent);
        await googleSheets.exportData(backupState);
    }

    // Visual feedback usually handled by TopNav component state
  }, [data, storePlans, sellers, todos, authPin, theme, appFont, appThemeColor, fileHandle, googleUser]);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(handleManualSave, 3000);
    return () => clearTimeout(timer);
  }, [data, storePlans, sellers, todos, handleManualSave]);

  const handleGoalUpdate = useCallback((monthId: string, goalId: string, updatedValues: Partial<Goal>) => {
    setData(curr => curr.map(m => m.id === monthId ? { ...m, goals: m.goals.map(g => g.id === goalId ? { ...g, ...updatedValues } : g) } : m));
  }, []);
  
  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => {
      const newTodo: Todo = { 
          id: `todo-${Date.now()}`, 
          text: todoData.text, 
          completed: false, 
          category: todoData.category, 
          estimatedCost: todoData.estimatedCost, 
          priority: todoData.priority, 
          recurring: todoData.recurring, 
          payDay: todoData.payDay, 
          createdAt: new Date().toISOString() 
      };

      // Calendar Sync
      if (googleUser && newTodo.payDay) {
          const eventId = await googleCalendar.syncTodo(newTodo);
          newTodo.googleCalendarEventId = eventId;
      }

      setTodos(prev => [...prev, newTodo]);
  };

  const handleDeleteTodo = async (id: string) => {
      const todoToDelete = todos.find(t => t.id === id);
      if (todoToDelete?.googleCalendarEventId && googleUser) {
          await googleCalendar.deleteTodo(todoToDelete.googleCalendarEventId);
      }
      setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAuthenticated = (pin: string, user?: any) => { 
    setAuthPin(pin); 
    if (user) setGoogleUser(user);
    setIsAuthenticated(true); 
  };

  if (!isAuthenticated) return <AuthScreen onAuthenticated={handleAuthenticated} savedPin={authPin} />;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 transition-colors duration-300" style={{ fontFamily: `"${appFont}", sans-serif` }}>
      <TopNav 
        theme={theme} 
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onManualSave={handleManualSave} 
        isCloudSyncActive={!!googleUser || !!fileHandle} 
        onLock={() => setIsAuthenticated(false)} 
      />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {activeView === 'welcome' && <HomePage monthData={data.find(m => new Date(m.date).getMonth() === new Date().getMonth())} onNavigate={setActiveView as any} />}
          {activeView === 'todo' && <TodoList todos={todos} onAddTodo={handleAddTodo} onToggleTodo={(id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))} onDeleteTodo={handleDeleteTodo} onEditTodo={(id, u) => setTodos(prev => prev.map(t => t.id === id ? {...t, ...u} : t))} />}
          {activeView === 'mmv' && (
              <>
                 <Dashboard allMonths={data} />
                 {data.map(m => <MonthCard key={m.id} monthData={m} onGoalUpdate={handleGoalUpdate} onUpdateMonth={u => setData(curr => curr.map(m2 => m2.id === m.id ? {...m2, ...u} : m2))} onDeleteCard={() => setData(curr => curr.filter(m2 => m2.id !== m.id))} />)}
              </>
          )}
          {activeView === 'branch' && <StorePlanView plans={storePlans} onPlanUpdate={(id, u) => setStorePlans(p => p.map(pl => pl.id === id ? {...pl, ...u} : pl))} />}
          {activeView === 'seller' && <SellerView sellers={sellers} onUpdate={(id, u) => setSellers(s => s.map(se => se.id === id ? {...se, ...u} : se))} onAdd={() => setSellers([...sellers, { id: `s-${Date.now()}`, name: 'New', totalFact: 0, totalPlan: 0, totalCount: 0, bonus: 0, ceFact: 0, cePlan: 0, tcFact: 0, tcPlan: 0 }])} onDelete={id => setSellers(sellers.filter(s => s.id !== id))} onBulkUpdate={setSellers} />}
          {activeView === 'comparison' && <ComparisonDashboard allMonths={data} />}
          {activeView === 'ai' && <AIDashboard allMonths={data} />}
          {activeView === 'income_detail' && <MonthlyIncomeView allMonths={data} onUpdateMonth={(id, u) => setData(curr => curr.map(m => m.id === id ? {...m, ...u} : m))} />}
          {activeView === 'integrations' && <IntegrationsPage isConnected={!!googleUser} onConnectDrive={handleManualSave} />}
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onConnectFile={async () => {
            // @ts-ignore
            const [handle] = await window.showOpenFilePicker();
            setFileHandle(handle);
        }} 
        isFileConnected={!!fileHandle} 
        currentFont={appFont} 
        setFont={setAppFont} 
        currentTheme={appThemeColor} 
        setTheme={setAppThemeColor} 
      />
      
      <NewMonthModal 
        isOpen={activeView === 'mmv' && data.length === 0} 
        onClose={() => setActiveView('welcome')} 
        onSelectMonth={(y, m) => setData([...data, { id: `m-${Date.now()}`, name: `${y}-${m}`, date: new Date(y, m).toISOString(), goals: [] }])} 
        existingMonths={new Set(data.map(m => `${new Date(m.date).getFullYear()}-${new Date(m.date).getMonth()}`))} 
      />
    </div>
  );
};

export default App;
