import React, { useState, useEffect, useRef } from 'react';
import { StorePlan } from '../types';
import StorePlanCard from './StorePlanCard';
import { CalendarIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface StorePlanViewProps {
  plans: StorePlan[];
  onPlanUpdate: (planId: string, updatedValues: Partial<StorePlan>) => void;
}

const StorePlanView: React.FC<StorePlanViewProps> = ({ plans, onPlanUpdate }) => {
  // Default to Yesterday's date (Active logic)
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(12, 0, 0, 0); // Initialize at noon to prevent TZ shifts
    return date;
  });
  
  // Smart Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Sync viewYear when selectedDate changes externally
  useEffect(() => {
    setViewYear(selectedDate.getFullYear());
  }, [selectedDate]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logic: "if month ends it will be end of month if active it will be yesterdays date"
  const handleMonthSelect = (monthIndex: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let newDate;

    if (viewYear === currentYear && monthIndex === currentMonth) {
        // Active Month: Set to Yesterday (Noon)
        newDate = new Date(currentYear, currentMonth, now.getDate() - 1, 12, 0, 0, 0);
    } else if (viewYear < currentYear || (viewYear === currentYear && monthIndex < currentMonth)) {
        // Past Month: Set to End of Month (Last Day, Noon)
        newDate = new Date(viewYear, monthIndex + 1, 0, 12, 0, 0, 0);
    } else {
        // Future Month: Default to 15th (Noon)
        newDate = new Date(viewYear, monthIndex, 15, 12, 0, 0, 0);
    }

    setSelectedDate(newDate);
    setIsPickerOpen(false);
  };

  const changeYear = (delta: number) => {
    setViewYear(prev => prev + delta);
  };
  
  // Format date for the button
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(selectedDate);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Branch Plans</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700/80 rounded-lg text-gray-800 dark:text-gray-100 shadow-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <DownloadIcon />
            <span>Export</span>
          </button>
          
          <div className="relative w-full sm:w-auto" ref={pickerRef}>
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-4 py-2 bg-gray-200 dark:bg-gray-700/80 rounded-lg text-gray-800 dark:text-gray-100 shadow-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              aria-haspopup="true"
              aria-expanded={isPickerOpen}
            >
              <span>{formattedDate}</span>
              <CalendarIcon />
            </button>
            {isPickerOpen && (
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
                                onClick={() => handleMonthSelect(i)}
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