
import React, { useMemo } from 'react';
import { Goal } from '../types';
import PieChart from './PieChart';

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
    <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[350px] px-4 sm:px-0">
            <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-400">
                    <tr>
                        <th scope="col" className="px-2 sm:px-4 py-3 rounded-tl-lg whitespace-nowrap">Goal Name</th>
                        <th scope="col" className="px-2 sm:px-4 py-3 text-center">
                            {viewMode === 'current' ? 'Curr' : 'End'}
                        </th>
                        <th scope="col" className="px-2 sm:px-4 py-3 text-center">Target</th>
                        <th scope="col" className="px-2 sm:px-4 py-3 text-center">Prog</th>
                        <th scope="col" className="px-2 sm:px-4 py-3 text-right rounded-tr-lg">Salary</th>
                    </tr>
                </thead>
                <tbody>
                    {goals.map((goal) => {
                        const { displayValue, salary, percentage } = calculateRow(goal);
                        
                        return (
                            <tr key={goal.id} className="bg-white border-b dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors">
                                <td className="px-2 sm:px-4 py-3 font-medium text-zinc-900 dark:text-white">
                                    {goal.name}
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-center font-bold text-zinc-900 dark:text-white">
                                    {viewMode === 'current' ? (
                                         <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={goal.progress}
                                            onChange={(e) => handleInputChange(goal.id, 'progress', e.target.value)}
                                            className="w-12 sm:w-16 text-center bg-zinc-100 dark:bg-zinc-700 border-none rounded focus:ring-1 focus:ring-slate-500 p-1"
                                        />
                                    ) : (
                                        <span className="text-emerald-600 dark:text-emerald-400">{displayValue}</span>
                                    )}
                                </td>
                                 <td className="px-2 sm:px-4 py-3 text-center">
                                     <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={goal.endValue}
                                        onChange={(e) => handleInputChange(goal.id, 'endValue', e.target.value)}
                                        className="w-12 sm:w-16 text-center bg-zinc-100 dark:bg-zinc-700 border-none rounded focus:ring-1 focus:ring-slate-500 p-1"
                                    />
                                </td>
                                <td className="px-2 sm:px-4 py-3">
                                    <div className="flex justify-center">
                                        <PieChart percentage={percentage} size={28} strokeWidth={3} />
                                    </div>
                                </td>
                                <td className="px-2 sm:px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(salary)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {isSalaryVisible && (
                    <tfoot className="bg-zinc-100 dark:bg-zinc-700/50 font-semibold text-zinc-900 dark:text-white">
                        <tr>
                            <td colSpan={4} className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">Total Gross:</td>
                            <td className="px-2 sm:px-4 py-2 text-right font-mono text-xs sm:text-sm">{formatCurrency(totals)}</td>
                        </tr>
                         <tr>
                            <td colSpan={4} className="px-2 sm:px-4 py-2 text-right text-xs text-zinc-500">Tax (12%):</td>
                            <td className="px-2 sm:px-4 py-2 text-right font-mono text-xs text-rose-500">-{formatCurrency(tax)}</td>
                        </tr>
                        <tr className="text-base sm:text-lg border-t border-zinc-300 dark:border-zinc-600">
                            <td colSpan={4} className="px-2 sm:px-4 py-3 text-right">Net Salary:</td>
                            <td className="px-2 sm:px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(netSalary)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    </div>
  );
};

export default GoalsTable;
