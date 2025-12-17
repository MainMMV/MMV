
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Todo, PriorityLevel } from '../types';
import { PlusIcon, TrashIcon, CheckCircleIcon, PencilIcon, CurrencyDollarIcon, FireIcon, RefreshIcon, TagIcon, ChevronDownIcon, PieChartIcon } from './Icons';
import GaugeChart from './GaugeChart';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
}

const CATEGORIES: { id: Todo['category']; label: string; color: string; bg: string; border: string; hex: string }[] = [
  { id: 'personal', label: 'Personal', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', hex: '#e11d48' },
  { id: 'work', label: 'Work', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', hex: '#2563eb' },
  { id: 'finance', label: 'Finance', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', hex: '#9333ea' },
  { id: 'shopping', label: 'Shopping', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', hex: '#059669' },
  { id: 'urgent', label: 'Urgent', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', hex: '#d97706' },
];

const PRIORITIES: Record<PriorityLevel, { label: string; color: string; value: string }> = {
  low: { label: 'Low', value: 'low', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  medium: { label: 'Med', value: 'medium', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  high: { label: 'High', value: 'high', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  critical: { label: 'Crit', value: 'critical', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
};

const PRIORITY_OPTIONS = Object.values(PRIORITIES);

// --- Custom Dropdown Component ---
interface DropdownProps {
    options: any[];
    value: string;
    onChange: (value: any) => void;
    renderOption?: (option: any) => React.ReactNode;
    renderSelected?: (option: any) => React.ReactNode;
    className?: string;
    placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, renderOption, renderSelected, className, placeholder = 'Select' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find(o => (o.id || o.value) === value);

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-900 border transition-all h-full rounded-xl px-3 py-2.5 text-sm outline-none ${
                    isOpen 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 z-10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
                <div className="flex-grow text-left truncate flex items-center">
                    {selected ? (renderSelected ? renderSelected(selected) : (selected.label || selected.id)) : <span className="text-gray-400">{placeholder}</span>}
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fade-in ring-1 ring-black/5 custom-scrollbar">
                    {options.map((opt) => (
                        <button
                            key={opt.id || opt.value}
                            type="button"
                            onClick={() => { onChange(opt.id || opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 last:border-none ${
                                ((opt.id || opt.value) === value) 
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                        >
                            {renderOption ? renderOption(opt) : (opt.label || opt.id)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Spending Donut Chart Component ---
const SpendingDonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0); 
    let currentAngle = 0;
    
    if (total === 0) return (
        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-700 mb-2"></div>
            <span className="text-xs">No spending data</span>
        </div>
    );

    return (
        <div className="flex items-center justify-between h-full">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {data.map((item, i) => { 
                        const percentage = item.value / total; 
                        const angle = percentage * 360; 
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const x1 = 50 + 40 * Math.cos(Math.PI * currentAngle / 180); 
                        const y1 = 50 + 40 * Math.sin(Math.PI * currentAngle / 180); 
                        const x2 = 50 + 40 * Math.cos(Math.PI * (currentAngle + angle) / 180); 
                        const y2 = 50 + 40 * Math.sin(Math.PI * (currentAngle + angle) / 180); 
                        
                        const d = percentage === 1 
                            ? "M 50 10 A 40 40 0 1 1 50 10.1" 
                            : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`; 
                        
                        const path = <path key={i} d={d} fill={item.color} />; 
                        currentAngle += angle; 
                        return path; 
                    })}
                    <circle cx="50" cy="50" r="30" className="fill-white dark:fill-gray-800" />
                </svg>
            </div>
            <div className="flex-grow pl-4 space-y-1 overflow-y-auto max-h-32 custom-scrollbar">
                {data.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] sm:text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[80px]">{d.label}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(d.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onEditTodo }) => {
  const [activeFilter, setActiveFilter] = useState<Todo['category'] | 'all'>('all');
  
  // New Item State
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Todo['category']>('shopping');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [cost, setCost] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState('');

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
      const totalItems = todos.length;
      const completedItems = todos.filter(t => t.completed).length;
      const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
      
      const totalBudget = todos.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
      const spent = todos.filter(t => t.completed).reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
      const remaining = totalBudget - spent;

      const criticalCount = todos.filter(t => t.priority === 'critical' && !t.completed).length;

      return { totalItems, completedItems, progress, totalBudget, spent, remaining, criticalCount };
  }, [todos]);

  // --- Category Breakdown Calculation ---
  const categoryBreakdown = useMemo(() => {
      const breakdown = CATEGORIES.map(cat => {
          const catTotal = todos
              .filter(t => t.category === cat.id)
              .reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
          return {
              label: cat.label,
              value: catTotal,
              color: cat.hex
          };
      }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
      
      return breakdown;
  }, [todos]);

  const filteredTodos = useMemo(() => {
      let result = todos;
      if (activeFilter !== 'all') {
          result = result.filter(t => t.category === activeFilter);
      }
      // Sort: Critical first, then High, then incomplete, then date
      return result.sort((a, b) => {
          if (a.completed === b.completed) {
             const pMap = { critical: 4, high: 3, medium: 2, low: 1 };
             const pA = pMap[a.priority || 'low'];
             const pB = pMap[b.priority || 'low'];
             return pB - pA;
          }
          return a.completed ? 1 : -1;
      });
  }, [todos, activeFilter]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo({
          text,
          category,
          priority,
          estimatedCost: parseFloat(cost) || 0,
          recurring: isRecurring
      });
      setText('');
      setCost('');
      setIsRecurring(false);
    }
  };

  const getCategoryDetails = (catId: string) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Render helpers for Dropdown
  const renderCategory = (cat: any) => (
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${cat.bg} ${cat.color} border ${cat.border} whitespace-nowrap shadow-sm`}>
          {cat.label}
      </span>
  );

  const renderPriority = (pri: any) => (
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${pri.color} whitespace-nowrap shadow-sm`}>
          {pri.label}
      </span>
  );

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto space-y-8">
      
      {/* 1. Monthly Purchase Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Budget Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative z-10">
                  <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Monthly Budget</h3>
                  <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(metrics.spent)}</span>
                      <span className="text-xs text-gray-400">/ {formatCurrency(metrics.totalBudget)}</span>
                  </div>
                  <div className="mt-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(metrics.spent / (metrics.totalBudget || 1)) * 100}%` }}></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-right">{formatCurrency(metrics.remaining)} Remaining</p>
              </div>
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CurrencyDollarIcon className="w-32 h-32" />
              </div>
          </div>

          {/* New: Spending Breakdown Donut */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-700/50 flex flex-col group hover:shadow-md transition-shadow">
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" /> Spending Breakdown
              </h3>
              <div className="flex-grow">
                  <SpendingDonutChart data={categoryBreakdown} />
              </div>
          </div>

          {/* Completion Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Items Cleared</h3>
                  <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                      {metrics.completedItems} <span className="text-lg text-gray-400 font-medium">/ {metrics.totalItems}</span>
                  </div>
                  <p className="text-xs text-emerald-500 font-bold">
                      {metrics.progress.toFixed(0)}% Complete
                  </p>
              </div>
              <div className="h-24 w-32 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                  <GaugeChart percentage={metrics.progress} size={100} strokeWidth={8} color="text-emerald-500" />
              </div>
          </div>

          {/* Priority Focus */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700/50 flex flex-col justify-center group hover:shadow-md transition-shadow">
               <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Priority Focus</h3>
               <div className="flex items-center gap-4">
                   <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl group-hover:rotate-12 transition-transform">
                       <FireIcon className="w-8 h-8" />
                   </div>
                   <div>
                       <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.criticalCount}</div>
                       <p className="text-xs text-gray-500">Critical Items Pending</p>
                   </div>
               </div>
          </div>
      </div>

      {/* 2. Controls & Quick Add */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative z-20">
          <form onSubmit={handleAdd} className="flex flex-col lg:flex-row gap-3">
              <div className="flex-grow flex flex-col sm:flex-row gap-3">
                  <input 
                      type="text" 
                      value={text} 
                      onChange={(e) => setText(e.target.value)} 
                      placeholder="New purchase item..."
                      className="flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800"
                  />
                  <div className="relative w-full sm:w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                      <input 
                          type="number" 
                          value={cost} 
                          onChange={(e) => setCost(e.target.value)} 
                          placeholder="Cost"
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800"
                      />
                  </div>
              </div>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                  <div className="w-1/2 sm:w-40 relative z-20">
                      <Dropdown 
                          options={CATEGORIES}
                          value={category}
                          onChange={(val) => setCategory(val)}
                          renderOption={renderCategory}
                          renderSelected={renderCategory}
                      />
                  </div>
                  
                  <div className="w-1/2 sm:w-28 relative z-10">
                      <Dropdown 
                          options={PRIORITY_OPTIONS}
                          value={priority}
                          onChange={(val) => setPriority(val)}
                          renderOption={renderPriority}
                          renderSelected={renderPriority}
                      />
                  </div>

                  <button
                      type="button"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`px-3 py-2.5 rounded-xl border transition-all ${isRecurring ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-900/50 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      title="Recurring Monthly"
                  >
                      <RefreshIcon className={`w-5 h-5 transition-transform ${isRecurring ? 'rotate-180' : ''}`} />
                  </button>

                  <button 
                      type="submit" 
                      disabled={!text.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-2.5 font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-grow sm:flex-grow-0"
                  >
                      <PlusIcon className="w-5 h-5" /> <span className="hidden sm:inline">Add</span>
                  </button>
              </div>
          </form>
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-t-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeFilter === 'all' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
              All Items
          </button>
          {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 rounded-t-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeFilter === cat.id ? `border-${cat.color.split('-')[1]}-500 ${cat.color}` : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                  {cat.label}
              </button>
          ))}
      </div>

      {/* 4. Purchase List */}
      <div className="space-y-3 relative z-0">
          {filteredTodos.length > 0 ? filteredTodos.map(todo => {
              const cat = getCategoryDetails(todo.category);
              const pri = PRIORITIES[todo.priority || 'low'];
              const isEditing = editingId === todo.id;

              return (
                  <div key={todo.id} className={`group flex flex-col sm:flex-row sm:items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-200 ${todo.completed ? 'border-gray-100 dark:border-gray-700/30 opacity-60 bg-gray-50 dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900'}`}>
                      
                      <div className="flex items-center flex-grow mb-3 sm:mb-0 min-w-0">
                          <button 
                            onClick={() => onToggleTodo(todo.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'}`}
                          >
                              {todo.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                          </button>

                          <div className="flex-grow min-w-0 mr-4">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-medium truncate ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                      {todo.text}
                                  </span>
                                  {todo.recurring && <RefreshIcon className="w-3 h-3 text-gray-400" />}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className={`px-1.5 py-0.5 rounded ${cat.bg} ${cat.color} font-bold tracking-wide uppercase border ${cat.border} text-[10px]`}>
                                      {cat.label}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded ${pri.color} font-bold tracking-wide uppercase text-[10px]`}>
                                      {pri.label}
                                  </span>
                              </div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pl-10 sm:pl-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700/50 pt-2 sm:pt-0">
                          <div className="flex items-center gap-2">
                              {isEditing ? (
                                  <div className="flex items-center relative w-24">
                                      <span className="absolute left-2 text-gray-400 text-xs">$</span>
                                      <input 
                                          type="number" 
                                          value={editCost}
                                          onChange={(e) => setEditCost(e.target.value)}
                                          onBlur={() => {
                                              if (onEditTodo) onEditTodo(todo.id, { estimatedCost: parseFloat(editCost) || 0 });
                                              setEditingId(null);
                                          }}
                                          onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                  if (onEditTodo) onEditTodo(todo.id, { estimatedCost: parseFloat(editCost) || 0 });
                                                  setEditingId(null);
                                              }
                                          }}
                                          className="w-full bg-gray-100 dark:bg-gray-900 border border-indigo-300 rounded px-2 py-1 pl-5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                          autoFocus
                                      />
                                  </div>
                              ) : (
                                  <div 
                                    className="font-mono font-bold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-indigo-500 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => {
                                        setEditingId(todo.id);
                                        setEditCost(todo.estimatedCost?.toString() || '');
                                    }}
                                  >
                                      {formatCurrency(todo.estimatedCost || 0)}
                                  </div>
                              )}
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => onDeleteTodo(todo.id)}
                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                              >
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
              );
          }) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700/50">
                  <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <TagIcon className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No purchases found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Start planning your monthly expenses.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default TodoList;
