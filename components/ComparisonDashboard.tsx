
import React, { useMemo, useState } from 'react';
import { MonthData } from '../types';

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

// --- New Visual Components ---

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
    const size = 200;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let accumulatedOffset = 0;
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    if (total === 0) return <div className="h-48 flex items-center justify-center text-zinc-400">No income data</div>;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-8 justify-center h-full">
            <div className="relative w-48 h-48 shrink-0">
                <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    {sortedData.map((d, i) => {
                        const percentage = d.value / total;
                        const dashArray = percentage * circumference;
                        // SVG dashoffset moves counter-clockwise, so we accumulate negatively
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
                                className="transition-all duration-300 hover:opacity-80 hover:stroke-[28]"
                            >
                                <title>{`${d.name}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.value)}`}</title>
                            </circle>
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                     <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Gross</span>
                     <span className="text-xl font-bold text-zinc-900 dark:text-white">
                        {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(total)}
                     </span>
                </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2 w-full sm:w-auto">
                {sortedData.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className="w-3 h-3 rounded-full shrink-0 ring-2 ring-transparent group-hover:ring-current transition-all" style={{ backgroundColor: d.color, color: d.color }}></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{d.name}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(d.value)} 
                                <span className="ml-1 opacity-70">({((d.value/total)*100).toFixed(1)}%)</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main Component ---

const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ allMonths }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Process Data
  const analytics = useMemo(() => {
    const sortedMonths = [...allMonths].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
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

  // Chart Scaling
  const maxGross = Math.max(...analytics.months.map(m => m.grossTotal), 1000);

  // Data for new charts
  const trendData = analytics.months.map(m => ({ label: m.shortName, value: m.net }));
  const donutData = analytics.uniqueGoalNames.map(goalName => {
      const val = analytics.months.reduce((sum, m) => {
          const g = m.goalBreakdown.find(item => item.name === goalName);
          return sum + (g?.income || 0);
      }, 0);
      return { name: goalName, value: val, color: getGoalColor(goalName) };
  }).filter(d => d.value > 0);

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

      {/* 2. New Visual Charts (Trend & Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Net Salary Trend</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly net income growth over time.</p>
            </div>
            <TrendChart data={trendData} color="#10b981" />
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col">
             <div className="mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Lifetime Revenue Share</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total gross income contribution by goal.</p>
            </div>
            <div className="flex-grow flex items-center justify-center">
                <DonutChart data={donutData} />
            </div>
        </div>
      </div>

      {/* 3. Revenue Composition Analysis (Existing Stacked Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Revenue Source Composition</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Breakdown of gross salary by goal type per month.</p>
            
            <div className="h-[300px] w-full relative flex items-end gap-4 sm:gap-8 pb-8 border-b border-zinc-200 dark:border-zinc-700">
                {/* Y Axis Labels */}
                 <div className="absolute left-0 top-0 bottom-8 w-full pointer-events-none flex flex-col justify-between text-xs text-zinc-400 z-0">
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-700 w-full">{formatCurrency(maxGross)}</div>
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-700 w-full">{formatCurrency(maxGross * 0.75)}</div>
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-700 w-full">{formatCurrency(maxGross * 0.5)}</div>
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-700 w-full">{formatCurrency(maxGross * 0.25)}</div>
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-700 w-full">0</div>
                 </div>

                 {analytics.months.map((month, index) => {
                     let currentStackHeight = 0;
                     const isHovered = hoveredIndex === index;

                     return (
                         <div 
                            key={month.id} 
                            className="relative flex-1 h-full flex flex-col justify-end z-10 group cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                             {/* Stacked Bars */}
                             <div className="w-full max-w-[60px] mx-auto flex flex-col-reverse rounded-t-md overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                                 {month.goalBreakdown.map((goal, gIndex) => {
                                     if (goal.income === 0) return null;
                                     const heightPercent = (goal.income / maxGross) * 100;
                                     return (
                                         <div 
                                            key={gIndex}
                                            style={{ height: `${heightPercent}%`, backgroundColor: goal.color }}
                                            className="w-full transition-opacity duration-200 relative"
                                         >
                                            {/* Tooltip for specific segment */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/10 transition-opacity"></div>
                                         </div>
                                     );
                                 })}
                             </div>

                             {/* X Axis Label */}
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 text-center w-full">
                                 {month.shortName}
                             </div>

                             {/* Floating Details Panel (Only on Hover) */}
                             {isHovered && (
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 pointer-events-none">
                                     <p className="font-bold mb-2 border-b border-zinc-700 pb-1">{month.name}</p>
                                     <div className="space-y-1">
                                         {month.goalBreakdown.map((g) => g.income > 0 && (
                                             <div key={g.name} className="flex justify-between items-center">
                                                 <div className="flex items-center gap-1">
                                                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: g.color}}></div>
                                                     <span className="truncate max-w-[80px]">{g.name}</span>
                                                 </div>
                                                 <span className="font-mono">{formatCurrency(g.income)}</span>
                                             </div>
                                         ))}
                                         <div className="border-t border-zinc-700 mt-1 pt-1 flex justify-between font-bold text-emerald-400">
                                             <span>Total Gross</span>
                                             <span>{formatCurrency(month.grossTotal)}</span>
                                         </div>
                                     </div>
                                 </div>
                             )}
                         </div>
                     );
                 })}
            </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Legend</h3>
            <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar">
                {Object.entries(GOAL_COLORS).map(([name, color]) => {
                    if (name === 'default') return null;
                    return (
                        <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">{name}</span>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Insight</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                   "Within 5 minutes" goals typically yield the highest return per unit.
                </p>
            </div>
        </div>
      </div>

      {/* 4. Goal Performance Matrix (Existing) */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Goal Performance Matrix</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Raw volume of tasks completed per month. Darker cells indicate higher volume.</p>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-700/50">
                      <tr>
                          <th className="px-6 py-4 font-medium border-r border-zinc-200 dark:border-zinc-700">Goal Name</th>
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
                                  <td className="px-6 py-3 font-medium text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
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
      
      {/* 5. Detailed Financial Table (Existing) */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Financial Summary</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Gross, Tax, and Net Salary breakdown.</p>
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
                <tbody>
                    {analytics.months.map(m => (
                        <tr key={m.id} className="border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{m.name}</td>
                            <td className="px-6 py-4 text-right font-mono text-zinc-600 dark:text-zinc-300">{formatCurrency(m.grossTotal)}</td>
                            <td className="px-6 py-4 text-right font-mono text-rose-500">-{formatCurrency(m.tax)}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">{formatCurrency(m.net)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default ComparisonDashboard;
