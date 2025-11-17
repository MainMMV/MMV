import React, { useMemo, useEffect } from 'react';
import { Goal, GoalStatus } from '../types';
import PieChart from './PieChart';

/**
 * Props for the GoalsTable component.
 */
interface GoalsTableProps {
  goals: Goal[]; // The list of goals to display.
  onGoalUpdate: (monthId: string, goalId: string, updatedValues: Partial<Goal>) => void; // Callback to update a goal's values.
  isSalaryVisible: boolean; // Flag to control the visibility of the salary summary footer.
  monthId: string; // The ID of the parent month.
  monthDate: string; // The date of the month card, used for projection calculations.
}

const statusStyles: { [key in GoalStatus]: string } = {
  [GoalStatus.IN_PROGRESS]: 'bg-amber-500/20 text-amber-700 dark:bg-amber-600/30 dark:text-amber-300',
  [GoalStatus.COMPLETED]: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-600/30 dark:text-emerald-300',
  [GoalStatus.NOT_STARTED]: 'bg-zinc-500/20 text-zinc-700 dark:bg-zinc-600/30 dark:text-zinc-300',
  [GoalStatus.NOT_COMPLETED]: 'bg-rose-500/20 text-rose-700 dark:bg-rose-600/30 dark:text-rose-300',
};

/**
 * Renders a table displaying goal progress and calculating associated salaries.
 */
const GoalsTable: React.FC<GoalsTableProps> = ({ goals, onGoalUpdate, isSalaryVisible, monthId, monthDate }) => {

  useEffect(() => {
    goals.forEach(goal => {
        let newStatus = goal.status;
        if (goal.endValue > 0 && goal.progress >= goal.endValue) {
            newStatus = GoalStatus.COMPLETED;
        } else if (goal.progress > 0 && goal.status === GoalStatus.NOT_STARTED) {
            newStatus = GoalStatus.IN_PROGRESS;
        } else if (goal.status === GoalStatus.COMPLETED && goal.progress < goal.endValue) {
            newStatus = GoalStatus.IN_PROGRESS;
        }

        if (newStatus !== goal.status) {
            onGoalUpdate(monthId, goal.id, { status: newStatus });
        }
    });
  }, [goals, onGoalUpdate, monthId]);


  const projectionData = useMemo(() => {
    const cardDate = new Date(monthDate);
    const selectedDay = cardDate.getDate();
    const daysInMonth = new Date(cardDate.getFullYear(), cardDate.getMonth() + 1, 0).getDate();
    const canProject = selectedDay > 0;
    
    return { selectedDay, daysInMonth, canProject };
  }, [monthDate]);

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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

  const totalSalary = goals.reduce((acc, goal) => acc + (getSalaryMultiplier(goal.name) * goal.progress), 0);
  const taxDeduction = totalSalary * 0.12;
  const netSalary = totalSalary - taxDeduction;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-zinc-600 dark:text-zinc-300">
        <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">
          <tr>
            <th scope="col" className="px-2 py-3">TYPE</th>
            <th scope="col" className="px-2 py-3 text-center w-20">TOTAL</th>
            <th scope="col" className="px-2 py-3 text-center w-20">GOAL</th>
            <th scope="col" className="px-2 py-3 text-center">PROGRESS</th>
            <th scope="col" className="px-2 py-3 text-center hidden sm:table-cell">PROJECTED END</th>
            <th scope="col" className="px-2 py-3 text-right">SALARY</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => {
            const percentage = goal.endValue > 0 ? (goal.progress / goal.endValue) * 100 : 0;
            const salary = getSalaryMultiplier(goal.name) * goal.progress;
            
            const projectedTotal = projectionData.canProject
              ? (goal.progress / projectionData.selectedDay) * projectionData.daysInMonth
              : 0;
            
            const projectedPercentage = goal.endValue > 0 && projectedTotal > 0
              ? (projectedTotal / goal.endValue) * 100
              : 0;

            return (
              <tr key={goal.id} className={`border-b border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/40 transition-colors duration-150`}>
                <td className="px-2 py-2 font-medium whitespace-nowrap text-zinc-900 dark:text-white">{capitalizeFirstLetter(goal.name)}</td>
                <td className="px-2 py-2 text-center">
                   <input
                    type="number"
                    value={goal.progress}
                    onChange={(e) => handleInputChange(goal.id, 'progress', e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900/10 text-center focus:outline-none focus:ring-1 focus:ring-slate-600 rounded-md p-1 transition-all"
                    aria-label={`Current total for ${goal.name}`}
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="number"
                    value={goal.endValue}
                    onChange={(e) => handleInputChange(goal.id, 'endValue', e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-900/10 text-center focus:outline-none focus:ring-1 focus:ring-slate-600 rounded-md p-1 transition-all"
                    aria-label={`Goal for ${goal.name}`}
                  />
                </td>
                <td className="px-2 py-2">
                    <div className="flex justify-center">
                      <PieChart percentage={percentage} />
                    </div>
                </td>
                <td className="px-2 py-2 text-center text-xs hidden sm:table-cell">
                  {projectionData.canProject && goal.progress > 0 ? (
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100">{Math.round(projectedTotal)}</span>
                      <span className="text-zinc-500 dark:text-zinc-400"> ({Math.round(projectedPercentage)}%)</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 dark:text-zinc-400">-</span>
                  )}
                </td>
                <td className="px-2 py-2 text-right font-semibold text-zinc-900 dark:text-white">
                  {formatCurrency(salary)}
                </td>
              </tr>
            );
          })}
        </tbody>
        {isSalaryVisible && (
            <tfoot className="text-sm font-semibold">
                <tr className="border-t-2 border-zinc-300 dark:border-zinc-600">
                    <td colSpan={4} className="sm:col-span-5 px-4 py-2 text-right text-zinc-500 dark:text-zinc-400">Total Salary</td>
                    <td className="px-4 py-2 text-right font-bold text-lg text-slate-600 dark:text-slate-400">{formatCurrency(totalSalary)}</td>
                </tr>
                <tr>
                    <td colSpan={4} className="sm:col-span-5 px-4 py-1 text-right text-zinc-500 dark:text-zinc-400">Tax (-12%)</td>
                    <td className="px-4 py-1 text-right text-rose-600 dark:text-rose-400">-{formatCurrency(taxDeduction)}</td>
                </tr>
                <tr className="border-t border-zinc-200 dark:border-zinc-700/50">
                    <td colSpan={4} className="sm:col-span-5 px-4 py-2 text-right text-base text-zinc-900 dark:text-white">Net Salary</td>
                    <td className="px-4 py-2 text-right font-extrabold text-lg text-emerald-600 dark:text-emerald-400">{formatCurrency(netSalary)}</td>
                </tr>
            </tfoot>
        )}
      </table>
    </div>
  );
};

export default GoalsTable;
