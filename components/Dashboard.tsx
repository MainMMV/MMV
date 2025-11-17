import React, { useMemo } from 'react';
import { MonthData, GoalStatus } from '../types';

interface DashboardProps {
  allMonths: MonthData[];
}

const Dashboard: React.FC<DashboardProps> = ({ allMonths }) => {
  const stats = useMemo(() => {
    let totalGoals = 0;
    let completedGoals = 0;
    let inProgressGoals = 0;
    let totalNetSalary = 0;

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

    allMonths.forEach(month => {
      totalGoals += month.goals.length;
      
      let monthTotalSalary = 0;
      month.goals.forEach(goal => {
        if (goal.progress >= goal.endValue && goal.endValue > 0) {
          completedGoals++;
        }
        if (goal.status === GoalStatus.IN_PROGRESS) {
          inProgressGoals++;
        }
        monthTotalSalary += getSalaryMultiplier(goal.name) * goal.progress;
      });
      
      const taxDeduction = monthTotalSalary * 0.12;
      totalNetSalary += monthTotalSalary - taxDeduction;
    });

    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    return {
      totalNetSalary,
      completionRate,
      inProgressGoals,
    };
  }, [allMonths]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat Card: Total Net Salary */}
        <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Net Salary</h3>
          <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(stats.totalNetSalary)}</p>
        </div>
        {/* Stat Card: Goal Completion Rate */}
        <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Overall Goal Completion</h3>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-600 dark:text-slate-400 mt-2">{stats.completionRate.toFixed(1)}%</p>
        </div>
        {/* Stat Card: Active Goals */}
        <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Goals</h3>
          <p className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-2">{stats.inProgressGoals}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
