
import React, { useState, useEffect, useMemo } from 'react';
import WelcomeHeader from './WelcomeHeader';
import { MonthData, SpendingItem } from '../types';
import { 
    WalletIcon, CheckCircleIcon, QrCodeIcon, ChartBarIcon, 
    PencilSquareIcon, LightBulbIcon, ArrowPathIcon, CalculatorIcon,
    ServerStackIcon, CloudIcon, PlusIcon, TrashIcon, CheckCircleIcon as CheckIcon,
    ScaleIcon
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

// --- Sub-Components for Gadgets ---

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
             <div className={`absolute inset-0 opacity-5 pointer-events-none transition-colors ${isActive ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
        </div>
    );
};

const QuickCalculator: React.FC = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');

    const handlePress = (val: string) => {
        if (val === '=') {
            try {
                // eslint-disable-next-line no-eval
                setResult(eval(input).toString());
            } catch {
                setResult('Error');
            }
        } else if (val === 'C') {
            setInput('');
            setResult('');
        } else {
            setInput(prev => prev + val);
        }
    };

    const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'];

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 text-zinc-500 dark:text-zinc-400">
                <CalculatorIcon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Quick Calc</span>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-lg p-3 mb-3 text-right">
                <div className="text-xs text-zinc-400 min-h-[1rem]">{input || '0'}</div>
                <div className="text-xl font-bold text-zinc-800 dark:text-white truncate">{result || (input ? '' : '0')}</div>
            </div>
            <div className="grid grid-cols-4 gap-2 flex-grow">
                {buttons.map(btn => (
                    <button
                        key={btn}
                        onClick={() => handlePress(btn)}
                        className={`rounded-lg font-bold text-sm transition-colors ${
                            btn === '=' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                            btn === 'C' ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400' :
                            ['/','*','-','+'].includes(btn) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' :
                            'bg-zinc-50 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600'
                        }`}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
};

interface Habit {
    id: string;
    text: string;
    completed: boolean;
}

const DailyHabits: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>(() => {
        try {
            const saved = localStorage.getItem('dailyHabits');
            return saved ? JSON.parse(saved) : [
                { id: '1', text: 'Drink Water', completed: false },
                { id: '2', text: 'Read 10 pages', completed: false },
                { id: '3', text: 'Exercise', completed: false },
            ];
        } catch { return []; }
    });
    const [newHabit, setNewHabit] = useState('');

    useEffect(() => {
        localStorage.setItem('dailyHabits', JSON.stringify(habits));
    }, [habits]);

    const toggleHabit = (id: string) => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    };

    const addHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        setHabits(prev => [...prev, { id: Date.now().toString(), text: newHabit, completed: false }]);
        setNewHabit('');
    };

    const removeHabit = (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">Daily Habits</span>
                </div>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full text-zinc-500">
                    {habits.filter(h => h.completed).length}/{habits.length}
                </span>
            </div>
            
            <div className="flex-grow space-y-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
                {habits.map(habit => (
                    <div key={habit.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => toggleHabit(habit.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${habit.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600 text-transparent hover:border-emerald-400'}`}
                            >
                                <CheckIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className={`text-sm ${habit.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>{habit.text}</span>
                        </div>
                        <button onClick={() => removeHabit(habit.id)} className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={addHabit} className="mt-3 relative">
                <input 
                    type="text" 
                    placeholder="Add new habit..." 
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500">
                    <PlusIcon />
                </button>
            </form>
        </div>
    );
};

const StorageWidget: React.FC = () => {
    const [usage, setUsage] = useState(0); // in MB
    
    useEffect(() => {
        let total = 0;
        for (let x in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
                total += (localStorage[x].length + x.length) * 2;
            }
        }
        setUsage(total / 1024 / 1024);
    }, []);

    const max = 5; // Approx 5MB limit
    const percent = Math.min((usage / max) * 100, 100);

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
                <ServerStackIcon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Local Storage</span>
            </div>
            <div className="flex justify-between items-end mb-1">
                <span className="text-2xl font-bold text-zinc-800 dark:text-white">{usage.toFixed(2)} <span className="text-xs font-normal text-zinc-500">MB</span></span>
                <span className="text-xs text-zinc-400">of 5 MB</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${percent > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
};

const WeatherWidget: React.FC = () => {
    // Mock Weather Widget
    return (
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-between relative overflow-hidden h-full">
            <div className="flex justify-between items-start z-10">
                <div>
                    <span className="text-xs font-bold text-sky-100 uppercase">Weather</span>
                    <h4 className="font-bold text-lg">Tashkent</h4>
                </div>
                <CloudIcon className="h-8 w-8 text-white/80" />
            </div>
            <div className="z-10 mt-2">
                <span className="text-3xl font-bold">24°</span>
                <span className="text-sm opacity-80 ml-1">Sunny</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        </div>
    );
}

const UnitConverter: React.FC = () => {
    const [val, setVal] = useState('');
    const [type, setType] = useState('km-miles');

    const result = useMemo(() => {
        const v = parseFloat(val);
        if (isNaN(v)) return '---';
        switch (type) {
            case 'km-miles': return (v * 0.621371).toFixed(2) + ' mi';
            case 'miles-km': return (v / 0.621371).toFixed(2) + ' km';
            case 'kg-lbs': return (v * 2.20462).toFixed(2) + ' lbs';
            case 'lbs-kg': return (v / 2.20462).toFixed(2) + ' kg';
            case 'c-f': return ((v * 9/5) + 32).toFixed(1) + ' °F';
            case 'f-c': return ((v - 32) * 5/9).toFixed(1) + ' °C';
            default: return '';
        }
    }, [val, type]);

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 text-zinc-500 dark:text-zinc-400">
                <ScaleIcon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Converter</span>
            </div>
            <div className="flex-grow flex flex-col gap-3">
                 <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                 >
                     <option value="km-miles">KM to Miles</option>
                     <option value="miles-km">Miles to KM</option>
                     <option value="kg-lbs">KG to Lbs</option>
                     <option value="lbs-kg">Lbs to KG</option>
                     <option value="c-f">Celsius to Fahr</option>
                     <option value="f-c">Fahr to Celsius</option>
                 </select>
                 <input 
                    type="number" 
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    placeholder="Value..."
                    className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400"
                 />
                 <div className="mt-auto pt-2 text-right">
                     <span className="text-2xl font-bold text-zinc-800 dark:text-white">{result}</span>
                 </div>
            </div>
        </div>
    );
};

const BreathingWidget: React.FC = () => {
    const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
    const [text, setText] = useState('Start');
    
    useEffect(() => {
        if (phase === 'idle') {
            setText('Start');
            return;
        }
        
        let timeout: any;
        if (phase === 'inhale') {
            setText('Breathe In');
            timeout = setTimeout(() => setPhase('hold'), 4000);
        } else if (phase === 'hold') {
            setText('Hold');
            timeout = setTimeout(() => setPhase('exhale'), 4000); 
        } else if (phase === 'exhale') {
            setText('Breathe Out');
            timeout = setTimeout(() => setPhase('inhale'), 4000);
        }
        return () => clearTimeout(timeout);
    }, [phase]);

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm h-full flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group" onClick={() => setPhase(p => p === 'idle' ? 'inhale' : 'idle')}>
            <div className={`absolute w-32 h-32 rounded-full bg-sky-100 dark:bg-sky-900/30 transition-transform duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'scale-150' : phase === 'exhale' ? 'scale-50' : 'scale-100'}`}></div>
            <div className={`relative z-10 text-lg font-bold transition-colors ${phase !== 'idle' ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`}>
                {text}
            </div>
            {phase === 'idle' && <p className="text-xs text-zinc-400 mt-2 z-10">Tap to relax</p>}
        </div>
    );
};

const MiniCalendarWidget: React.FC = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = sun
    
    const days = [];
    for(let i=0; i<firstDay; i++) days.push(<div key={`empty-${i}`} className="w-6 h-6"></div>);
    for(let i=1; i<=daysInMonth; i++) {
        days.push(
            <div key={i} className={`w-6 h-6 flex items-center justify-center text-[10px] rounded-full ${i === today ? 'bg-rose-500 text-white font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                {i}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm">
             <div className="flex items-center justify-between mb-3">
                 <span className="text-xs font-bold uppercase text-zinc-500">{now.toLocaleDateString('en-US', { month: 'long' })}</span>
                 <span className="text-xs text-zinc-400">{year}</span>
             </div>
             <div className="grid grid-cols-7 gap-1 place-items-center">
                 {['S','M','T','W','T','F','S'].map((d,i) => <span key={i} className="text-[10px] text-zinc-400 font-bold">{d}</span>)}
                 {days}
             </div>
        </div>
    );
}

// --- Main HomePage Component ---

const HomePage: React.FC<HomePageProps> = ({ monthData, spendingData, onNavigate }) => {
    // Scratchpad State
    const [note, setNote] = useState(() => localStorage.getItem('dashboardNote') || '');
    const [quote, setQuote] = useState(QUOTES[0]);

    useEffect(() => {
        localStorage.setItem('dashboardNote', note);
    }, [note]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setQuote(QUOTES[randomIndex]);
    }, []);

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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Row 1 */}
                  <QuickCalculator />
                  <div className="space-y-6 flex flex-col h-full">
                      <div className="flex-1"><WeatherWidget /></div>
                      <div className="flex-1"><StorageWidget /></div>
                  </div>
                  
                  {/* Row 2 */}
                  <UnitConverter />
                  <BreathingWidget />
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
                   <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              </div>
          </div>

          {/* Right Column (Sidebar Gadgets) */}
          <div className="lg:col-span-4 space-y-6">
              {/* Mini Calendar */}
              <MiniCalendarWidget />

              {/* Focus Timer */}
              <FocusTimer />

              {/* Daily Habits */}
              <DailyHabits />

              {/* Scratchpad */}
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
                      Auto-saved
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default HomePage;
