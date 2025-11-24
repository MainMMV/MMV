
import React, { useMemo } from 'react';
import { SpendingItem } from '../types';

interface SpendingChartProps {
  items: SpendingItem[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ items }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    // Filter for current month spending only
    const currentMonthItems = items.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Group by category
    const groups: Record<string, number> = {};
    currentMonthItems.forEach(item => {
      groups[item.category] = (groups[item.category] || 0) + item.amount;
    });

    // Convert to array and sort descending
    return Object.entries(groups)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [items]);

  if (chartData.length === 0) {
    return null;
  }

  const maxVal = Math.max(...chartData.map(d => d.amount)) * 1.1 || 100;

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-zinc-900 dark:text-white">Current Month Spending</h3>
        <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      
      <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4">
        {chartData.map((d, i) => {
          const barHeight = (d.amount / maxVal) * 100;
          // Generate a distinctive color based on index
          const colors = [
             'bg-indigo-500 dark:bg-indigo-600',
             'bg-emerald-500 dark:bg-emerald-600',
             'bg-rose-500 dark:bg-rose-600',
             'bg-amber-500 dark:bg-amber-600',
             'bg-sky-500 dark:bg-sky-600',
             'bg-violet-500 dark:bg-violet-600',
             'bg-pink-500 dark:bg-pink-600'
          ];
          const colorClass = colors[i % colors.length];

          return (
            <div key={d.category} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-xs py-1.5 px-2.5 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-xl font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform">
                {d.category}: ${d.amount.toLocaleString()}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
              </div>
              
              {/* Value label on top of bar for easy reading on larger screens */}
              <span className="hidden sm:block text-[10px] font-bold text-zinc-400 mb-1 transition-all group-hover:text-zinc-600 dark:group-hover:text-zinc-300 group-hover:-translate-y-1">
                ${d.amount < 1000 ? d.amount : (d.amount/1000).toFixed(1) + 'k'}
              </span>

              {/* Bar */}
              <div 
                className={`w-full max-w-[40px] sm:max-w-[50px] rounded-t-lg transition-all duration-500 hover:opacity-80 ${colorClass}`}
                style={{ height: `${Math.max(barHeight, 2)}%` }} // min height 2%
              ></div>
              
              {/* X-Axis Label */}
              <div className="h-8 flex items-start justify-center w-full mt-2">
                 <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center leading-tight line-clamp-2 w-full break-words">
                    {d.category}
                 </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default SpendingChart;
