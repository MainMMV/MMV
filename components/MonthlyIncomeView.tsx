
import React, { useMemo } from 'react';
import { MonthData } from '../types';
import { WalletIcon, TrendingUpIcon } from './Icons';

interface MonthlyIncomeViewProps {
  allMonths: MonthData[];
  onUpdateMonth?: (monthId: string, updatedValues: Partial<MonthData>) => void;
}

const MonthlyIncomeView: React.FC<MonthlyIncomeViewProps> = ({ allMonths, onUpdateMonth }) => {
  // Sort months descending (newest first)
  const sortedMonths = useMemo(() => {
    return [...allMonths].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allMonths]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value).replace(/,/g, ' ');
  };

  const handleInputChange = (id: string, field: keyof MonthData, value: string) => {
      if (!onUpdateMonth) return;
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
      
      if (!isNaN(numericValue)) {
          onUpdateMonth(id, { [field]: numericValue });
      } else if (value === '') {
          onUpdateMonth(id, { [field]: 0 });
      }
  };

  // Prepare chart data (Chronological order)
  const chartData = useMemo(() => {
      return [...sortedMonths].reverse().map(m => {
          const s65 = m.salary65 || 0;
          const s35 = m.salary35 || 0;
          const bonus = m.manualBonus || 0;
          const overall = s65 + s35 + bonus;
          return {
              name: new Date(m.date).toLocaleDateString('en-US', { month: 'short' }),
              bonus: bonus,
              overall: overall
          };
      });
  }, [sortedMonths]);

  // Diff Widget Data (Comparison of latest month vs previous)
  const diffData = useMemo(() => {
      if (sortedMonths.length < 2) return null;
      
      const current = sortedMonths[0];
      const prev = sortedMonths[1];
      
      const currTotal = (current.salary65 || 0) + (current.salary35 || 0) + (current.manualBonus || 0);
      const prevTotal = (prev.salary65 || 0) + (prev.salary35 || 0) + (prev.manualBonus || 0);
      
      const diff = currTotal - prevTotal;
      const percent = prevTotal > 0 ? (diff / prevTotal) * 100 : 0;
      
      const currName = new Date(current.date).toLocaleDateString('en-US', { month: 'short' });
      const prevName = new Date(prev.date).toLocaleDateString('en-US', { month: 'short' });

      return { diff, percent, label: `${currName} vs ${prevName}` };
  }, [sortedMonths]);

  // --- SVG Line Chart ---
  const Chart = () => {
      if (chartData.length === 0) return <div className="text-gray-400 text-sm p-4">No data to chart</div>;

      const height = 200;
      const width = 100; // viewBox percentages
      const padding = 5;
      
      const maxVal = Math.max(...chartData.map(d => d.overall), 100) * 1.1;
      
      const getPoints = (key: 'overall' | 'bonus') => {
          return chartData.map((d, i) => {
              const x = (i / (chartData.length - 1 || 1)) * (width - padding * 2) + padding;
              const y = height - (d[key] / maxVal) * height; // Invert Y
              return `${x},${y}`;
          }).join(' ');
      };

      return (
          <div className="w-full h-64 relative bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1={height} x2={width} y2={height} stroke="#e5e7eb" strokeWidth="0.5" />
                  <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                  
                  {/* Overall Line */}
                  <polyline 
                      points={getPoints('overall')} 
                      fill="none" 
                      stroke="#10b981" // emerald-500
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Bonus Line */}
                  <polyline 
                      points={getPoints('bonus')} 
                      fill="none" 
                      stroke="#f59e0b" // amber-500
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      vectorEffect="non-scaling-stroke"
                  />
              </svg>
              
              {/* Tooltip Overlay (Simple circles on data points) */}
              <div className="absolute inset-0 pointer-events-none">
                  {chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1 || 1)) * 100;
                      return (
                          <div key={i} className="absolute bottom-0 flex flex-col items-center group" style={{ left: `${x}%`, height: '100%' }}>
                              <div className="flex-grow border-l border-gray-300 dark:border-gray-600 border-dashed opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div className="bg-gray-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 absolute bottom-0 translate-y-full">
                                  {d.name}
                              </div>
                          </div>
                      );
                  })}
              </div>
              
              {/* Legend */}
              <div className="absolute top-2 right-2 flex gap-3 text-[10px]">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Overall</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Bonus</div>
              </div>
          </div>
      );
  };

  return (
    <div className="animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <WalletIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    Monthly Income Details
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manual breakdown of salary components.</p>
            </div>
            
            {/* Diff Section (Replaces Calendar) */}
            {diffData && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{diffData.label}</p>
                        <div className={`text-lg font-bold flex items-center justify-end gap-1 ${diffData.diff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {diffData.diff >= 0 ? '+' : ''}{formatCurrency(diffData.diff)}
                            <span className="text-xs font-normal opacity-80">({diffData.diff >= 0 ? '+' : ''}{diffData.percent.toFixed(1)}%)</span>
                        </div>
                    </div>
                    <div className={`p-2 rounded-full ${diffData.diff >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        <TrendingUpIcon className={`w-5 h-5 ${diffData.diff < 0 ? 'transform rotate-180' : ''}`} />
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Detailed Table (2/3 width) */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/30">
                            <tr>
                                <th className="px-4 py-4 font-bold border-b border-r border-gray-200 dark:border-gray-700 sticky left-0 z-10 bg-gray-50 dark:bg-gray-800">Data / Type</th>
                                <th className="px-4 py-4 text-right font-bold border-b border-gray-200 dark:border-gray-700">65% Salary</th>
                                <th className="px-4 py-4 text-right font-bold border-b border-gray-200 dark:border-gray-700">35% Salary</th>
                                <th className="px-4 py-4 text-right font-bold border-b border-gray-200 dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/10">Bonus</th>
                                <th className="px-4 py-4 text-right font-bold border-b border-gray-200 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/10">Overall</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMonths.map((month) => {
                                const s65 = month.salary65 || 0;
                                const s35 = month.salary35 || 0;
                                const bonus = month.manualBonus || 0;
                                const overall = s65 + s35 + bonus;

                                return (
                                    <tr key={month.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors group">
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/20 sticky left-0 z-10 whitespace-nowrap">
                                            {month.name}
                                        </td>
                                        
                                        <td className="px-2 py-2">
                                            <input 
                                                type="text" 
                                                value={formatCurrency(s65)}
                                                onChange={(e) => handleInputChange(month.id, 'salary65', e.target.value)}
                                                className="w-full text-right bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none py-1 font-mono text-gray-700 dark:text-gray-300"
                                                placeholder="0"
                                            />
                                        </td>
                                        
                                        <td className="px-2 py-2">
                                            <input 
                                                type="text" 
                                                value={formatCurrency(s35)}
                                                onChange={(e) => handleInputChange(month.id, 'salary35', e.target.value)}
                                                className="w-full text-right bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none py-1 font-mono text-gray-700 dark:text-gray-300"
                                                placeholder="0"
                                            />
                                        </td>
                                        
                                        <td className="px-2 py-2 bg-amber-50/30 dark:bg-amber-900/5">
                                            <input 
                                                type="text" 
                                                value={formatCurrency(bonus)}
                                                onChange={(e) => handleInputChange(month.id, 'manualBonus', e.target.value)}
                                                className="w-full text-right bg-transparent border-b border-transparent focus:border-amber-500 focus:outline-none py-1 font-mono font-medium text-amber-700 dark:text-amber-400"
                                                placeholder="0"
                                            />
                                        </td>
                                        
                                        <td className="px-4 py-3 text-right bg-emerald-50/30 dark:bg-emerald-900/5 font-bold font-mono text-emerald-700 dark:text-emerald-400">
                                            {formatCurrency(overall)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RIGHT: Charts (1/3 width) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Income Trend</h3>
                    <Chart />
                    <div className="mt-6 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Average Overall</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {formatCurrency(
                                    chartData.length > 0 
                                    ? chartData.reduce((acc, c) => acc + c.overall, 0) / chartData.length 
                                    : 0
                                )}
                            </p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                            <p className="text-xs text-amber-600 dark:text-amber-400 uppercase font-bold mb-1">Average Bonus</p>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                {formatCurrency(
                                    chartData.length > 0 
                                    ? chartData.reduce((acc, c) => acc + c.bonus, 0) / chartData.length 
                                    : 0
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default MonthlyIncomeView;
