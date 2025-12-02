
import React, { useMemo } from 'react';
import WelcomeHeader from './WelcomeHeader';
import { MonthData } from '../types';
import { 
    CheckCircleIcon, ChartBarIcon, CalendarIcon, UserGroupIcon, 
    ChevronRightIcon, TrophyIcon, ClockIcon 
} from './Icons';
import GaugeChart from './GaugeChart';

interface HomePageProps {
    monthData?: MonthData;
    onNavigate: (view: 'welcome' | 'mmv' | 'branch' | 'seller' | 'comparison' | 'integrations') => void;
}

const HomePage: React.FC<HomePageProps> = ({ monthData, onNavigate }) => {

    const stats = useMemo(() => {
        let netSalary = 0;
        let goalProgress = 0;
        let totalGoals = 0;
        let completedGoals = 0;
        let daysRemaining = 0;
        let monthProgress = 0;
        let sortedGoals: any[] = [];

        if (monthData) {
             const now = new Date();
             const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
             const daysPassed = now.getDate();
             daysRemaining = totalDaysInMonth - daysPassed;
             monthProgress = (daysPassed / totalDaysInMonth) * 100;

             let gross = 0;
             
             // Helper for multiplier
             const getSalaryMultiplier = (goalName: string): number => {
                const lower = goalName.toLowerCase();
                if (lower.includes('5 minutes')) return 20000;
                else if (lower.includes('10 minutes')) return 12000;
                else if (lower.includes('20 minutes')) return 5000;
                else if (lower.includes('rejected')) return 5000;
                else if (lower.includes('sellers')) return 12000;
                return 0;
             };

             sortedGoals = monthData.goals.map(g => {
                 const mult = getSalaryMultiplier(g.name);
                 const potential = g.endValue * mult;
                 const currentEarned = g.progress * mult;
                 const pct = g.endValue > 0 ? (g.progress / g.endValue) * 100 : 0;
                 return { ...g, potential, currentEarned, pct };
             }).sort((a, b) => b.potential - a.potential); // Sort by highest potential value

             monthData.goals.forEach(g => {
                 totalGoals++;
                 if (g.progress >= g.endValue && g.endValue > 0) completedGoals++;
                 const mult = getSalaryMultiplier(g.name);
                 gross += g.progress * mult;
             });
             netSalary = gross - (gross * 0.12);
             goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
        } else {
            // Fallback dates if no month data found (e.g. creating new month)
             const now = new Date();
             const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
             const daysPassed = now.getDate();
             daysRemaining = totalDaysInMonth - daysPassed;
             monthProgress = (daysPassed / totalDaysInMonth) * 100;
        }

        return { netSalary, goalProgress, daysRemaining, monthProgress, sortedGoals };
    }, [monthData]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* 1. Header Section */}
      <WelcomeHeader />

      {/* 2. Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Financial Health Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 shadow-xl group cursor-default">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800"></div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ChartBarIcon className="w-32 h-32 text-white transform rotate-12 translate-x-8 -translate-y-8" />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full text-white">
                  <div>
                      <p className="text-emerald-100 font-medium text-sm uppercase tracking-wider mb-1">Current Net Salary</p>
                      <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{formatCurrency(stats.netSalary)}</h3>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-emerald-100 text-sm font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{monthData?.name || 'No Data'}</span>
                  </div>
              </div>
          </div>

          {/* Overall Progress Gauge */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl p-6 shadow-lg flex flex-col items-center justify-between relative overflow-hidden">
               <div className="w-full flex justify-between items-start mb-2">
                   <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider">Goal Completion</h3>
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full">
                       <TrophyIcon className="w-5 h-5" />
                   </div>
               </div>
               <div className="flex-grow flex items-center justify-center -mb-4">
                   <GaugeChart percentage={stats.goalProgress} size={180} strokeWidth={12} color="text-indigo-500" />
               </div>
               <p className="text-sm text-center text-gray-400 dark:text-gray-500 mt-2">Overall completion rate</p>
          </div>

          {/* Time Tracker */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                   <div>
                       <h3 className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider">Time Remaining</h3>
                       <p className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">{stats.daysRemaining} <span className="text-lg font-medium text-gray-400">Days</span></p>
                   </div>
                   <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-full">
                       <ClockIcon className="w-5 h-5" />
                   </div>
               </div>
               
               <div className="space-y-2">
                   <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                       <span>Month Progress</span>
                       <span>{stats.monthProgress.toFixed(0)}%</span>
                   </div>
                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                       <div className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.monthProgress}%` }}></div>
                   </div>
                   <p className="text-xs text-gray-400 mt-2 text-right">Until next month</p>
               </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Quick Actions</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => onNavigate('mmv')} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:shadow-md transition-all group text-left">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                          <CheckCircleIcon className="w-6 h-6" />
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">Check Goals</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Update your progress</p>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-300 ml-auto group-hover:text-emerald-500 transition-colors" />
                  </button>

                  <button onClick={() => onNavigate('comparison')} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500/50 hover:shadow-md transition-all group text-left">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                          <ChartBarIcon className="w-6 h-6" />
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">View Analytics</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">See performance trends</p>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-300 ml-auto group-hover:text-blue-500 transition-colors" />
                  </button>

                  <button onClick={() => onNavigate('seller')} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500/50 hover:shadow-md transition-all group text-left">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                          <UserGroupIcon className="w-6 h-6" />
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">Manage Sellers</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Track team performance</p>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-300 ml-auto group-hover:text-purple-500 transition-colors" />
                  </button>
              </div>
          </div>

          {/* High Value Goals */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">High Value Goals</h3>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sorted by Potential</span>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 dark:border-gray-700/50 shadow-sm min-h-[300px]">
                  {stats.sortedGoals.length > 0 ? (
                      <div className="space-y-4">
                          {stats.sortedGoals.slice(0, 4).map((goal: any) => (
                              <div key={goal.id} className="group">
                                  <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-2 h-8 rounded-full ${goal.pct >= 100 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                          <div>
                                              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{goal.name}</h4>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Target: {goal.endValue}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.currentEarned)}</p>
                                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">of {formatCurrency(goal.potential)}</p>
                                      </div>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${goal.pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${Math.min(goal.pct, 100)}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                          {stats.sortedGoals.length > 4 && (
                              <p className="text-center text-xs text-gray-400 pt-2">+ {stats.sortedGoals.length - 4} more goals</p>
                          )}
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                          <TrophyIcon className="w-12 h-12 mb-2" />
                          <p>No active goals found</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomePage;
