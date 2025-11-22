
import React, { useState, useEffect, useMemo } from 'react';
import WelcomeHeader from './WelcomeHeader';
import { MonthData, SpendingItem } from '../types';
import { 
    WalletIcon, CheckCircleIcon, QrCodeIcon, ChartBarIcon, 
    PencilSquareIcon, LightBulbIcon, ArrowPathIcon 
} from './Icons';

interface HomePageProps {
    monthData?: MonthData;
    spendingData: SpendingItem[];
    onNavigate: (view: 'welcome' | 'mmv' | 'branch' | 'seller' | 'spending' | 'powerful_sites' | 'comparison' | 'integrations' | 'qr_generator') => void;
}

const QUOTES = [
    "The secret of getting ahead is getting started.",
    "Your limitation—it’s only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for."
];

const FocusTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound or notify
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };
    const switchMode = () => {
        setIsActive(false);
        const newMode = mode === 'focus' ? 'break' : 'focus';
        setMode(newMode);
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
             <h3 className="text-sm font-bold text-zinc-500 uppercase mb-2">Focus Timer</h3>
             <div className="text-5xl font-mono font-bold text-zinc-800 dark:text-white tabular-nums mb-4 relative z-10">
                 {formatTime(timeLeft)}
             </div>
             <div className="flex gap-2 relative z-10">
                 <button 
                    onClick={toggleTimer}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                 >
                    {isActive ? 'Pause' : 'Start'}
                 </button>
                 <button onClick={resetTimer} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-full font-semibold text-sm hover:bg-zinc-200">Reset</button>
                 <button onClick={switchMode} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-full font-semibold text-sm hover:bg-zinc-200">{mode === 'focus' ? 'Break' : 'Focus'}</button>
             </div>
             {/* Background Progress Circle Mockup */}
             <div className={`absolute inset-0 opacity-5 pointer-events-none transition-colors ${isActive ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ monthData, spendingData, onNavigate }) => {
    // Scratchpad State
    const [note, setNote] = useState(() => localStorage.getItem('dashboardNote') || '');
    const [quote, setQuote] = useState(QUOTES[0]);

    useEffect(() => {
        localStorage.setItem('dashboardNote', note);
    }, [note]);

    useEffect(() => {
        // Pick a random quote on mount (or daily)
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setQuote(QUOTES[randomIndex]);
    }, []);

    // Dashboard Snapshot Logic
    const snapshot = useMemo(() => {
        let netSalary = 0;
        let goalProgress = 0;
        let totalGoals = 0;
        let completedGoals = 0;

        if (monthData) {
             // Salary Calc (duplicated from App logic roughly for snapshot)
             let gross = 0;
             monthData.goals.forEach(g => {
                 totalGoals++;
                 if (g.progress >= g.endValue && g.endValue > 0) completedGoals++;
                 
                 // Simplified multiplier check just for the snapshot display
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

        // Spending Calc
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
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* 1. Header Section */}
      <WelcomeHeader />

      {/* 2. Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => onNavigate('spending')} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full group-hover:scale-110 transition-transform">
                  <WalletIcon />
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-sm">Add Expense</span>
          </button>
          <button onClick={() => onNavigate('mmv')} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full group-hover:scale-110 transition-transform">
                  <CheckCircleIcon />
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-sm">Check Goals</span>
          </button>
           <button onClick={() => onNavigate('comparison')} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full group-hover:scale-110 transition-transform">
                  <ChartBarIcon />
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-sm">Analytics</span>
          </button>
          <button onClick={() => onNavigate('qr_generator')} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full group-hover:scale-110 transition-transform">
                  <QrCodeIcon />
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-sm">QR Tools</span>
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 3. Snapshot Widgets */}
          <div className="lg:col-span-2 space-y-6">
               {/* Monthly Snapshot */}
              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                      Current Month Snapshot ({monthData ? monthData.name : 'No Data'})
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                          <p className="text-xs font-bold text-zinc-500 uppercase">Net Salary</p>
                          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(snapshot.netSalary)}</p>
                      </div>
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                          <p className="text-xs font-bold text-zinc-500 uppercase">Spending</p>
                          <p className="text-2xl font-extrabold text-rose-500 mt-1">{formatCurrency(snapshot.currentMonthSpend)}</p>
                      </div>
                       <div className="p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                          <p className="text-xs font-bold text-zinc-500 uppercase">Goal Completion</p>
                          <div className="flex items-end gap-2 mt-1">
                              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{snapshot.goalProgress.toFixed(0)}%</p>
                              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-full mb-1.5">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${snapshot.goalProgress}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Inspiration Card */}
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl p-6 text-white shadow-lg flex items-start gap-4 relative overflow-hidden">
                   <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm shrink-0">
                       <LightBulbIcon />
                   </div>
                   <div className="z-10">
                       <h4 className="font-bold text-lg mb-1">Daily Inspiration</h4>
                       <p className="text-white/90 italic">"{quote}"</p>
                       <button onClick={() => setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])} className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded text-white/70 hover:text-white"><ArrowPathIcon className="h-4 w-4"/></button>
                   </div>
                   {/* Decoration */}
                   <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              </div>
          </div>

          {/* 4. Scratchpad & Timer Sidebar */}
          <div className="lg:col-span-1 space-y-6">
              <FocusTimer />

              <div className="bg-white dark:bg-zinc-800 rounded-2xl p-1 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col h-full min-h-[200px]">
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-700/50 flex items-center gap-2">
                      <PencilSquareIcon className="text-zinc-400" />
                      <h3 className="font-bold text-zinc-700 dark:text-zinc-200">Scratchpad</h3>
                  </div>
                  <textarea 
                      className="flex-grow w-full p-4 bg-transparent border-none resize-none focus:ring-0 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 text-sm leading-relaxed"
                      placeholder="Type quick notes, reminders, or ideas here..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-700/30 text-xs text-zinc-400 text-center rounded-b-xl">
                      Auto-saved to local storage
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default HomePage;
