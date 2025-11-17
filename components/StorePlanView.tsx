import React, { useState } from 'react';
import { StorePlan } from '../types';
import StorePlanCard from './StorePlanCard';
import Calendar from './Calendar';
import { CalendarIcon, DownloadIcon } from './Icons';

interface StorePlanViewProps {
  plans: StorePlan[];
  onPlanUpdate: (planId: string, updatedValues: Partial<StorePlan>) => void;
}

const StorePlanView: React.FC<StorePlanViewProps> = ({ plans, onPlanUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date('2025-11-16T00:00:00Z'));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Format date for the button, using English locale.
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(selectedDate);
  
  const handleExport = () => {
    const escapeCsvCell = (cell: any): string => {
      const cellStr = String(cell).replace(/"/g, '""');
      return `"${cellStr}"`;
    };

    const getDateInfo = (currentDate: Date, cardIndex: number) => {
      const selectedDay = currentDate.getDate();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

      if (cardIndex === 0) { // Main Plan
        return {
            daysPassed: selectedDay,
            daysInPeriod: totalDaysInMonth,
            daysRemaining: Math.max(0, totalDaysInMonth - selectedDay)
        };
      }

      let decadeStartDay: number, decadeEndDay: number;
      switch (cardIndex) {
          case 1: decadeStartDay = 1; decadeEndDay = 10; break;
          case 2: decadeStartDay = 11; decadeEndDay = 20; break;
          case 3: decadeStartDay = 21; decadeEndDay = totalDaysInMonth; break;
          default: decadeStartDay = 1; decadeEndDay = totalDaysInMonth; break;
      }
      const daysInPeriod = decadeEndDay - decadeStartDay + 1;
      
      let daysPassed: number;
      let daysRemaining: number;

      if (selectedDay < decadeStartDay) { // Date is before the decade
          daysPassed = 0;
          daysRemaining = daysInPeriod;
      } else if (selectedDay > decadeEndDay) { // Date is after the decade
          daysPassed = daysInPeriod;
          daysRemaining = 0;
      } else { // Date is inside the decade
          daysPassed = selectedDay - decadeStartDay + 1;
          daysRemaining = decadeEndDay - selectedDay;
      }

      return { daysPassed, daysInPeriod, daysRemaining };
    };
    
    const getDecadePeriodString = (currentDate: Date, cardIndex: number) => {
        const monthName = currentDate.toLocaleString('en-US', { month: 'short' });
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

        switch (cardIndex) {
            case 1: return `1-10 ${monthName}`;
            case 2: return `11-20 ${monthName}`;
            case 3: return `21-${totalDaysInMonth} ${monthName}`;
            default: return '';
        }
    };

    const formatNumber = (value: number, decimals = 0) => {
        if (isNaN(value) || !isFinite(value)) return '0';
        // Export raw numbers for better compatibility with spreadsheet software
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: false, 
        }).format(value);
    };

    const allRows: (string | number)[][] = [];

    // Main Plan
    if (plans[0]) {
      allRows.push(["Target", "Plan", "Actual Sum", "Actual %", "Temp %", "Remainder", "Daily", "Qty of goods"]);
      const mainPlan = plans[0];
      const dateInfo = getDateInfo(selectedDate, 0);
      const targets = [{label: 'To 100%', mult: 1}, {label: 'To 90%', mult: 0.9}, {label: 'To 80%', mult: 0.8}];
      
      targets.forEach(target => {
          const planValue = mainPlan.plan100 * target.mult;
          const actualPercent = planValue > 0 ? (mainPlan.actualSum / planValue) * 100 : 0;
          const tempPercent = dateInfo.daysPassed > 0 && dateInfo.daysInPeriod > 0 ? actualPercent / (dateInfo.daysPassed / dateInfo.daysInPeriod) : 0;
          const remainder = planValue - mainPlan.actualSum;
          const daily = dateInfo.daysRemaining > 0 ? Math.max(0, remainder) / dateInfo.daysRemaining : 0;

          allRows.push([
              target.label,
              formatNumber(planValue),
              formatNumber(mainPlan.actualSum),
              `${formatNumber(actualPercent, 2)}%`,
              `${formatNumber(tempPercent, 2)}%`,
              formatNumber(remainder),
              formatNumber(daily),
              50
          ]);
      });
    }

    // Decade Plans
    plans.slice(1).forEach((plan, index) => {
        allRows.push([]); // Add an empty row for visual separation
        const cardIndex = index + 1;
        const decadeHeader = ["Store Plan", "Plan", "Actual Sum", "Actual %", "Temp %", "Remainder", "Daily", getDecadePeriodString(selectedDate, cardIndex)];
        allRows.push(decadeHeader);

        const dateInfo = getDateInfo(selectedDate, cardIndex);
        const targets = [
            {label: 'To 100%', mult: 1, qty: 3}, 
            {label: 'To 90%', mult: 0.9, qty: 2}, 
            {label: 'To 80%', mult: 0.8, qty: 1}
        ];

        targets.forEach(target => {
            const planValue = plan.plan100 * target.mult;
            const actualPercent = planValue > 0 ? (plan.actualSum / planValue) * 100 : 0;
            const tempPercent = dateInfo.daysPassed > 0 && dateInfo.daysInPeriod > 0 ? actualPercent / (dateInfo.daysPassed / dateInfo.daysInPeriod) : 0;
            const remainder = planValue - plan.actualSum;
            const daily = dateInfo.daysRemaining > 0 ? Math.max(0, remainder) / dateInfo.daysRemaining : 0;
            
            allRows.push([
                target.label,
                formatNumber(planValue),
                formatNumber(plan.actualSum),
                `${formatNumber(actualPercent, 2)}%`,
                `${formatNumber(tempPercent, 2)}%`,
                formatNumber(remainder),
                formatNumber(daily),
                target.qty
            ]);
        });
    });

    const csvContent = allRows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `store-plans-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Branch Plans</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-100 shadow-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            <DownloadIcon />
            <span>Export</span>
          </button>
          
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-4 py-2 bg-zinc-200 dark:bg-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-100 shadow-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
              aria-haspopup="true"
              aria-expanded={isCalendarOpen}
            >
              <span>{formattedDate}</span>
              <CalendarIcon />
            </button>
            {isCalendarOpen && (
              <Calendar
                selectedDate={selectedDate}
                onDateChange={(newDate) => {
                  setSelectedDate(newDate);
                  setIsCalendarOpen(false);
                }}
                onClose={() => setIsCalendarOpen(false)}
                align="right"
              />
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-slate-400 via-slate-600 to-transparent mb-8"></div>
        
      <div className="grid grid-cols-1 gap-8 items-start">
        {plans.map((plan, index) => (
          <StorePlanCard
            key={plan.id}
            planData={plan}
            onUpdate={(updatedValues) => onPlanUpdate(plan.id, updatedValues)}
            currentDate={selectedDate}
            cardIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default StorePlanView;
