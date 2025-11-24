import React, { useMemo } from 'react';
import { Goal } from '../types';
import GaugeChart from './GaugeChart';

interface GoalsTableProps {
  goals: Goal[];
  onGoalUpdate: (monthId: string, goalId: string, updatedValues: Partial<Goal>) => void;
  isSalaryVisible: boolean;
  monthId: string;
  monthDate: string;
  viewMode: 'current' | 'projected';
}

const GoalsTable: React.FC<GoalsTableProps> = ({ goals, onGoalUpdate, isSalaryVisible, monthId, monthDate, viewMode }) => {

  const projectionData = useMemo(() => {
    const cardDate = new Date(monthDate);
    const selectedDay = cardDate.getDate();
    const daysInMonth = new Date(cardDate.getFullYear(), cardDate.getMonth() + 1, 0).getDate();
    
    const safeSelectedDay = selectedDay === 0 ? 1 : selectedDay;

    return { selectedDay: safeSelectedDay, daysInMonth };
  }, [monthDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
  };

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

  const handleInputChange = (goalId: string, field: keyof Goal, value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onGoalUpdate(monthId, goalId, { [field]: numericValue });
    } else if (value === '') {
      onGoalUpdate(monthId, goalId, { [field]: 0 });
    }
  };

  const calculateRow = (goal: Goal) => {
    let displayValue = goal.progress;
    let projectedValue = 0;

    if (viewMode === 'projected') {
        if (projectionData.selectedDay > 0) {
             projectedValue = (goal.progress / projectionData.selectedDay) * projectionData.daysInMonth;
        }
        // Round the projected value to an integer before calculating salary/percentage
        displayValue = Math.round(projectedValue);
    }

    const multiplier = getSalaryMultiplier(goal.name);
    const salary = displayValue * multiplier;
    const percentage = goal.endValue > 0 ? (displayValue / goal.endValue) * 100 : 0;

    return { displayValue, salary, percentage };
  };

  // Calculate totals based on the displayed values (rounded projections or current actuals)
  const totals = useMemo(() => {
      return goals.reduce((acc, goal) => {
          const { salary } = calculateRow(goal);
          return acc + salary;
      }, 0);
  }, [goals, viewMode, projectionData]);

  const tax = totals * 0.12;
  const netSalary = totals - tax;

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-2xl border border-white/30 dark:border-gray-700/30 bg-white/40 dark:bg-gray-900/20 backdrop-blur-sm shadow-inner">
        <div className="min-w-[350px]">
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-white/30 dark:border-gray-700/30 bg-white/20 dark:bg-gray-800/20">
                    <tr>
                        <th scope="col" className="px-4 py-4 whitespace-nowrap font-bold">Goal Name</th>
                        <th scope="col" className="px-2 py-4 text-center font-bold">
                            {viewMode === 'current' ? 'Curr' : 'End'}
                        </th>
                        <th scope="col" className="px-2 py-4 text-center font-bold">Target</th>
                        <th scope="col" className="px-2 py-4 text-center font-bold">Prog</th>
                        <th scope="col" className="px-4 py-4 text-right font-bold">Salary</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/20 dark:divide-gray-700/30">
                    {goals.map((goal) => {
                        const { displayValue, salary, percentage } = calculateRow(goal);
                        
                        return (
                            <tr key={goal.id} className="hover:bg-white/30 dark:hover:bg-gray-700/20 transition-colors">
                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                                    {goal.name}
                                </td>
                                <td className="px-2 py-3 text-center font-bold text-gray-900 dark:text-white">
                                    {viewMode === 'current' ? (
                                         <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={goal.progress}
                                            onChange={(e) => handleInputChange(goal.id, 'progress', e.target.value)}
                                            className="w-14 text-center bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-600/50 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none p-1.5 backdrop-blur-sm transition-all"
                                        />
                                    ) : (
                                        <span className="inline-block px-2 py-1 rounded bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 backdrop-blur-md">
                                            {displayValue}
                                        </span>
                                    )}
                                </td>
                                 <td className="px-2 py-3 text-center">
                                     <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={goal.endValue}
                                        onChange={(e) => handleInputChange(goal.id, 'endValue', e.target.value)}
                                        className="w-14 text-center bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-600/50 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500/50 focus:outline-none p-1.5 backdrop-blur-sm transition-all"
                                    />
                                </td>
                                <td className="px-2 py-3">
                                    <div className="flex justify-center pb-1">
                                        <GaugeChart percentage={percentage} size={42} strokeWidth={5} />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                    {formatCurrency(salary)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {isSalaryVisible && (
                    <tfoot className="border-t border-white/40 dark:border-gray-700/40 bg-white/20 dark:bg-gray-800/20 font-semibold text-gray-900 dark:text-white backdrop-blur-md">
                        <tr>
                            <td colSpan={4} className="px-4 py-2 text-right text-xs sm:text-sm">Total Gross:</td>
                            <td className="px-4 py-2 text-right font-mono text-xs sm:text-sm">{formatCurrency(totals)}</td>
                        </tr>
                         <tr>
                            <td colSpan={4} className="px-4 py-2 text-right text-xs text-gray-500 dark:text-gray-400">Tax (12%):</td>
                            <td className="px-4 py-2 text-right font-mono text-xs text-rose-500">-{formatCurrency(tax)}</td>
                        </tr>
                        <tr className="text-base sm:text-lg border-t border-white/20 dark:border-gray-700/30">
                            <td colSpan={4} className="px-4 py-3 text-right">Net Salary:</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold drop-shadow-sm">{formatCurrency(netSalary)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    </div>
  );
};

export default GoalsTable;