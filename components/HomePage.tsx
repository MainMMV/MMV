import React, { useMemo } from 'react';
import WelcomeHeader from './WelcomeHeader';
import { MonthData, SpendingItem } from '../types';
import { 
    WalletIcon, CheckCircleIcon, QrCodeIcon, ChartBarIcon
} from './Icons';

interface HomePageProps {
    monthData?: MonthData;
    spendingData: SpendingItem[];
    onNavigate: (view: 'welcome' | 'mmv' | 'branch' | 'seller' | 'spending' | 'powerful_sites' | 'comparison' | 'integrations' | 'qr_generator') => void;
}

const HomePage: React.FC<HomePageProps> = ({ monthData, spendingData, onNavigate }) => {

    const snapshot = useMemo(() => {
        let netSalary = 0;
        let goalProgress = 0;
        let totalGoals = 0;
        let completedGoals = 0;

        if (monthData) {
             let gross = 0;
             monthData.goals.forEach(g => {
                 totalGoals++;
                 if (g.progress >= g.endValue && g.endValue > 0) completedGoals++;
                 let mult = 0;
                 const lower = g.name.toLowerCase();
                 if (lower.includes('5 minutes')) mult = 20000;
                 else if (lower.includes('10 minutes')) mult = 12000;
                 else if (lower.includes('20 minutes')) mult = 5000;
                 else if (lower.includes('rejected')) mult = 5000;
                 else if (lower.includes('sellers')) mult = 12000;
                 gross += g.progress * mult;
             });
             netSalary = gross - (gross * 0.12);
             goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        }

        const now = new Date();
        const currentMonthSpend = spendingData.reduce((sum, item) => {
            const d = new Date(item.date);
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                return sum + item.amount;
            }
            return sum;
        }, 0);

        return { netSalary, goalProgress, currentMonthSpend };
    }, [monthData, spendingData]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* 1. Header Section */}
      <WelcomeHeader />

      {/* 2. Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => onNavigate('spending')} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full group-hover:scale-110 transition-transform">
                  <WalletIcon />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Add Expense</span>
          </button>
          <button onClick={() => onNavigate('mmv')} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full group-hover:scale-110 transition-transform">
                  <CheckCircleIcon />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Check Goals</span>
          </button>
           <button onClick={() => onNavigate('comparison')} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full group-hover:scale-110 transition-transform">
                  <ChartBarIcon />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Analytics</span>
          </button>
          <button onClick={() => onNavigate('qr_generator')} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full group-hover:scale-110 transition-transform">
                  <QrCodeIcon />
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">QR Tools</span>
          </button>
      </div>

      {/* 3. Monthly Snapshot */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Current Month Snapshot ({monthData ? monthData.name : 'No Data'})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Salary</p>
                  <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(snapshot.netSalary)}</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spending</p>
                  <p className="text-3xl font-extrabold text-rose-500 mt-2">{formatCurrency(snapshot.currentMonthSpend)}</p>
              </div>
               <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Goal Completion</p>
                  <div className="flex flex-col gap-2 mt-2">
                      <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">{snapshot.goalProgress.toFixed(0)}%</p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${snapshot.goalProgress}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomePage;