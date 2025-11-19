
import React, { useState, useMemo } from 'react';
import { SpendingItem } from '../types';
import { WalletIcon, PlusIcon, TrashIcon, TagIcon, CalendarIcon } from './Icons';

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
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
      // Keep date and category for potential consecutive entries
    }
  };

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totalSpent = items.reduce((sum, item) => sum + item.amount, 0);
    
    const monthlySpent = items.reduce((sum, item) => {
        const itemDate = new Date(item.date);
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
            return sum + item.amount;
        }
        return sum;
    }, 0);

    return { totalSpent, monthlySpent };
  }, [items]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  // Group items by date (most recent first)
  const sortedItems = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <WalletIcon className="h-8 w-8 text-white" />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Spending Tracker</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Manage your expenses efficiently</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {/* Stats Cards */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-emerald-100 font-medium text-sm uppercase tracking-wider mb-1">This Month</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.monthlySpent)}</p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
             <h3 className="text-zinc-500 dark:text-zinc-400 font-medium text-sm uppercase tracking-wider mb-1">Total Spent</h3>
             <p className="text-3xl font-bold text-zinc-900 dark:text-white">{formatCurrency(stats.totalSpent)}</p>
        </div>
         <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-center items-start">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{items.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Expense Form */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 overflow-hidden sticky top-24">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                        <PlusIcon /> Add New Expense
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                        <div className="relative">
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none transition-all"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <TagIcon className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Note <span className="text-zinc-400 font-normal">(Optional)</span></label>
                        <input 
                            type="text" 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            placeholder="What was this for?"
                            className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mt-2"
                    >
                        Add Transaction
                    </button>
                </form>
            </div>
        </div>

        {/* Transaction List */}
        <div className="lg:col-span-2">
            <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-4">Recent Transactions</h3>
            
            {items.length === 0 ? (
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-10 text-center border border-zinc-200 dark:border-zinc-700 border-dashed">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <WalletIcon className="h-8 w-8" />
                    </div>
                    <h4 className="text-lg font-medium text-zinc-900 dark:text-white">No transactions yet</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Add your first expense to start tracking.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedItems.map(item => (
                        <div key={item.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                    ${item.category === 'Food & Dining' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 
                                      item.category === 'Transportation' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                      item.category === 'Shopping' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' :
                                      'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'}`}
                                >
                                    <TagIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-zinc-900 dark:text-white">{item.category}</h4>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="flex items-center gap-1"><CalendarIcon /> {formatDate(item.date)}</span>
                                        {item.note && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate max-w-[150px]">{item.note}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(item.amount)}</span>
                                <button 
                                    onClick={() => onDelete(item.id)}
                                    className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    aria-label="Delete transaction"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SpendingPage;
