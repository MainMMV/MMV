
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MonthData } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ChevronDownIcon } from './Icons';

interface ComparisonDashboardProps {
  allMonths: MonthData[];
}

const GOAL_COLORS: Record<string, string> = {
    'within 5 minutes': '#10b981', // Emerald 500
    'within 10 minutes': '#3b82f6', // Blue 500
    'within 20 minutes': '#6366f1', // Indigo 500
    'who rejected': '#f43f5e', // Rose 500
    'created by sellers': '#f59e0b', // Amber 500
    'default': '#71717a' // Zinc 500
};

const getGoalColor = (name: string) => {
    const lower = name.toLowerCase();
    if (GOAL_COLORS[lower]) return GOAL_COLORS[lower];
    if (lower.includes('5 minutes')) return GOAL_COLORS['within 5 minutes'];
    if (lower.includes('10 minutes')) return GOAL_COLORS['within 10 minutes'];
    if (lower.includes('20 minutes')) return GOAL_COLORS['within 20 minutes'];
    if (lower.includes('rejected')) return GOAL_COLORS['who rejected'];
    if (lower.includes('sellers')) return GOAL_COLORS['created by sellers'];
    return GOAL_COLORS['default'];
};

// --- Month Picker Component ---

const MonthPicker: React.FC<{ selectedDate: Date, onChange: (date: Date) => void }> = ({ selectedDate, onChange }) => {
    const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setViewYear(selectedDate.getFullYear());
    }, [selectedDate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeYear = (delta: number) => {
        setViewYear(prev => prev + delta);
    };

    const selectMonth = (monthIndex: number) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(viewYear);
        newDate.setMonth(monthIndex);
        onChange(newDate);
        setIsOpen(false);
    };

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="relative" ref={containerRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors border border-zinc-200 dark:border-zinc-600"
            >
                <CalendarIcon />
                <span>{formattedDate}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 z-50 p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-700/50">
                        <button onClick={() => changeYear(-1)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400"><ChevronLeftIcon /></button>
                        <span className="font-bold text-zinc-900 dark:text-white">{viewYear}</span>
                        <button onClick={() => changeYear(1)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400"><ChevronRightIcon /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((m, i) => (
                            <button
                                key={m}
                                onClick={() => selectMonth(i)}
                                className={`py-2 text-sm rounded-md transition-colors ${
                                    selectedDate.getMonth() === i && selectedDate.getFullYear() === viewYear
                                    ? 'bg-emerald-600 text-white font-medium shadow-md'
                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Visual Components ---

const TrendChart: React.FC<{ data: { label: string; value: number }[]; color: string }> = ({ data, color }) => {
    if (data.length === 0) return <div className="h-64 flex items-center justify-center text-zinc-400 text-sm">No data available</div>;
    
    const height = 250;
    const width = 800;
    const paddingX = 40;
    const paddingY = 30;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;
    
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 100;
    const minVal = 0;

    const points = data.map((d, i) => {
        const x = data.length === 1 ? width / 2 : paddingX + (i / (data.length - 1)) * chartW;
        const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal)) * chartH;
        return `${x},${y}`;
    }).join(' ');
    
    const areaPath = data.length > 1 
        ? `${points} L ${data.length === 1 ? width/2 : width - paddingX},${height - paddingY} L ${data.length === 1 ? width/2 : paddingX},${height - paddingY} Z`
        : `${width/2},${height-paddingY-(data[0].value/maxVal)*chartH} L ${width/2 + 20},${height-paddingY} L ${width/2 - 20},${height-paddingY} Z`;

    return (
        <div className="w-full h-64 select-none">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Guides */}
                <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" strokeWidth="1" />
                <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" strokeWidth="1" strokeDasharray="4" />
                
                {/* Area & Line */}
                {data.length > 0 && (
                   <>
                     <path d={areaPath} fill="url(#chartGradient)" />
                     {data.length > 1 && <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                   </>
                )}
                
                {/* Data Points */}
                {data.map((d, i) => {
                     const x = data.length === 1 ? width / 2 : paddingX + (i / (data.length - 1)) * chartW;
                     const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal)) * chartH;
                     return (
                         <g key={i} className="group">
                            <circle cx={x} cy={y} r="5" fill="white" stroke={color} strokeWidth="3" className="dark:fill-zinc-800 transition-all duration-200 group-hover:r-7 group-hover:stroke-white dark:group-hover:stroke-white group-hover:fill-emerald-500" />
                            
                            {/* Tooltip */}
                            <foreignObject x={x - 50} y={y - 50} width="100" height="40" className="overflow-visible opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="bg-zinc-900 text-white text-xs font-bold py-1 px-2 rounded shadow-lg text-center transform -translate-y-1">
                                    {new Intl.NumberFormat('en-US', { notation: "compact" }).format(d.value)}
                                </div>
                            </foreignObject>
                         </g>
                     );
                })}

                {/* X Axis Labels */}
                {data.map((d, i) => {
                     const x = data.length === 1 ? width / 2 : paddingX + (i / (data.length - 1)) * chartW;
                     return (
                         <text key={i} x={x} y={height - 10} textAnchor="middle" fontSize="11" fill="currentColor" className="text-zinc-500 dark:text-zinc-400 font-medium">
                             {d.label}
                         </text>
                     );
                })}
            </svg>
        </div>
    );
};

const DonutChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 180;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let accumulatedOffset = 0;
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    if (total === 0) return <div className="h-48 flex items-center justify-center text-zinc-400 text-sm italic">No revenue data</div>;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                {sortedData.map((d, i) => {
                    const percentage = d.value / total;
                    const dashArray = percentage * circumference;
                    const currentOffset = -1 * accumulatedOffset;
                    accumulatedOffset += dashArray;

                    return (
                        <circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke={d.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashArray} ${circumference}`}
                            strokeDashoffset={currentOffset}
                            className="transition-all duration-300 hover:opacity-80"
                        >
                            <title>{`${d.name}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.value)}`}</title>
                        </circle>
                    );
                })}
            </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white">
                   {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(total)}
                </span>
           </div>
        </div>
    );
};

const MonthlyPostcard: React.FC<{ 
    monthData: any; 
    donutData: { name: string; value: number; color: string }[];
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}> = ({ monthData, donutData, selectedDate, onDateChange }) => {
    const totalRevenue = monthData?.grossTotal || 0;
    const tax = monthData?.tax || 0;
    const net = monthData?.net || 0;

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Monthly Summary</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Snapshot Report</p>
                </div>
                <MonthPicker selectedDate={selectedDate} onChange={onDateChange} />
            </div>

            {/* Content */}
            <div className="flex-grow p-6 flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
                {/* Chart Section */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <DonutChart data={donutData} />
                    <div className="mt-6 w-full space-y-2">
                         {donutData.slice(0, 3).map((d, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[120px]">{d.name}</span>
                                </div>
                                <span className="font-medium text-zinc-900 dark:text-white">
                                    {new Intl.NumberFormat('en-US', { notation: "compact" }).format(d.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="flex-grow w-full space-y-4">
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/20 border border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Gross Income</p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue)}</p>
                        </div>
                        <div className="h-8 w-1 bg-zinc-200 dark:bg-zinc-600 rounded-full"></div>
                         <div className="text-right">
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Tax (12%)</p>
                            <p className="text-xl font-bold text-rose-500">-{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tax)}</p>
                        </div>
                    </div>

                   <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-900/30">
                       <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-1">Net Earnings</p>
                       <div className="flex items-baseline gap-2">
                           <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(net)}
                           </p>
                           {monthData && (
                               <span className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/60">
                                   {monthData.name}
                               </span>
                           )}
                       </div>
                   </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---

const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ allMonths }) => {
  const [selectedRevenueDate, setSelectedRevenueDate] = useState(new Date());
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  
  // 1. Process Data
  const analytics = useMemo(() => {
    // Sort descending (Newest First) per user request: "old month from below new month on top"
    const sortedMonths = [...allMonths].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
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

    // Aggregate data per month
    const processedMonths = sortedMonths.map(month => {
        let grossTotal = 0;
        const goalBreakdown: { name: string; count: number; income: number; color: string }[] = [];

        month.goals.forEach(goal => {
            const multiplier = getSalaryMultiplier(goal.name);
            const income = goal.progress * multiplier;
            grossTotal += income;
            
            goalBreakdown.push({
                name: goal.name,
                count: goal.progress,
                income: income,
                color: getGoalColor(goal.name)
            });
        });

        const tax = grossTotal * 0.12;
        const net = grossTotal - tax;

        return {
            id: month.id,
            name: month.name,
            date: new Date(month.date),
            shortName: new Date(month.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            grossTotal,
            net,
            tax,
            goalBreakdown
        };
    });

    // Calculate Summary Stats
    const totalLifetimeNet = processedMonths.reduce((acc, m) => acc + m.net, 0);
    const averageMonthlyNet = processedMonths.length > 0 ? totalLifetimeNet / processedMonths.length : 0;
    const bestMonth = processedMonths.reduce((max, curr) => curr.net > max.net ? curr : max, processedMonths[0] || { name: '-', net: 0 });
    
    // Goal Names for Matrix
    const uniqueGoalNames = Array.from(new Set(allMonths.flatMap(m => m.goals.map(g => g.name))));

    return {
        months: processedMonths,
        totalLifetimeNet,
        averageMonthlyNet,
        bestMonth,
        uniqueGoalNames
    };
  }, [allMonths]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Data for Trend Chart (All Time) - Must be chronological (Old -> New) for trend to make sense
  const trendData = useMemo(() => {
    return [...analytics.months].reverse().map(m => ({ label: m.shortName, value: m.net }));
  }, [analytics.months]);

  // Selected Month Data for Postcard
  const selectedMonthData = useMemo(() => {
      return analytics.months.find(m => 
          m.date.getMonth() === selectedRevenueDate.getMonth() && 
          m.date.getFullYear() === selectedRevenueDate.getFullYear()
      );
  }, [analytics.months, selectedRevenueDate]);

  // Data for Monthly Revenue Donut (Filtered by Selection)
  const donutData = useMemo(() => {
      if (!selectedMonthData) return [];

      // Aggregate revenue by goal name for this specific month
      return analytics.uniqueGoalNames.map(goalName => {
          const goal = selectedMonthData.goalBreakdown.find(item => item.name === goalName);
          const val = goal ? goal.income : 0;
          return { name: goalName, value: val, color: getGoalColor(goalName) };
      }).filter(d => d.value > 0);

  }, [selectedMonthData, analytics.uniqueGoalNames]);

  // Group months by year for table
  const monthsByYear = useMemo(() => {
    const groups: Record<number, typeof analytics.months> = {};
    analytics.months.forEach(m => {
      const year = m.date.getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    });
    return groups;
  }, [analytics.months]);

  const sortedYears = useMemo(() => Object.keys(monthsByYear).map(Number).sort((a, b) => b - a), [monthsByYear]);

  useEffect(() => {
      // Expand the latest year by default if not already set
      if (sortedYears.length > 0) {
          setExpandedYears(prev => {
              // Only set default if no state exists (first load)
              if (Object.keys(prev).length === 0) {
                  return { [sortedYears[0]]: true };
              }
              return prev;
          });
      }
  }, [sortedYears]);

  const toggleYear = (year: number) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Analytics Dashboard</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Deep dive into your performance metrics and revenue sources.</p>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden">
             <div className="relative z-10">
                 <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Lifetime Net Earnings</h3>
                 <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(analytics.totalLifetimeNet)}</p>
             </div>
             <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
         </div>
         <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
             <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Monthly Average</h3>
             <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{formatCurrency(analytics.averageMonthlyNet)}</p>
         </div>
         <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
             <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Best Month</h3>
             <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{analytics.bestMonth.name}</p>
             <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatCurrency(analytics.bestMonth.net)}</p>
         </div>
      </div>

      {/* 2. Visual Charts (Trend & Monthly Postcard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Net Salary Trend</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly net income growth over time.</p>
            </div>
            <TrendChart data={trendData} color="#10b981" />
        </div>
        
        {/* Monthly Postcard */}
        <MonthlyPostcard 
            monthData={selectedMonthData} 
            donutData={donutData} 
            selectedDate={selectedRevenueDate} 
            onDateChange={setSelectedRevenueDate} 
        />
      </div>

      {/* 3. Goal Performance Matrix */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Goal Performance Matrix</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Raw volume of tasks completed per month. Darker cells indicate higher volume.</p>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-700/50">
                      <tr>
                          <th className="px-6 py-4 font-medium border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 sticky left-0 z-10">Goal Name</th>
                          {analytics.months.map(m => (
                              <th key={m.id} className="px-4 py-4 text-center font-medium min-w-[80px]">{m.shortName}</th>
                          ))}
                          <th className="px-4 py-4 text-center font-bold text-zinc-700 dark:text-zinc-200">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      {analytics.uniqueGoalNames.map((goalName) => {
                          // Calculate row total
                          const rowTotal = analytics.months.reduce((acc, m) => {
                              const goal = m.goalBreakdown.find(g => g.name === goalName);
                              return acc + (goal?.count || 0);
                          }, 0);
                          
                          // Find max for this row to calculate opacity
                          const maxInRow = Math.max(...analytics.months.map(m => {
                              return m.goalBreakdown.find(g => g.name === goalName)?.count || 0;
                          }));

                          return (
                              <tr key={goalName} className="border-b border-zinc-100 dark:border-zinc-700/50 last:border-none hover:bg-zinc-50/80 dark:hover:bg-zinc-700/30 transition-colors">
                                  <td className="px-6 py-3 font-medium text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-700 flex items-center gap-2 bg-white dark:bg-zinc-800 sticky left-0 z-10">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getGoalColor(goalName) }}></div>
                                      {goalName}
                                  </td>
                                  {analytics.months.map(m => {
                                      const goalData = m.goalBreakdown.find(g => g.name === goalName);
                                      const count = goalData?.count || 0;
                                      const opacity = maxInRow > 0 ? 0.1 + (count / maxInRow) * 0.9 : 0;
                                      
                                      return (
                                          <td key={m.id} className="p-0 text-center relative h-12">
                                              {count > 0 ? (
                                                  <div className="w-full h-full flex items-center justify-center relative">
                                                       <div 
                                                            className="absolute inset-1 rounded-md" 
                                                            style={{ 
                                                                backgroundColor: getGoalColor(goalName), 
                                                                opacity: opacity * 0.2 // Lower opacity for background
                                                            }}
                                                       ></div>
                                                       <span className="relative font-semibold z-10 text-zinc-700 dark:text-zinc-200">{count}</span>
                                                  </div>
                                              ) : (
                                                  <span className="text-zinc-300 dark:text-zinc-600">-</span>
                                              )}
                                          </td>
                                      );
                                  })}
                                  <td className="px-4 py-3 text-center font-bold text-zinc-900 dark:text-white bg-zinc-50/50 dark:bg-zinc-800">{rowTotal}</td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
      
      {/* 4. Detailed Financial Table (Grouped by Year) */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Financial Summary</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Gross, Tax, and Net Salary breakdown by year (Newest First).</p>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-700/50">
                    <tr>
                        <th className="px-6 py-4 font-medium">Month</th>
                        <th className="px-6 py-4 font-medium text-right">Gross Salary</th>
                        <th className="px-6 py-4 font-medium text-right text-rose-500">Tax (12%)</th>
                        <th className="px-6 py-4 font-medium text-right text-emerald-600 dark:text-emerald-400">Net Salary</th>
                    </tr>
                </thead>
                {sortedYears.map(year => {
                     const yearMonths = monthsByYear[year];
                     // Calculate totals for the year header
                     const yearGross = yearMonths.reduce((sum, m) => sum + m.grossTotal, 0);
                     const yearTax = yearMonths.reduce((sum, m) => sum + m.tax, 0);
                     const yearNet = yearMonths.reduce((sum, m) => sum + m.net, 0);
                     const isExpanded = expandedYears[year];

                     return (
                        <tbody key={year} className="border-b border-zinc-200 dark:border-zinc-700 last:border-none">
                            <tr 
                                onClick={() => toggleYear(year)}
                                className="bg-zinc-100 dark:bg-zinc-700/50 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors select-none"
                            >
                                <td className="px-6 py-3 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                    {year}
                                    <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-600 px-2 py-0.5 rounded-full">
                                        {yearMonths.length} Months
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right font-mono font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{formatCurrency(yearGross)}</td>
                                <td className="px-6 py-3 text-right font-mono font-semibold text-rose-500 text-xs">-{formatCurrency(yearTax)}</td>
                                <td className="px-6 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">{formatCurrency(yearNet)}</td>
                            </tr>
                            {isExpanded && yearMonths.map(m => (
                                <tr key={m.id} className="border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                                    <td className="px-6 py-4 pl-12 font-medium text-zinc-900 dark:text-white border-l-4 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">{m.name}</td>
                                    <td className="px-6 py-4 text-right font-mono text-zinc-600 dark:text-zinc-300">{formatCurrency(m.grossTotal)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-rose-500">-{formatCurrency(m.tax)}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(m.net)}</td>
                                </tr>
                            ))}
                        </tbody>
                     );
                 })}
            </table>
        </div>
      </div>

    </div>
  );
};

export default ComparisonDashboard;
