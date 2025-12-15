
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MonthData } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ChevronDownIcon, DownloadIcon } from './Icons';

interface ComparisonDashboardProps {
  allMonths: MonthData[];
}

const GOAL_COLORS: Record<string, string> = {
    'within 5 minutes': '#10b981', // Emerald 500
    'within 10 minutes': '#3b82f6', // Blue 500
    'within 20 minutes': '#6366f1', // Indigo 500
    'who rejected': '#f43f5e', // Rose 500
    'created by sellers': '#f59e0b', // Amber 500
    'default': '#71717a' // Gray 500
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

// --- New Charts Components ---

const SingleGoalBarChart: React.FC<{ config: any, data: any[] }> = ({ config, data }) => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const yMax = maxValue > 0 ? maxValue * 1.2 : 10; 

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm h-full flex flex-col w-full">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100 dark:border-gray-700/50 truncate">
                {config.label}
            </h4>
            
            <div className="relative h-48 w-full">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full border-t border-gray-100 dark:border-gray-700/50 h-0"></div>
                    <div className="w-full border-t border-gray-100 dark:border-gray-700/50 h-0 border-dashed"></div>
                    <div className="w-full border-t border-gray-100 dark:border-gray-700/50 h-0"></div>
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around px-4 gap-4">
                    {data.map((d, i) => {
                        const height = (d.value / yMax) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                                {/* Value Label */}
                                <span className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-200 transition-transform group-hover:-translate-y-1">
                                    {d.value > 0 ? d.value : ''}
                                </span>
                                
                                {/* The Bar */}
                                <div 
                                    className="w-full max-w-[80px] rounded-t-lg transition-all duration-500 relative"
                                    style={{ 
                                        height: `${Math.max(height, 2)}%`, // Ensure at least a sliver is visible 
                                        backgroundColor: config.barColor,
                                        opacity: 0.9 
                                    }}
                                >
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-t-lg"></div>
                                </div>
                                
                                {/* X-Axis Label */}
                                <span className="mt-3 text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide text-center">
                                    {d.month}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const GoalVolumeCharts: React.FC<{ months: any[] }> = ({ months }) => {
    const charts = [
        { label: '00 - 05 Per Month', goal: 'within 5 minutes', barColor: '#4ade80' }, // Green
        { label: '05 - 10 Per Month', goal: 'within 10 minutes', barColor: '#60a5fa' }, // Blue
        { label: '11 - 20 Per Month', goal: 'within 20 minutes', barColor: '#1e40af' }, // Dark Blue
        { label: 'Rejected', goal: 'who rejected', barColor: '#fb923c' }, // Orange
        { label: 'Seller', goal: 'created by sellers', barColor: '#9ca3af' }  // Grey
    ];

    // Prepare data for each chart
    const preparedData = charts.map(chartConfig => {
        const data = months.map(m => {
            const goal = m.goalBreakdown.find((g: any) => g.name === chartConfig.goal);
            return {
                month: m.shortName,
                value: goal ? goal.count : 0
            };
        });
        return { config: chartConfig, data };
    });

    return (
        <div className="grid grid-cols-1 gap-6 mb-8 items-start w-full">
            {preparedData.map((item, index) => (
                <SingleGoalBarChart key={index} config={item.config} data={item.data} />
            ))}
        </div>
    );
};


// MonthPicker Component
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
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        let newDate;

        if (viewYear === currentYear && monthIndex === currentMonth) {
            // Active Month: Set to Yesterday (Noon to avoid timezone shift)
            newDate = new Date(currentYear, currentMonth, now.getDate() - 1, 12, 0, 0, 0);
        } else if (viewYear < currentYear || (viewYear === currentYear && monthIndex < currentMonth)) {
             // Past Month: Set to End of Month (Last Day, Noon)
             newDate = new Date(viewYear, monthIndex + 1, 0, 12, 0, 0, 0);
        } else {
             // Future: Default to 15th (Noon)
             newDate = new Date(viewYear, monthIndex, 15, 12, 0, 0, 0);
        }

        onChange(newDate);
        setIsOpen(false);
    };

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="relative" ref={containerRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
                <CalendarIcon />
                <span>{formattedDate}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700/50">
                        <button onClick={() => changeYear(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"><ChevronLeftIcon /></button>
                        <span className="font-bold text-gray-900 dark:text-white">{viewYear}</span>
                        <button onClick={() => changeYear(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"><ChevronRightIcon /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((m, i) => (
                            <button
                                key={m}
                                onClick={() => selectMonth(i)}
                                className={`py-2 text-sm rounded-md transition-colors ${
                                    selectedDate.getMonth() === i && selectedDate.getFullYear() === viewYear
                                    ? 'bg-emerald-600 text-white font-medium shadow-md'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
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

// TrendChart Component
export const TrendChart: React.FC<{ data: { label: string; value: number }[]; color: string }> = ({ data, color }) => {
    if (data.length === 0) return <div className="h-80 flex items-center justify-center text-gray-400 text-sm">No data available</div>;
    
    // Calculate scaling range
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 100;
    const minVal = 0;

    // Helper to get percentage coordinates (0-100) relative to SVG viewBox/Canvas
    const getCoord = (index: number, value: number) => {
        // Center the point horizontally within its segment
        // If n points, we divide into n-1 segments or just spread evenly
        // Using (index / (length - 1)) ensures start at 0 and end at 100
        const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
        const y = 100 - ((value - minVal) / (maxVal - minVal)) * 100;
        return { x, y };
    };

    const getSmoothPath = (points: {x: number, y: number}[]) => {
        if (points.length === 0) return "";
        if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
        
        // Start
        let d = `M ${points[0].x},${points[0].y}`;
        
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            // Control points for bezier curve
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;
            
            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
        }
        return d;
    };

    const points = data.map((d, i) => getCoord(i, d.value));
    const smoothPath = getSmoothPath(points);

    const firstX = data.length > 1 ? 0 : 50;
    const lastX = data.length > 1 ? 100 : 50;
    const areaPath = `${smoothPath} L ${lastX},100 L ${firstX},100 Z`;

    return (
        <div className="w-full h-80 relative bg-gray-50/50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700/50 select-none overflow-hidden">
            
            {/* Background Grid (HTML) */}
            <div className="absolute inset-0 flex flex-col justify-between py-8 px-8 opacity-30 pointer-events-none">
                 <div className="w-full border-t border-gray-300 dark:border-gray-600 border-dashed"></div>
                 <div className="w-full border-t border-gray-300 dark:border-gray-600 border-dashed"></div>
                 <div className="w-full border-t border-gray-300 dark:border-gray-600 border-dashed"></div>
            </div>

            {/* Chart Area (SVG) */}
            <div className="absolute inset-0 py-8 px-8 z-10">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id={`gradient-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill={`url(#gradient-${color.replace('#','')})`} />
                    <path 
                        d={smoothPath} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="3" 
                        vectorEffect="non-scaling-stroke" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                </svg>
            </div>

            {/* Interactive HTML Layer (Tooltips & Labels) */}
            <div className="absolute inset-0 py-8 px-8 z-20 pointer-events-none">
                {data.map((d, i) => {
                    const { x, y } = points[i];
                    return (
                        <div 
                            key={i}
                            className="absolute flex flex-col items-center group pointer-events-auto"
                            style={{ 
                                left: `${x}%`, 
                                top: `${y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {/* Hit Area for easier hovering */}
                            <div className="w-8 h-20 absolute -top-10 opacity-0 cursor-pointer"></div>

                            {/* The Dot (Centered via translate) */}
                            <div 
                                className="w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-2 transition-all duration-200 group-hover:scale-150 group-hover:border-4 shadow-sm z-10"
                                style={{ borderColor: color }}
                            ></div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold py-1.5 px-2.5 rounded shadow-xl whitespace-nowrap transform translate-y-2 group-hover:translate-y-0 z-20">
                                {new Intl.NumberFormat('en-US', { notation: "compact" }).format(d.value)}
                                {/* Triangle pointer */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
                            </div>

                            {/* X Axis Label */}
                            <div className="absolute top-6 mt-2 text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                {d.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// RevenuePieChart Component
const RevenuePieChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
    const size = 180;
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativePercent = 0;

    const slices = data.sort((a, b) => b.value - a.value).map(d => {
        const percent = total > 0 ? d.value / total : 0;
        const slice = { ...d, percent, start: cumulativePercent };
        cumulativePercent += percent;
        return slice;
    });

    const getCoordinatesForPercent = (percent: number) => {
        const x = size/2 + (size/2) * Math.cos(2 * Math.PI * percent);
        const y = size/2 + (size/2) * Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    if (total === 0) return <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic">No revenue data</div>;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 overflow-visible">
                {slices.map((slice, i) => {
                    const start = slice.start;
                    const end = slice.start + slice.percent;
                    const [startX, startY] = getCoordinatesForPercent(start);
                    const [endX, endY] = getCoordinatesForPercent(end);
                    const largeArcFlag = slice.percent > 0.5 ? 1 : 0;
                    
                    const pathData = [
                        `M ${size/2} ${size/2}`,
                        `L ${startX} ${startY}`,
                        `A ${size/2} ${size/2} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        `Z`
                    ].join(' ');

                    return (
                        <path 
                            key={i} 
                            d={pathData} 
                            fill={slice.color}
                            className="transition-opacity hover:opacity-80 stroke-white dark:stroke-gray-800 stroke-2"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

// MonthlyPostcard Component
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full w-full">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Snapshot Report</p>
                </div>
                <MonthPicker selectedDate={selectedDate} onChange={onDateChange} />
            </div>

            <div className="flex-grow p-4 sm:p-6 flex flex-col gap-8 items-center justify-center">
                <div className="flex flex-col items-center w-full">
                    <div className="mb-6">
                        <RevenuePieChart data={donutData} />
                    </div>
                    <div className="w-full space-y-3">
                         {donutData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-sm group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></div>
                                    <span className="font-medium text-gray-600 dark:text-gray-300 truncate max-w-[150px]">{d.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white font-mono">
                                    {new Intl.NumberFormat('en-US', { notation: "compact" }).format(d.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full space-y-4 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-500 dark:text-gray-400">Gross Income</span>
                        <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-500 dark:text-gray-400">Tax (12%)</span>
                        <span className="font-bold text-rose-500">-{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tax)}</span>
                    </div>

                   <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                       <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Net</span>
                       <div className="flex flex-col items-end">
                           <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(net)}
                           </span>
                           {monthData && (
                               <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/60">
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

// Main Component
const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ allMonths }) => {
  const [selectedRevenueDate, setSelectedRevenueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(12, 0, 0, 0); // Initialize with Noon to avoid TZ shifts
    return date;
  });
  
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(() => {
      try {
          const saved = localStorage.getItem('comparisonExpandedYears');
          return saved ? JSON.parse(saved) : {};
      } catch {
          return {};
      }
  });

  useEffect(() => {
      localStorage.setItem('comparisonExpandedYears', JSON.stringify(expandedYears));
  }, [expandedYears]);
  
  const analytics = useMemo(() => {
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

    const totalLifetimeNet = processedMonths.reduce((acc, m) => acc + m.net, 0);
    const averageMonthlyNet = processedMonths.length > 0 ? totalLifetimeNet / processedMonths.length : 0;
    const bestMonth = processedMonths.reduce((max, curr) => curr.net > max.net ? curr : max, processedMonths[0] || { name: '-', net: 0 });
    
    const uniqueGoalNames: string[] = Array.from(new Set(allMonths.flatMap(m => m.goals.map(g => g.name))));

    return {
        months: processedMonths,
        totalLifetimeNet,
        averageMonthlyNet,
        bestMonth,
        uniqueGoalNames
    };
  }, [allMonths]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const trendData = useMemo(() => {
    return [...analytics.months].reverse().map(m => ({ label: m.shortName, value: m.net }));
  }, [analytics.months]);

  // Create chronologically ascending months array for bar charts
  const ascendingMonths = useMemo(() => {
      return [...analytics.months].reverse();
  }, [analytics.months]);

  const selectedMonthData = useMemo(() => {
      return analytics.months.find(m => 
          m.date.getMonth() === selectedRevenueDate.getMonth() && 
          m.date.getFullYear() === selectedRevenueDate.getFullYear()
      );
  }, [analytics.months, selectedRevenueDate]);

  const donutData = useMemo(() => {
      if (!selectedMonthData) return [];

      return analytics.uniqueGoalNames.map(goalName => {
          const goal = selectedMonthData.goalBreakdown.find(item => item.name === goalName);
          const val = goal ? goal.income : 0;
          return { name: goalName, value: val, color: getGoalColor(goalName) };
      }).filter(d => d.value > 0);

  }, [selectedMonthData, analytics.uniqueGoalNames]);

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
      if (sortedYears.length > 0) {
          setExpandedYears(prev => {
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

  const handleExportReport = () => {
      // Basic CSV Export for Analytics
      const headers = ["Month", "Gross Salary", "Tax", "Net Salary", "Best Goal"];
      const rows = analytics.months.map(m => {
          const bestGoal = m.goalBreakdown.sort((a,b) => b.income - a.income)[0]?.name || 'N/A';
          return `${m.name},${m.grossTotal},${m.tax},${m.net},${bestGoal}`;
      });
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400">Deep dive into your performance metrics.</p>
        </div>
        <button onClick={handleExportReport} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
            <DownloadIcon />
            <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start w-full">
         <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden h-full">
             <div className="relative z-10">
                 <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lifetime Net Earnings</h3>
                 <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(analytics.totalLifetimeNet)}</p>
             </div>
             <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
             <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Average</h3>
             <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{formatCurrency(analytics.averageMonthlyNet)}</p>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
             <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Best Month</h3>
             <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 truncate">{analytics.bestMonth.name}</p>
             <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(analytics.bestMonth.net)}</p>
         </div>
      </div>

      {/* Goal Volume Charts Section */}
      <div className="mb-8 w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Goal Activity Volume</h3>
        <GoalVolumeCharts months={ascendingMonths} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm w-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Net Salary Trend</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly net income growth over time.</p>
            </div>
            <TrendChart data={trendData} color="#10b981" />
        </div>
        
        <MonthlyPostcard 
            monthData={selectedMonthData} 
            donutData={donutData} 
            selectedDate={selectedRevenueDate} 
            onDateChange={setSelectedRevenueDate} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Goal Performance Matrix</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Raw volume of tasks completed per month.</p>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                          <th className="px-4 py-3 sm:px-6 sm:py-4 font-medium border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky left-0 z-10 whitespace-nowrap">Goal Name</th>
                          {analytics.months.map(m => (
                              <th key={m.id} className="px-4 py-3 sm:py-4 text-center font-medium min-w-[80px]">{m.shortName}</th>
                          ))}
                          <th className="px-4 py-3 sm:py-4 text-center font-bold text-gray-700 dark:text-gray-200">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      {analytics.uniqueGoalNames.map((goalName) => {
                          const rowTotal = analytics.months.reduce((acc, m) => {
                              const goal = m.goalBreakdown.find(g => g.name === goalName);
                              return acc + (goal?.count || 0);
                          }, 0);
                          
                          const maxInRow = Math.max(...analytics.months.map(m => {
                              return m.goalBreakdown.find(g => g.name === goalName)?.count || 0;
                          }));

                          return (
                              <tr key={goalName} className="border-b border-gray-100 dark:border-gray-700/50 last:border-none hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                                  <td className="px-3 py-3 sm:px-6 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky left-0 z-10">
                                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white whitespace-nowrap h-full">
                                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getGoalColor(goalName) }}></div>
                                          {goalName}
                                      </div>
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
                                                                opacity: opacity * 0.2
                                                            }}
                                                       ></div>
                                                       <span className="relative font-semibold z-10 text-gray-700 dark:text-gray-200">{count}</span>
                                                  </div>
                                              ) : (
                                                  <span className="text-gray-300 dark:text-gray-600">-</span>
                                              )}
                                          </td>
                                      );
                                  })}
                                  <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-800">{rowTotal}</td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial Summary</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gross, Tax, and Net Salary breakdown by year.</p>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium">Month</th>
                        <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-right">Gross Salary</th>
                        <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-right text-rose-500">Tax (12%)</th>
                        <th className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-right text-emerald-600 dark:text-emerald-400">Net Salary</th>
                    </tr>
                </thead>
                {sortedYears.map(year => {
                     const yearMonths = monthsByYear[year];
                     const yearGross = yearMonths.reduce((sum, m) => sum + m.grossTotal, 0);
                     const yearTax = yearMonths.reduce((sum, m) => sum + m.tax, 0);
                     const yearNet = yearMonths.reduce((sum, m) => sum + m.net, 0);
                     const isExpanded = expandedYears[year];

                     return (
                        <tbody key={year} className="border-b border-gray-200 dark:border-gray-700 last:border-none">
                            <tr 
                                onClick={() => toggleYear(year)}
                                className="bg-gray-100 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors select-none"
                            >
                                <td className="px-3 py-3 sm:px-6 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                    {year}
                                    <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                                        {yearMonths.length} Months
                                    </span>
                                </td>
                                <td className="px-3 py-3 sm:px-6 text-right font-mono font-semibold text-gray-700 dark:text-gray-300 text-xs">{formatCurrency(yearGross)}</td>
                                <td className="px-3 py-3 sm:px-6 text-right font-mono font-semibold text-rose-500 text-xs">-{formatCurrency(yearTax)}</td>
                                <td className="px-3 py-3 sm:px-6 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">{formatCurrency(yearNet)}</td>
                            </tr>
                            {isExpanded && yearMonths.map(m => (
                                <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-3 py-3 sm:px-6 pl-8 sm:pl-12 font-medium text-gray-900 dark:text-white border-l-4 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors">{m.name}</td>
                                    <td className="px-3 py-3 sm:px-6 text-right font-mono text-gray-600 dark:text-gray-300">{formatCurrency(m.grossTotal)}</td>
                                    <td className="px-3 py-3 sm:px-6 text-right font-mono text-rose-500">-{formatCurrency(m.tax)}</td>
                                    <td className="px-3 py-3 sm:px-6 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(m.net)}</td>
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
