
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Todo, PriorityLevel } from '../types';
import { PlusIcon, TrashIcon, CheckCircleIcon, PencilIcon, CurrencyDollarIcon, FireIcon, RefreshIcon, TagIcon, ChevronDownIcon, PieChartIcon, CloseIcon, DotsVerticalIcon, CalendarIcon } from './Icons';
import GaugeChart from './GaugeChart';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
}

const CATEGORIES: { id: Todo['category']; label: string; color: string; bg: string; border: string; hex: string }[] = [
  { id: 'personal', label: 'Personal', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', hex: '#e11d48' },
  { id: 'work', label: 'Work', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hex: '#2563eb' },
  { id: 'finance', label: 'Finance', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', hex: '#9333ea' },
  { id: 'shopping', label: 'Shopping', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hex: '#059669' },
  { id: 'urgent', label: 'Urgent', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#d97706' },
];

const PRIORITIES: Record<PriorityLevel, { label: string; color: string; value: string }> = {
  low: { label: 'Low', value: 'low', color: 'bg-slate-800 text-slate-400' },
  medium: { label: 'Med', value: 'medium', color: 'bg-blue-900/30 text-blue-400' },
  high: { label: 'High', value: 'high', color: 'bg-orange-900/30 text-orange-400' },
  critical: { label: 'Crit', value: 'critical', color: 'bg-rose-900/30 text-rose-400' },
};

const PRIORITY_OPTIONS = Object.values(PRIORITIES);

// --- Custom Dropdown Component ---
interface DropdownProps {
    options: any[];
    value: string | number | null;
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

    const selected = options.find(o => (o.id === value || o.value === value || o === value));

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 bg-white/5 backdrop-blur-xl border transition-all h-full rounded-2xl px-3 py-2.5 text-sm outline-none ${
                    isOpen 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 z-10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
            >
                <div className="flex-grow text-left truncate flex items-center text-gray-300">
                    {selected !== undefined ? (renderSelected ? renderSelected(selected) : (selected.label || selected.id || selected)) : <span className="text-gray-500">{placeholder}</span>}
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fade-in ring-1 ring-black/5 custom-scrollbar">
                    {options.map((opt) => (
                        <button
                            key={opt.id || opt.value || opt}
                            type="button"
                            onClick={() => { onChange(opt.id || opt.value || opt); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 border-b border-white/5 last:border-none ${
                                ((opt.id || opt.value || opt) === value) 
                                ? 'bg-indigo-500/20 text-indigo-300' 
                                : 'hover:bg-white/5 text-gray-300'
                            }`}
                        >
                            {renderOption ? renderOption(opt) : (opt.label || opt.id || opt)}
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
        <div className="h-full w-full flex flex-col items-center justify-center text-gray-600">
            <div className="w-24 h-24 rounded-full border-4 border-white/5 mb-2"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">No Data</span>
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
                    <circle cx="50" cy="50" r="32" className="fill-[#0f172a]" />
                </svg>
            </div>
            <div className="flex-grow pl-4 space-y-1 overflow-y-auto max-h-32 custom-scrollbar">
                {data.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] sm:text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: d.color}}></div>
                            <span className="text-gray-400 truncate max-w-[80px]">{d.label}</span>
                        </div>
                        <span className="font-bold text-white font-mono">
                            {new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(d.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Swipeable Row Component ---
interface SwipeableRowProps {
    item: Todo;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Todo>) => void;
    getCategoryDetails: (id: string) => any;
    formatCurrency: (val: number) => string;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({ item, onToggle, onDelete, onEdit, getCategoryDetails, formatCurrency }) => {
    const [dragX, setDragX] = useState(0);
    const [startX, setStartX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editCost, setEditCost] = useState(item.estimatedCost?.toString() || '');
    const [isRemoving, setIsRemoving] = useState(false);

    const touchStart = (e: React.TouchEvent) => {
        if (isEditing) return;
        setStartX(e.targetTouches[0].clientX);
        setIsSwiping(true);
    };

    const touchMove = (e: React.TouchEvent) => {
        if (!isSwiping || isEditing) return;
        const currentX = e.targetTouches[0].clientX;
        const diff = currentX - startX;
        if (diff > 150) setDragX(150);
        else if (diff < -200) setDragX(-200);
        else setDragX(diff);
    };

    const touchEnd = () => {
        if (!isSwiping || isEditing) return;
        setIsSwiping(false);
        const threshold = 100;
        if (dragX > threshold) {
            onToggle(item.id);
            setDragX(0);
        } else if (dragX < -threshold) {
            setDragX(-140);
        } else {
            setDragX(0);
        }
    };

    const handleDelete = () => {
        setIsRemoving(true);
        setTimeout(() => onDelete(item.id), 300);
    };

    const cat = getCategoryDetails(item.category);
    const pri = PRIORITIES[item.priority || 'low'];
    
    const wrapperClass = `relative mb-3 transition-all duration-300 ease-in-out ${isRemoving ? 'opacity-0 max-h-0 scale-95' : 'opacity-100 max-h-40 scale-100'}`;

    return (
        <div className={wrapperClass} onContextMenu={(e) => e.preventDefault()}>
            <div className="absolute inset-0 flex rounded-2xl overflow-hidden">
                <div className={`flex-1 bg-emerald-500 flex items-center justify-start pl-6 transition-opacity duration-300 ${dragX > 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex-1 flex justify-end transition-opacity duration-300 ${dragX < -50 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-[70px] bg-amber-500 flex items-center justify-center h-full"></div>
                    <div className="w-[70px] bg-rose-500 flex items-center justify-center h-full rounded-r-2xl"></div>
                </div>
            </div>

            <div 
                className="absolute top-0 right-0 bottom-0 flex transition-transform duration-300 ease-out z-0 h-full"
                style={{ transform: `translateX(${dragX < -50 ? 0 : '100%'})` }}
            >
                 <button 
                    onClick={() => { setIsEditing(true); setDragX(0); }}
                    className="w-[70px] bg-amber-500 text-white flex flex-col items-center justify-center gap-1 shadow-inner h-full"
                 >
                     <PencilIcon className="w-5 h-5" />
                     <span className="text-[10px] font-bold">Edit</span>
                 </button>
                 <button 
                    onClick={handleDelete}
                    className="w-[70px] bg-rose-500 text-white flex flex-col items-center justify-center gap-1 rounded-r-2xl shadow-inner h-full"
                 >
                     <TrashIcon className="w-5 h-5" />
                     <span className="text-[10px] font-bold">Delete</span>
                 </button>
            </div>

            <div 
                className={`relative z-10 p-4 bg-white/5 backdrop-blur-3xl border transition-all duration-300 ease-out rounded-2xl ${
                    item.completed 
                    ? 'border-emerald-500/20 opacity-50' 
                    : 'border-white/10 hover:border-white/20'
                } shadow-sm`}
                style={{ transform: `translateX(${dragX}px)` }}
                onTouchStart={touchStart}
                onTouchMove={touchMove}
                onTouchEnd={touchEnd}
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center flex-grow min-w-0">
                        <button 
                            onClick={() => onToggle(item.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700 hover:border-indigo-500'}`}
                        >
                            {item.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                        </button>

                        <div className="flex-grow min-w-0 mr-4">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-sm font-bold truncate ${item.completed ? 'text-gray-600 line-through' : 'text-white'}`}>
                                    {item.text}
                                </span>
                                {item.recurring && <RefreshIcon className="w-3 h-3 text-gray-500" />}
                                {item.payDay && (
                                    <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1 shrink-0 uppercase tracking-tighter">
                                        <CalendarIcon className="w-2.5 h-2.5" />
                                        Pay: Day {item.payDay}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className={`px-1.5 py-0.5 rounded ${cat.bg} ${cat.color} font-black tracking-widest uppercase border ${cat.border} text-[9px]`}>
                                    {cat.label}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded ${pri.color} font-black tracking-widest uppercase text-[9px]`}>
                                    {pri.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pl-10 sm:pl-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <div className="flex items-center relative w-24">
                                    <span className="absolute left-2 text-gray-500 text-xs">$</span>
                                    <input 
                                        type="number" 
                                        value={editCost}
                                        onChange={(e) => setEditCost(e.target.value)}
                                        onBlur={() => { onEdit(item.id, { estimatedCost: parseFloat(editCost) || 0 }); setIsEditing(false); }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { onEdit(item.id, { estimatedCost: parseFloat(editCost) || 0 }); setIsEditing(false); } }}
                                        className="w-full bg-[#1e293b] border border-indigo-500/50 rounded-xl px-2 py-1 pl-5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div 
                                    className="font-mono font-black text-emerald-400 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-xl transition-colors"
                                    onClick={() => { setIsEditing(true); setEditCost(item.estimatedCost?.toString() || ''); }}
                                >
                                    {formatCurrency(item.estimatedCost || 0)}
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => { setIsEditing(true); setEditCost(item.estimatedCost?.toString() || ''); }} className="p-2 text-gray-500 hover:text-amber-400 hover:bg-white/5 rounded-xl"><PencilIcon className="w-4 h-4"/></button>
                             <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-rose-400 hover:bg-white/5 rounded-xl"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onEditTodo }) => {
  const [activeFilter, setActiveFilter] = useState<Todo['category'] | 'all'>('all');
  const [isAddExpanded, setIsAddExpanded] = useState(false);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Todo['category']>('shopping');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [cost, setCost] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [payDay, setPayDay] = useState<number | null>(null);

  // Helper function to resolve category details for item rendering
  const getCategoryDetails = (id: Todo['category']) => {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
  };

  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const metrics = useMemo(() => {
      const totalItems = todos.length;
      const completedItems = todos.filter(t => t.completed).length;
      const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
      const totalBudget = todos.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
      const spent = todos.filter(t => t.completed).reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
      return { totalItems, completedItems, progress, totalBudget, spent, remaining: totalBudget - spent, criticalCount: todos.filter(t => t.priority === 'critical' && !t.completed).length };
  }, [todos]);

  const categoryBreakdown = useMemo(() => {
      return CATEGORIES.map(cat => {
          const catTotal = todos.filter(t => t.category === cat.id).reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
          return { label: cat.label, value: catTotal, color: cat.hex };
      }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [todos]);

  const filteredTodos = useMemo(() => {
      let result = todos;
      if (activeFilter !== 'all') { result = result.filter(t => t.category === activeFilter); }
      return result.sort((a, b) => {
          if (a.completed === b.completed) {
             const pMap = { critical: 4, high: 3, medium: 2, low: 1 };
             return (pMap[b.priority || 'low']) - (pMap[a.priority || 'low']);
          }
          return a.completed ? 1 : -1;
      });
  }, [todos, activeFilter]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo({ text, category, priority, estimatedCost: parseFloat(cost) || 0, recurring: isRecurring, payDay: payDay || undefined });
      setText(''); setCost(''); setIsRecurring(false); setPayDay(null); setIsAddExpanded(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                  <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">System Budget</h3>
                  <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{formatCurrency(metrics.spent)}</span>
                      <span className="text-xs text-gray-500">/ {formatCurrency(metrics.totalBudget)}</span>
                  </div>
                  <div className="mt-4 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(metrics.spent / (metrics.totalBudget || 1)) * 100}%` }}></div>
                  </div>
              </div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-5 border border-white/10 flex flex-col group">
              <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><PieChartIcon className="w-3 h-3" /> Breakdown</h3>
              <div className="flex-grow"><SpendingDonutChart data={categoryBreakdown} /></div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/10 flex items-center justify-between group">
              <div>
                  <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Items Cleared</h3>
                  <div className="text-3xl font-black text-white mb-1">{metrics.completedItems} <span className="text-lg text-gray-600">/ {metrics.totalItems}</span></div>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{metrics.progress.toFixed(0)}% Done</p>
              </div>
              <div className="h-24 w-32 flex items-center justify-center transform transition-transform"><GaugeChart percentage={metrics.progress} size={100} strokeWidth={8} color="text-emerald-500" /></div>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/10 flex flex-col justify-center group">
               <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Priority Load</h3>
               <div className="flex items-center gap-4">
                   <div className="p-4 bg-rose-500/10 text-rose-500 rounded-3xl group-hover:rotate-12 transition-transform"><FireIcon className="w-8 h-8" /></div>
                   <div><div className="text-2xl font-black text-white">{metrics.criticalCount}</div><p className="text-[10px] text-gray-500 uppercase font-bold">Critical Pending</p></div>
               </div>
          </div>
      </div>

      <div className={`bg-[#1e293b] rounded-[2rem] border border-white/10 shadow-2xl relative z-20 transition-all duration-300 overflow-hidden ${isAddExpanded ? 'p-6' : 'p-3'}`}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                  <div className="bg-indigo-500 text-white p-3 rounded-[1.25rem] shadow-lg shadow-indigo-500/30"><PlusIcon className="w-6 h-6" /></div>
                  <input 
                      type="text" value={text} onChange={(e) => setText(e.target.value)} onFocus={() => setIsAddExpanded(true)}
                      placeholder="Add new purchase or goal..."
                      className="flex-grow bg-transparent border-none outline-none text-white placeholder-gray-600 text-lg font-bold"
                  />
                  {!isAddExpanded && (
                      <button type="button" onClick={() => setIsAddExpanded(true)} className="text-[10px] font-black text-indigo-400 px-4 py-2 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 transition-all uppercase tracking-widest">Expand</button>
                  )}
              </div>
              
              {isAddExpanded && (
                  <div className="animate-fade-in space-y-4 pt-4 border-t border-white/5 mt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-black">$</span>
                              <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                          </div>
                          <Dropdown options={CATEGORIES} value={category} onChange={(val) => setCategory(val)} renderOption={(c) => <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${c.bg} ${c.color}`}>{c.label}</span>} renderSelected={(c) => <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${c.bg} ${c.color}`}>{c.label}</span>} />
                          <Dropdown options={PRIORITY_OPTIONS} value={priority} onChange={(val) => setPriority(val)} renderOption={(p) => <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.color}`}>{p.label}</span>} renderSelected={(p) => <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.color}`}>{p.label}</span>} />
                          <Dropdown 
                            options={daysOfMonth} value={payDay} onChange={setPayDay} placeholder="PAYMENT DAY"
                            renderSelected={(d) => <span className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest"><CalendarIcon className="w-3.5 h-3.5"/> Day {d}</span>}
                          />
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                          <button type="button" onClick={() => setIsRecurring(!isRecurring)} className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-2 ${isRecurring ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`} title="Recurring Monthly"><RefreshIcon className={`w-4 h-4 transition-transform ${isRecurring ? 'rotate-180' : ''}`} /><span className="text-[10px] font-black uppercase tracking-widest">Recurring</span></button>
                          <div className="flex gap-3">
                              <button type="button" onClick={() => setIsAddExpanded(false)} className="px-6 py-3 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest">Cancel</button>
                              <button type="submit" disabled={!text.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-8 py-3 text-xs font-black shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest disabled:opacity-30">Add Entry</button>
                          </div>
                      </div>
                  </div>
              )}
          </form>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
          <button onClick={() => setActiveFilter('all')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-white text-[#0f172a]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>All Tasks</button>
          {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === cat.id ? `${cat.bg} ${cat.color} border ${cat.border}` : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>{cat.label}</button>
          ))}
      </div>

      <div className="relative z-0 min-h-[300px]">
          {filteredTodos.length > 0 ? filteredTodos.map(todo => (
              <SwipeableRow key={todo.id} item={todo} onToggle={onToggleTodo} onDelete={onDeleteTodo} onEdit={onEditTodo!} getCategoryDetails={getCategoryDetails} formatCurrency={formatCurrency} />
          )) : (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5"><div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"><TagIcon className="w-10 h-10 text-gray-700" /></div><h3 className="text-xl font-black text-white mb-2">Workspace Empty</h3><p className="text-gray-500 text-sm max-w-xs mx-auto">Your list is clear. Add your next monthly goal or purchase to start tracking.</p></div>
          )}
      </div>
    </div>
  );
};

export default TodoList;