
import React, { useMemo, useState } from 'react';
import { MonthData } from '../types';

// Icons
interface IconProps { className?: string; }
const BulbIcon = ({ className }: IconProps) => <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ScaleIcon = ({ className }: IconProps) => <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
const PieChartIcon = ({ className }: IconProps) => <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const TrendingUpIcon = ({ className }: IconProps) => <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const SparklesIcon = ({ className }: IconProps) => <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" /></svg>;
const SearchIcon = ({ className }: IconProps) => <svg className={className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CheckCircleIcon = ({ className }: IconProps) => <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface AIDashboardProps {
  allMonths: MonthData[];
}

// --- Constants & Helpers ---

const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatCompact = (val: number) =>
    new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(val);

const getSalaryMultiplier = (goalName: string): number => {
    const lowerCaseName = goalName.toLowerCase();
    switch (lowerCaseName) {
      case 'within 5 minutes': return 20000;
      case 'within 10 minutes': return 12000;
      case 'within 20 minutes': return 5000;
      case 'who rejected': return 5000;
      case 'created by sellers': return 12000;
      default: return 0;
    }
};

const GOAL_COLORS: Record<string, string> = {
    'within 5 minutes': '#10b981', // Emerald
    'within 10 minutes': '#3b82f6', // Blue
    'within 20 minutes': '#8b5cf6', // Violet
    'who rejected': '#f43f5e', // Rose
    'created by sellers': '#f59e0b', // Amber
    'default': '#9ca3af' // Gray
};

const getGoalColor = (name: string) => {
    const lower = name.toLowerCase();
    for (const key in GOAL_COLORS) {
        if (lower.includes(key)) return GOAL_COLORS[key];
    }
    return GOAL_COLORS['default'];
};

const getSmoothPath = (points: [number, number][]) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[i + 1];
        const cp1x = x0 + (x1 - x0) / 2;
        const cp1y = y0;
        const cp2x = x0 + (x1 - x0) / 2;
        const cp2y = y1;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x1} ${y1}`;
    }
    return d;
};

// --- STRATEGY ENGINE COMPONENT ---
const StrategyEngine: React.FC<{ data: any }> = ({ data }) => {
    const strategies = useMemo(() => {
        const strats = [];
        const { currentGross, avg, stdDev, scatterGoals, cumulativeGross, currentNet } = data;
        const cv = avg > 0 ? stdDev / avg : 0;

        // 1. Volatility Strategy
        if (cv > 0.25) {
            strats.push({
                type: 'Risk Mgmt',
                title: 'Stabilize Income',
                text: 'High volatility detected. Prioritize a 6-month emergency fund before aggressive investing.',
                color: 'text-amber-400',
                bg: 'bg-amber-400/10 border-amber-400/20'
            });
        } else {
            strats.push({
                type: 'Growth',
                title: 'Aggressive Growth',
                text: 'Income is stable. You can afford higher-risk investments or reinvestment into skills.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-400/10 border-emerald-400/20'
            });
        }

        // 2. Concentration Strategy
        const totalIncome = scatterGoals.reduce((s:any, g:any) => s + g.income, 0);
        const maxSource = Math.max(...scatterGoals.map((g:any) => g.income));
        const concentration = totalIncome > 0 ? maxSource / totalIncome : 0;

        if (concentration > 0.5) {
            strats.push({
                type: 'Diversity',
                title: 'Single Point of Failure',
                text: `You rely heavily (${(concentration*100).toFixed(0)}%) on one goal. Diversify effort to secondary goals to reduce risk.`,
                color: 'text-rose-400',
                bg: 'bg-rose-400/10 border-rose-400/20'
            });
        } else {
             strats.push({
                type: 'Optimization',
                title: 'Balanced Portfolio',
                text: 'Good revenue spread. Focus on optimizing efficiency of your mid-tier goals.',
                color: 'text-blue-400',
                bg: 'bg-blue-400/10 border-blue-400/20'
            });
        }

        // 3. Wealth/Spending Strategy
        const burnRate = 3000; // Assumption
        const runway = currentNet / burnRate;
        if (runway < 2) {
             strats.push({ type: 'Cashflow', title: 'Boost Liquidity', text: 'Runway is tight (<2 mo). Cut discretionary spending or push for a quick sales sprint.', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' });
        } else if (currentGross > avg * 1.1) {
             strats.push({ type: 'Momentum', title: 'Press the Advantage', text: 'Current month is beating average. Double down on what is working right now.', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' });
        }

        return strats;
    }, [data]);

    return (
        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                <BulbIcon /> AI Strategy Engine
            </h3>
            <div className="space-y-3 flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {strategies.map((s, i) => (
                    <div key={i} className={`flex gap-3 items-start p-3 rounded-lg border transition-colors ${s.bg}`}>
                        <div className={`mt-0.5 font-bold text-[10px] px-2 py-0.5 rounded bg-[#111827] border border-gray-700 uppercase tracking-wider ${s.color}`}>{s.type}</div>
                        <div>
                            <h4 className="text-gray-200 font-bold text-sm">{s.title}</h4>
                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">{s.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- STRATEGIC INSIGHTS COMPONENT (New) ---
const StrategicInsights: React.FC<{ goals: any[] }> = ({ goals }) => {
    // 1. Money Makers
    const moneyMakers = [...goals].sort((a, b) => b.income - a.income).slice(0, 3);
    
    // 2. Quick Wins (Progress 70-99%)
    const quickWins = goals.filter(g => g.completion >= 70 && g.completion < 100).sort((a, b) => b.completion - a.completion).slice(0, 3);
    
    // 3. Sleeping Giants (Low Progress < 40%, Sorted by potential value)
    const sleepingGiants = goals.filter(g => g.completion < 40).sort((a, b) => b.potential - a.potential).slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 shadow-lg">
                <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUpIcon className="w-4 h-4" /> Top Money Makers
                </h4>
                <div className="space-y-3">
                    {moneyMakers.map(g => (
                        <div key={g.name} className="flex justify-between items-center text-sm">
                            <span className="text-gray-300 truncate pr-2">{g.name}</span>
                            <span className="text-white font-bold font-mono whitespace-nowrap">{formatCurrency(g.income)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 shadow-lg">
                <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" /> Closing In (70%+)
                </h4>
                {quickWins.length > 0 ? (
                    <div className="space-y-3">
                        {quickWins.map(g => (
                            <div key={g.name} className="flex justify-between items-center text-sm">
                                <span className="text-gray-300 truncate pr-2">{g.name}</span>
                                <span className="text-white font-bold whitespace-nowrap">{g.completion.toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-gray-600 text-xs italic py-2">No goals in 'Quick Win' range.</div>}
            </div>

            <div className="bg-[#111827] rounded-2xl p-5 border border-gray-800 shadow-lg">
                <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BulbIcon className="w-4 h-4" /> Sleeping Giants
                </h4>
                {sleepingGiants.length > 0 ? (
                    <div className="space-y-3">
                        {sleepingGiants.map(g => (
                            <div key={g.name} className="flex justify-between items-center text-sm">
                                <span className="text-gray-300 truncate pr-2">{g.name}</span>
                                <div className="text-right">
                                    <span className="block text-white font-bold text-xs whitespace-nowrap">{formatCurrency(g.potential)} Pot.</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-gray-600 text-xs italic py-2">No low-progress high-value goals.</div>}
            </div>
        </div>
    )
}

// --- WIDGET COMPONENTS (Unchanged Logic, Compacted for brevity) ---
const SalarySimulator: React.FC<{ monthData: MonthData }> = ({ monthData }) => {
    const [simulatedProgress, setSimulatedProgress] = useState<Record<string, number>>({});
    useMemo(() => {
        const initial: Record<string, number> = {};
        monthData.goals.forEach(g => initial[g.id] = g.progress);
        setSimulatedProgress(initial);
    }, [monthData]);
    const calculateTotal = (progressMap: Record<string, number>) => {
        return monthData.goals.reduce((sum, g) => {
            const prog = progressMap[g.id] ?? g.progress;
            return sum + (prog * getSalaryMultiplier(g.name));
        }, 0);
    };
    const currentTotal = calculateTotal({});
    const simulatedTotal = calculateTotal(simulatedProgress);
    const diff = simulatedTotal - currentTotal;
    return (
        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ScaleIcon /> Salary Simulator</h3>
            <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                {monthData.goals.map(g => (
                    <div key={g.id} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400"><span>{g.name}</span><span>{simulatedProgress[g.id] ?? g.progress} / {g.endValue}</span></div>
                        <input type="range" min="0" max={Math.max(g.endValue * 1.5, g.progress * 1.5, 10)} value={simulatedProgress[g.id] ?? g.progress} onChange={(e) => setSimulatedProgress(prev => ({...prev, [g.id]: parseInt(e.target.value)}))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800"><div className="flex justify-between items-end"><div className="text-gray-400 text-sm">Simulated Net</div><div className="text-right"><div className="text-2xl font-bold text-white">{formatCurrency(simulatedTotal * 0.88)}</div><div className={`text-xs ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{diff >= 0 ? '+' : ''}{formatCurrency(diff * 0.88)} vs Actual</div></div></div></div>
        </div>
    );
};
const BenchmarkRadar: React.FC<{ current: MonthData, best: MonthData }> = ({ current, best }) => {
    const goalsToCompare = current.goals.slice(0, 5);
    const count = goalsToCompare.length; const radius = 80; const center = 100;
    const getPoint = (value: number, max: number, index: number) => { const ratio = max > 0 ? Math.min(value / max, 1) : 0; const angle = (Math.PI * 2 * index) / count - Math.PI / 2; return [center + radius * ratio * Math.cos(angle), center + radius * ratio * Math.sin(angle)]; };
    const currentPoints = goalsToCompare.map((g, i) => { const bestGoal = best.goals.find(bg => bg.name === g.name); const max = bestGoal ? Math.max(bestGoal.progress, g.endValue) : g.endValue || 100; return getPoint(g.progress, max, i).join(','); }).join(' ');
    const bestPoints = goalsToCompare.map((g, i) => { const bestGoal = best.goals.find(bg => bg.name === g.name); const max = bestGoal ? Math.max(bestGoal.progress, g.endValue) : g.endValue || 100; return getPoint(bestGoal ? bestGoal.progress : 0, max, i).join(','); }).join(' ');
    return (
        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-2 self-start w-full">Benchmark Radar</h3>
            <div className="relative w-[200px] h-[200px]"><svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">{[0.2, 0.4, 0.6, 0.8, 1].map(r => <circle key={r} cx={center} cy={center} r={radius * r} fill="none" stroke="#374151" strokeWidth="1" />)}{goalsToCompare.map((_, i) => { const angle = (Math.PI * 2 * i) / count - Math.PI / 2; return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="#374151" />; })}<polygon points={bestPoints} fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" /><polygon points={currentPoints} fill="rgba(99, 102, 241, 0.4)" stroke="#6366f1" strokeWidth="2" /></svg></div>
        </div>
    );
};
const VelocityTrend: React.FC<{ allMonths: MonthData[] }> = ({ allMonths }) => {
    const sorted = [...allMonths].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let totalGrowth = 0; let count = 0;
    for (let i = 1; i < sorted.length; i++) { const prev = sorted[i-1].goals.reduce((s, g) => s + g.progress * getSalaryMultiplier(g.name), 0); const curr = sorted[i].goals.reduce((s, g) => s + g.progress * getSalaryMultiplier(g.name), 0); if (prev > 0) { totalGrowth += ((curr - prev) / prev); count++; } }
    const avgVelocity = count > 0 ? (totalGrowth / count) * 100 : 0;
    return (
        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full flex items-center justify-between">
            <div><h3 className="text-sm font-bold text-gray-400 uppercase">Velocity</h3><div className={`text-4xl font-black mt-1 ${avgVelocity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{avgVelocity > 0 ? '+' : ''}{avgVelocity.toFixed(1)}%</div><p className="text-xs text-gray-500">Avg. Monthly Change</p></div><div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
        </div>
    );
};
const CumulativeWealthChart: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length === 0) return null; const max = Math.max(...data, 100); const min = 0; const points = data.map((val, i) => { const x = (i / (data.length - 1 || 1)) * 100; const y = 100 - ((val - min) / (max - min)) * 100; return [x, y] as [number, number]; }); const pathD = getSmoothPath(points);
    return (<div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full"><h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Cumulative Wealth</h3><div className="h-32 w-full relative"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible"><defs><linearGradient id="gradWealth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.5" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs><path d={`${pathD} L 100 100 L 0 100 Z`} fill="url(#gradWealth)" /><path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg></div><div className="mt-2 text-right text-2xl font-bold text-white">{formatCurrency(data[data.length-1] || 0)}</div></div>);
};
const TaxAnalyzer: React.FC<{ gross: number, tax: number }> = ({ gross, tax }) => {
    const net = gross - tax; const taxRate = (tax / gross) * 100 || 0;
    return (<div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full flex flex-col justify-between"><div><h3 className="text-xs font-bold text-gray-400 uppercase">Tax Efficiency</h3><div className="mt-2 text-3xl font-black text-white">{(100 - taxRate).toFixed(1)}%</div><p className="text-[10px] text-gray-500">Keep rate</p></div><div className="mt-4 space-y-2"><div className="flex justify-between text-xs"><span className="text-gray-400">Gross</span><span className="text-white">{formatCurrency(gross)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-400">Tax</span><span className="text-rose-400">-{formatCurrency(tax)}</span></div><div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden flex"><div className="bg-emerald-500 h-full" style={{ width: `${100-taxRate}%` }}></div><div className="bg-rose-500 h-full" style={{ width: `${taxRate}%` }}></div></div></div></div>);
};
const ForecastConfidence: React.FC<{ volatility: number[] }> = ({ volatility }) => {
    const variance = volatility.reduce((sum, v) => sum + v*v, 0) / (volatility.length || 1); const stdDev = Math.sqrt(variance); const confidenceScore = Math.max(0, 100 - (stdDev / 100000));
    return (<div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full"><h3 className="text-xs font-bold text-gray-400 uppercase">Forecast Confidence</h3><div className="mt-2 text-3xl font-black text-indigo-400">{confidenceScore.toFixed(0)}%</div><div className="h-16 w-full mt-4 flex items-end gap-1">{volatility.map((v, i) => (<div key={i} className={`flex-1 rounded-sm ${v >= 0 ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`} style={{ height: `${Math.min(Math.abs(v)/10000, 100)}%` }}></div>))}</div><p className="text-[10px] text-gray-500 mt-2 text-center">Volatility Visualization</p></div>);
};
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0); let currentAngle = 0;
    if (total === 0) return <div className="h-full flex items-center justify-center text-gray-500">No data</div>;
    return (
        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-4 self-start">Revenue Distribution</h3>
            <div className="relative w-48 h-48"><svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">{data.map((item, i) => { const percentage = item.value / total; const angle = percentage * 360; const x1 = 50 + 40 * Math.cos(Math.PI * currentAngle / 180); const y1 = 50 + 40 * Math.sin(Math.PI * currentAngle / 180); const x2 = 50 + 40 * Math.cos(Math.PI * (currentAngle + angle) / 180); const y2 = 50 + 40 * Math.sin(Math.PI * (currentAngle + angle) / 180); const d = percentage === 1 ? "M 50 10 A 40 40 0 1 1 50 10.1" : `M 50 50 L ${x1} ${y1} A 40 40 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`; const path = <path key={i} d={d} fill={item.color} />; currentAngle += angle; return path; })}<circle cx="50" cy="50" r="30" fill="#111827" /></svg></div>
            <div className="mt-4 w-full grid grid-cols-2 gap-2 text-xs">{data.map((d, i) => (<div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div><span className="text-gray-400 truncate">{d.label}</span></div>))}</div>
        </div>
    );
};

// --- SCATTER PLOT FIXED ---
const ScatterPlot: React.FC<{ goals: any[] }> = ({ goals }) => {
    const maxIncome = Math.max(...goals.map(g => g.income), 1000); 
    const maxCompletion = Math.max(...goals.map(g => g.completion), 100);

    return (
        <div className="bg-[#111827] rounded-2xl p-6 border border-gray-800 shadow-xl h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h3 className="text-lg font-bold text-white">Efficiency Matrix</h3>
                    <p className="text-xs text-gray-500">Income vs. Completion</p>
                </div>
            </div>
            
            <div className="flex-grow w-full relative border-l border-b border-gray-700 mx-2 mb-6 min-h-[250px]">
                {/* Quadrant Backgrounds */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-10 pointer-events-none">
                    <div className="bg-rose-500/20 border-r border-b border-white/10 flex items-start justify-start p-2"><span className="text-[10px] text-rose-300 font-bold uppercase">High Value / Low Prog</span></div>
                    <div className="bg-emerald-500/20 border-b border-white/10 flex items-start justify-end p-2"><span className="text-[10px] text-emerald-300 font-bold uppercase">Stars</span></div>
                    <div className="bg-gray-500/20 border-r border-white/10 flex items-end justify-start p-2"><span className="text-[10px] text-gray-400 font-bold uppercase">Grind</span></div>
                    <div className="bg-blue-500/20 flex items-end justify-end p-2"><span className="text-[10px] text-blue-300 font-bold uppercase">Cash Cows</span></div>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full border-t border-gray-800/50 border-dashed"></div>
                    <div className="w-full border-t border-gray-800/50 border-dashed"></div>
                    <div className="w-full border-t border-gray-800/50 border-dashed"></div>
                </div>

                {/* Dots */}
                {goals.map((g, i) => {
                    const bottom = (g.income / maxIncome) * 100;
                    const left = (g.completion / maxCompletion) * 100;
                    const safeBottom = Math.max(5, Math.min(95, bottom));
                    const safeLeft = Math.max(5, Math.min(95, left));

                    return (
                        <div 
                            key={i} 
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.3)] transform -translate-x-1/2 translate-y-1/2 hover:scale-150 hover:z-50 transition-all duration-300 cursor-pointer group" 
                            style={{ 
                                bottom: `${safeBottom}%`, 
                                left: `${safeLeft}%`, 
                                backgroundColor: g.color 
                            }}
                        >
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping"></div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                                <div className="font-bold mb-1">{g.name}</div>
                                <div className="text-gray-400">Inc: <span className="text-emerald-400">{formatCurrency(g.income)}</span></div>
                                <div className="text-gray-400">Prog: <span className="text-blue-400">{g.completion.toFixed(0)}%</span></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Axis Labels */}
            <div className="absolute bottom-1 right-0 text-[10px] text-gray-500 uppercase font-bold tracking-wider">Completion % &rarr;</div>
            <div className="absolute top-12 left-0 text-[10px] text-gray-500 uppercase font-bold tracking-wider transform -rotate-90 origin-top-left translate-y-10">Income &uarr;</div>
        </div>
    );
};

// --- MEGA GRID COMPONENT (Functional & Filterable) ---
const MegaMetricCard: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
    <div className="bg-[#1f2937] hover:bg-[#374151] transition-all duration-200 rounded-xl p-3 border border-gray-700/50 flex flex-col justify-between h-24 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-default group">
        <span className="text-[10px] uppercase font-bold text-gray-500 truncate group-hover:text-gray-400 transition-colors" title={label}>{label}</span>
        <div>
            <div className={`text-lg font-bold truncate tracking-tight ${color || 'text-white'}`}>{value}</div>
            {sub && <div className="text-[9px] text-gray-400 truncate mt-0.5">{sub}</div>}
        </div>
    </div>
);

const MegaMetricsGrid: React.FC<{ data: any }> = ({ data }) => {
    const { currentMonth, currentGross, currentNet, avg, grossVals, cumulativeGross, stdDev } = data;
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    
    // Calculate goal metrics dynamically
    const getGoalMetrics = (nameKey: string) => {
        const goal = currentMonth.goals.find((g: any) => g.name.toLowerCase().includes(nameKey));
        if (!goal) return { income: 0, count: 0, pct: 0 };
        const income = goal.progress * getSalaryMultiplier(goal.name);
        return { income, count: goal.progress, pct: (income / (currentGross || 1)) * 100 };
    };

    const g5 = getGoalMetrics('5 minutes');
    const g10 = getGoalMetrics('10 minutes');
    const g20 = getGoalMetrics('20 minutes');
    const gRej = getGoalMetrics('rejected');
    const gSel = getGoalMetrics('sellers');

    const burnRate = 3000;
    const runway = currentNet / burnRate;

    // Filtered Professional Metrics List
    const allMetrics = [
        // Category: Goal Performance
        { cat: 'Performance', label: '5m Income', value: formatCurrency(g5.income), color: 'text-emerald-400' },
        { cat: 'Performance', label: '5m Volume', value: g5.count.toString(), sub: 'Tasks' },
        { cat: 'Performance', label: '5m Efficiency', value: formatCurrency(g5.income/g5.count || 0), sub: 'Per Task' },

        { cat: 'Performance', label: '10m Income', value: formatCurrency(g10.income), color: 'text-blue-400' },
        { cat: 'Performance', label: '10m Volume', value: g10.count.toString(), sub: 'Tasks' },
        { cat: 'Performance', label: '10m Efficiency', value: formatCurrency(g10.income/g10.count || 0), sub: 'Per Task' },

        { cat: 'Performance', label: '20m Income', value: formatCurrency(g20.income), color: 'text-indigo-400' },
        { cat: 'Performance', label: '20m Volume', value: g20.count.toString(), sub: 'Tasks' },
        { cat: 'Performance', label: '20m Efficiency', value: formatCurrency(g20.income/g20.count || 0), sub: 'Per Task' },

        { cat: 'Performance', label: 'Rejected Inc.', value: formatCurrency(gRej.income), color: 'text-rose-400' },
        { cat: 'Performance', label: 'Rejected Vol.', value: gRej.count.toString(), sub: 'Tasks' },
        { cat: 'Performance', label: 'Rejected Impact', value: formatCurrency(gRej.income/gRej.count || 0), sub: 'Per Rejection' },

        { cat: 'Performance', label: 'Seller Inc.', value: formatCurrency(gSel.income), color: 'text-amber-400' },
        { cat: 'Performance', label: 'Seller Vol.', value: gSel.count.toString(), sub: 'Tasks' },
        { cat: 'Performance', label: 'Seller Value', value: formatCurrency(gSel.income/gSel.count || 0), sub: 'Per Sale' },

        // Category: Run Rates (Time)
        { cat: 'Run Rates', label: 'Hourly (Real)', value: formatCurrency(currentGross / 160), sub: '160h Basis' },
        { cat: 'Run Rates', label: 'Daily Average', value: formatCurrency(currentGross / 30), sub: '30 Day Basis' },
        { cat: 'Run Rates', label: 'Weekly Average', value: formatCurrency(currentGross / 4.3) },
        { cat: 'Run Rates', label: 'Bi-Weekly', value: formatCurrency(currentGross / 2) },
        { cat: 'Run Rates', label: 'Quarterly Proj.', value: formatCompact(currentGross * 3) },
        { cat: 'Run Rates', label: 'Annualized', value: formatCompact(currentGross * 12) },
        { cat: 'Run Rates', label: '5-Year Proj.', value: formatCompact(currentGross * 60) },

        // Category: Financial Health
        { cat: 'Financials', label: 'Gross Margin', value: '100%', sub: 'Service Based' },
        { cat: 'Financials', label: 'Net Margin', value: '88.0%', sub: 'After 12% Tax' },
        { cat: 'Financials', label: 'Tax Liability', value: formatCurrency(currentGross * 0.12), color: 'text-rose-400' },
        { cat: 'Financials', label: 'Disposable', value: formatCurrency(currentNet * 0.5), sub: '50% Needs' },
        { cat: 'Financials', label: 'Savings Cap.', value: formatCurrency(currentNet * 0.2), sub: '20% Rule' },
        { cat: 'Financials', label: 'Runway', value: runway.toFixed(1) + ' Mo', sub: '@ $3k/mo' },
        { cat: 'Financials', label: '> $10k Milestone', value: currentGross > 10000 ? 'YES' : 'NO', color: currentGross > 10000 ? 'text-green-500' : 'text-gray-500' },
        { cat: 'Financials', label: '> $50k Milestone', value: currentGross > 50000 ? 'YES' : 'NO', color: currentGross > 50000 ? 'text-green-500' : 'text-gray-500' },

        // Category: Scenarios
        { cat: 'Scenarios', label: '+10% Growth', value: formatCurrency(currentGross * 1.1) },
        { cat: 'Scenarios', label: '+20% Growth', value: formatCurrency(currentGross * 1.2) },
        { cat: 'Scenarios', label: '+50% Growth', value: formatCurrency(currentGross * 1.5) },
        { cat: 'Scenarios', label: 'Double Income', value: formatCurrency(currentGross * 2) },
        { cat: 'Scenarios', label: '-10% Downturn', value: formatCurrency(currentGross * 0.9), color: 'text-rose-400' },
        { cat: 'Scenarios', label: 'Break Even', value: formatCurrency(3000), sub: 'Est. Costs' },
        { cat: 'Scenarios', label: 'Safety Net', value: formatCurrency(3000 * 6), sub: '6 Mo Exp' },

        // Category: Statistics
        { cat: 'Statistics', label: 'Volatility', value: stdDev > avg * 0.2 ? 'High' : 'Low', color: stdDev > avg * 0.2 ? 'text-amber-500' : 'text-emerald-500' },
        { cat: 'Statistics', label: 'Lifetime Gross', value: formatCompact(cumulativeGross), sub: 'Total Earned' },
        { cat: 'Statistics', label: 'Best Month', value: formatCompact(Math.max(...grossVals)), sub: 'Historical' },
        { cat: 'Statistics', label: 'Worst Month', value: formatCompact(Math.min(...grossVals)), sub: 'Historical' },
        { cat: 'Statistics', label: 'Avg Month', value: formatCompact(avg), sub: 'Historical' },
        { cat: 'Statistics', label: 'Data Points', value: (data.sorted.length * 5).toString(), sub: 'Goals Tracked' },
        { cat: 'Statistics', label: 'Months Active', value: data.sorted.length.toString(), sub: 'Tracked' },
    ];

    const categories = ['All', ...Array.from(new Set(allMetrics.map(m => m.cat)))];

    const filteredMetrics = allMetrics.filter(m => {
        const matchesCat = filter === 'All' || m.cat === filter;
        const matchesSearch = m.label.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="mt-12 bg-gray-900/50 rounded-3xl p-6 border border-gray-800/50">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div>
                    <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <SparklesIcon /> Mega Metrics Grid <span className="text-gray-500 text-xs normal-case border border-gray-700 px-2 py-0.5 rounded-full">{filteredMetrics.length} KPIs</span>
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">High-impact business intelligence and financial performance indicators.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Find metric..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-800 text-white text-xs rounded-lg pl-9 pr-3 py-2 border border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                {filteredMetrics.map((m, i) => (
                    <MegaMetricCard key={i} {...m} />
                ))}
            </div>
            
            {filteredMetrics.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">
                    No metrics found matching your criteria.
                </div>
            )}
        </div>
    );
};

// --- Main Container ---

const AIDashboard: React.FC<AIDashboardProps> = ({ allMonths }) => {
    
    const processedData = useMemo(() => {
        const sorted = [...allMonths].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const currentMonth = sorted[sorted.length - 1];
        
        let bestMonth = sorted[0];
        let maxNet = 0;
        const cumulativeData: number[] = [];
        let cumulativeGross = 0;
        
        const grossVals = sorted.map(m => {
            const gross = m.goals.reduce((acc, g) => acc + (g.progress * getSalaryMultiplier(g.name)), 0);
            cumulativeGross += gross;
            cumulativeData.push(gross);
            const net = gross * 0.88;
            if (net > maxNet) {
                maxNet = net;
                bestMonth = m;
            }
            return gross;
        });

        const currentGross = currentMonth.goals.reduce((acc, g) => acc + (g.progress * getSalaryMultiplier(g.name)), 0);
        const currentNet = currentGross * 0.88;
        const prevMonth = sorted.length > 1 ? sorted[sorted.length - 2] : currentMonth;

        const scatterGoals = currentMonth.goals.map(g => ({
            name: g.name,
            target: g.endValue,
            income: g.progress * getSalaryMultiplier(g.name),
            potential: g.endValue * getSalaryMultiplier(g.name),
            color: getGoalColor(g.name),
            completion: g.endValue > 0 ? (g.progress / g.endValue) * 100 : 0,
            progress: g.progress,
            endValue: g.endValue
        }));

        const donutData = scatterGoals.map(g => ({ label: g.name, value: g.income, color: g.color }));

        const avg = grossVals.reduce((a, b) => a + b, 0) / (grossVals.length || 1);
        const volatilityData = grossVals.map(v => v - avg);
        const stdDev = Math.sqrt(volatilityData.map(x => x*x).reduce((a,b)=>a+b, 0) / (volatilityData.length || 1));

        return { 
            currentMonth, bestMonth, sorted, scatterGoals, donutData, volatilityData, 
            currentGross, currentNet, cumulativeData, cumulativeGross, avg, stdDev, prevMonth, grossVals
        };
    }, [allMonths]);

    if (!processedData.currentMonth) return <div className="text-white p-10">No data available</div>;

    return (
        <div className="w-full animate-fade-in space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end pb-6 border-b border-gray-800">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <span className="w-3 h-8 bg-indigo-500 rounded-sm"></span>
                        AI Command Center
                    </h2>
                    <p className="text-gray-400 mt-1 pl-6">Advanced Analytics & Predictive Modeling</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-mono rounded border border-gray-700">v9.5 Pro</span>
                </div>
            </div>

            {/* Row 1: The Core Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 min-h-[400px]">
                    <StrategyEngine data={processedData} />
                </div>
                <div className="lg:col-span-4 min-h-[400px]">
                    <SalarySimulator monthData={processedData.currentMonth} />
                </div>
                <div className="lg:col-span-4 min-h-[400px]">
                    <BenchmarkRadar current={processedData.currentMonth} best={processedData.bestMonth} />
                </div>
            </div>

            {/* Row 2: Strategic Insights (New) */}
            <StrategicInsights goals={processedData.scatterGoals} />

            {/* Row 3: Secondary Visuals (Fixed Scatter) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[300px]">
                <div className="lg:col-span-1"><DonutChart data={processedData.donutData} /></div>
                <div className="lg:col-span-2"><ScatterPlot goals={processedData.scatterGoals} /></div>
            </div>

            {/* Row 4: Financial Deep Dive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CumulativeWealthChart data={processedData.cumulativeData} />
                <TaxAnalyzer gross={processedData.currentGross} tax={processedData.currentGross * 0.12} />
                <ForecastConfidence volatility={processedData.volatilityData} />
                <VelocityTrend allMonths={processedData.sorted} />
            </div>

            {/* MEGA GRID (Streamlined) - Now focused on business value */}
            <MegaMetricsGrid data={processedData} />

        </div>
    );
};

export default AIDashboard;
