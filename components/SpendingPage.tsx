
import React, { useState, useMemo, useEffect } from 'react';
import { SpendingItem } from '../types';
import { WalletIcon, PlusIcon, TrashIcon, TagIcon, CalendarIcon, ArrowDownTrayIcon, FunnelIcon, ArrowPathIcon, ChartBarIcon } from './Icons';

interface SpendingPageProps {
  items: SpendingItem[];
  onAdd: (item: Omit<SpendingItem, 'id'>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Travel',
  'Education',
  'Other'
];

const SpendingPage: React.FC<SpendingPageProps> = ({ items, onAdd, onDelete }) => {
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter & Settings State
  const [budget, setBudget] = useState<number>(() => {
      const saved = localStorage.getItem('spendingBudget');
      return saved ? parseFloat(saved) : 2000; // Default budget
  });
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(() => {
      try {
          const saved = localStorage.getItem('categoryBudgets');
          return saved ? JSON.parse(saved) : {};
      } catch {
          return {};
      }
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'week'>('month');

  useEffect(() => {
      localStorage.setItem('spendingBudget', budget.toString());
  }, [budget]);

  useEffect(() => {
      localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onAdd({
        amount: numAmount,
        category,
        note,
        date
      });
      setAmount('');
      setNote('');
    }
  };

  const handleExport = () => {
      const headers = ["Date", "Category", "Amount", "Note"];
      const csvContent = [
          headers.join(','),
          ...items.map(i => [i.date, `"${i.category}"`, i.amount, `"${i.note || ''}"`].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spending_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Filter Logic
  const filteredItems = useMemo(() => {
      const now = new Date();
      return items.filter(item => {
          const itemDate = new Date(item.date);
          
          // Date Filter
          let matchesDate = true;
          if (dateRange === 'month') {
              matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
          } else if (dateRange === 'week') {
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              matchesDate = itemDate >= oneWeekAgo;
          }

          // Category Filter
          let matchesCategory = filterCategory === 'All' || item.category === filterCategory;

          return matchesDate && matchesCategory;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, dateRange, filterCategory]);

  // Stats Logic
  const stats = useMemo(() => {
      const totalSpent = filteredItems.reduce((sum, item) => sum + item.amount, 0);
      
      // Category Breakdown
      const breakdown: Record<string, number> = {};
      filteredItems.forEach(item => {
          breakdown[item.category] = (breakdown[item.category] || 0) + item.amount;
      });
      
      const sortedBreakdown = Object.entries(breakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([name, val]) => {
            const catLimit = categoryBudgets[name] || 0;
            return { 
                name, 
                val, 
                percent: (val / totalSpent) * 100,
                limit: catLimit,
                limitPercent: catLimit > 0 ? (val / catLimit) * 100 : 0
            };
        });

      return { totalSpent, sortedBreakdown };
  }, [filteredItems, categoryBudgets]);

  // Overall monthly spend (ignoring filters) for budget bar
  const monthlyTotal = useMemo(() => {
      const now = new Date();
      return items.reduce((sum, item) => {
          const d = new Date(item.date);
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
              return sum + item.amount;
          }
          return sum;
      }, 0);
  }, [items]);


  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const formatDate = (dateString: string) => new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(new Date(dateString));

  const budgetProgress = Math.min((monthlyTotal / budget) * 100, 100);
  const budgetColor = budgetProgress > 90 ? 'bg-rose-500' : budgetProgress > 75 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <WalletIcon className="h-8 w-8 text-white" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Spending Tracker</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Monitor and control your expenses.</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium transition-colors text-sm">
                <ArrowDownTrayIcon /> Export CSV
            </button>
            <button onClick={() => setIsManageCategoriesOpen(!isManageCategoriesOpen)} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg font-medium transition-colors text-sm">
                 Set Category Limits
            </button>
        </div>
      </div>
      
      {isManageCategoriesOpen && (
          <div className="mb-8 bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 animate-fade-in">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Category Monthly Limits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map(cat => (
                      <div key={cat} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-700/30 p-3 rounded-lg">
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{cat}</span>
                          <input 
                            type="number" 
                            placeholder="No Limit"
                            value={categoryBudgets[cat] || ''}
                            onChange={e => {
                                const val = parseFloat(e.target.value);
                                setCategoryBudgets(prev => ({...prev, [cat]: isNaN(val) ? 0 : val}));
                            }}
                            className="w-24 px-2 py-1 text-sm text-right bg-white dark:bg-zinc-600 border border-zinc-200 dark:border-zinc-500 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                      </div>
                  ))}
              </div>
              <button onClick={() => setIsManageCategoriesOpen(false)} className="mt-4 text-sm text-indigo-600 hover:underline">Done</button>
          </div>
      )}

      {/* Budget Card */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 mb-8">
           <div className="flex justify-between items-end mb-4">
               <div>
                   <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Monthly Budget</h3>
                   <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{formatCurrency(monthlyTotal)}</span>
                       <span className="text-zinc-400">/</span>
                       {isEditingBudget ? (
                           <input 
                                type="number" 
                                value={budget} 
                                onChange={e => setBudget(parseFloat(e.target.value))} 
                                onBlur={() => setIsEditingBudget(false)}
                                autoFocus
                                className="w-24 bg-zinc-100 dark:bg-zinc-700 rounded px-1 py-0.5 font-bold text-zinc-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500"
                           />
                       ) : (
                           <span onClick={() => setIsEditingBudget(true)} className="text-xl font-semibold text-zinc-500 cursor-pointer hover:text-indigo-500 border-b border-dashed border-zinc-300">{formatCurrency(budget)}</span>
                       )}
                   </div>
               </div>
               <div className="text-right">
                   <span className={`text-sm font-bold ${budgetProgress > 100 ? 'text-rose-500' : 'text-emerald-600'}`}>
                       {budgetProgress.toFixed(1)}% Used
                   </span>
                   <p className="text-xs text-zinc-400">{formatCurrency(Math.max(0, budget - monthlyTotal))} remaining</p>
               </div>
           </div>
           <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
               <div className={`h-full ${budgetColor} transition-all duration-500`} style={{ width: `${budgetProgress}%` }}></div>
           </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form & Breakdown */}
        <div className="space-y-8 lg:sticky lg:top-24">
            {/* Add Expense */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                        <PlusIcon /> New Transaction
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold text-lg"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Details</label>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                             <div className="relative">
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none text-sm"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                    <TagIcon className="h-3 w-3" />
                                </div>
                            </div>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                required
                            />
                        </div>
                        <input 
                            type="text" 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            placeholder="Note (optional)"
                            className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Add Expense
                    </button>
                </form>
            </div>

            {/* Visual Breakdown */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700">
                 <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                     <ChartBarIcon /> Top Categories
                 </h3>
                 {stats.sortedBreakdown.length > 0 ? (
                     <div className="space-y-3">
                         {stats.sortedBreakdown.slice(0, 5).map((item, i) => (
                             <div key={item.name}>
                                 <div className="flex justify-between text-sm mb-1">
                                     <span className="text-zinc-600 dark:text-zinc-300">{item.name}</span>
                                     <div className="text-right">
                                         <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(item.val)}</span>
                                         {item.limit > 0 && (
                                             <span className={`ml-1 text-xs ${item.val > item.limit ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                 / {formatCurrency(item.limit)}
                                             </span>
                                         )}
                                     </div>
                                 </div>
                                 <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden flex">
                                     <div className={`h-full ${item.limit > 0 && item.val > item.limit ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${item.percent}%`, opacity: 1 - (i * 0.15) }}></div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <p className="text-sm text-zinc-400 italic text-center py-4">No data to display</p>
                 )}
            </div>
        </div>

        {/* Right Column: Transaction List */}
        <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sticky top-0 bg-zinc-100 dark:bg-[#28282B] z-10 py-2">
                <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Transactions</h3>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <FunnelIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <div className="relative flex-grow sm:flex-grow-0">
                         <select 
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            <option value="all">All Time</option>
                            <option value="month">This Month</option>
                            <option value="week">Last 7 Days</option>
                        </select>
                         <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[800px] pr-2 space-y-3 custom-scrollbar">
                {filteredItems.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-10 text-center border border-zinc-200 dark:border-zinc-700 border-dashed">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                            <FunnelIcon className="h-8 w-8" />
                        </div>
                        <h4 className="text-lg font-medium text-zinc-900 dark:text-white">No transactions found</h4>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Try adjusting your filters or add a new expense.</p>
                        <button onClick={() => {setFilterCategory('All'); setDateRange('all')}} className="mt-4 text-indigo-500 font-medium hover:underline flex items-center justify-center gap-1 mx-auto">
                            <ArrowPathIcon className="h-4 w-4"/> Clear Filters
                        </button>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div key={item.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                    ${item.category === 'Food & Dining' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                                      item.category === 'Transportation' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                      item.category === 'Shopping' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' :
                                      'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'}`}
                                >
                                    <TagIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-zinc-900 dark:text-white truncate">{item.category}</h4>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="font-mono">{formatDate(item.date)}</span>
                                        {item.note && (
                                            <>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="truncate max-w-[200px]">{item.note}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                                <span className="font-bold text-zinc-900 dark:text-white text-lg">{formatCurrency(item.amount)}</span>
                                <button 
                                    onClick={() => onDelete(item.id)}
                                    className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Delete transaction"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingPage;
