import React, { useState, useRef, useEffect } from 'react';
import { MonthData, Goal } from '../types';
import GoalsTable from './GoalsTable';
import { PencilIcon, EyeIcon, EyeOffIcon, TrashIcon, DotsVerticalIcon, DuplicateIcon, ArrowsRightLeftIcon, CalendarIcon, DownloadIcon } from './Icons';
import Calendar from './Calendar';

/**
 * Props for the MonthCard component.
 */
interface MonthCardProps {
  monthData: MonthData;
  onGoalUpdate: (monthId: string, goalId: string, updatedValues: Partial<Goal>) => void;
  onUpdateMonth: (updatedValues: Partial<MonthData>) => void;
  onDeleteCard: () => void;
  onCloneCard?: () => void;
}

/**
 * A card component that displays all information for a single month.
 */
const MonthCard: React.FC<MonthCardProps> = ({ monthData, onGoalUpdate, onUpdateMonth, onDeleteCard, onCloneCard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(monthData.name);
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'projected'>('current');

  const menuRef = useRef<HTMLDivElement>(null);
  const date = new Date(monthData.date);
  const day = date.getDate();
  const monthShort = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    onUpdateMonth({ name: editingName });
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const handleCancel = () => {
    setEditingName(monthData.name);
    setIsEditing(false);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'current' ? 'projected' : 'current');
  };

  const startEditing = () => {
      setIsEditing(true);
      setIsMenuOpen(false);
  }

  // Logic duplicated from GoalsTable to ensure export matches visual exactly
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

  const handleExport = () => {
    // 1. Prepare Data
    const cardDate = new Date(monthData.date);
    const selectedDay = cardDate.getDate();
    const daysInMonth = new Date(cardDate.getFullYear(), cardDate.getMonth() + 1, 0).getDate();
    const safeSelectedDay = selectedDay === 0 ? 1 : selectedDay;

    const rows = monthData.goals.map(goal => {
        let displayValue = goal.progress;
        let projectedValue = 0;

        if (viewMode === 'projected') {
            if (safeSelectedDay > 0) {
                projectedValue = (goal.progress / safeSelectedDay) * daysInMonth;
            }
            displayValue = Math.round(projectedValue);
        }

        const multiplier = getSalaryMultiplier(goal.name);
        const salary = displayValue * multiplier;
        const percentage = goal.endValue > 0 ? (displayValue / goal.endValue) * 100 : 0;

        return {
            name: goal.name,
            value: displayValue,
            target: goal.endValue,
            percentage: percentage.toFixed(2) + '%',
            salary: salary
        };
    });

    const totalSalary = rows.reduce((acc, row) => acc + row.salary, 0);
    const tax = totalSalary * 0.12;
    const netSalary = totalSalary - tax;

    const headerLabel = viewMode === 'current' ? 'Current' : 'End Stats';

    // 2. Create Simplified HTML Table for Excel
    // This ensures "normal cells" and rows, avoiding merged footers for clarity in data processing
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${monthData.name}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th { border: 1px solid #000; background-color: #f0f0f0; font-weight: bold; padding: 5px; }
            td { border: 1px solid #ccc; padding: 5px; }
            .num { mso-number-format:"0"; }
            .currency { mso-number-format:"#,##0"; }
        </style>
      </head>
      <body>
        <h3>${monthData.name} - ${viewMode === 'current' ? 'Real-Time Report' : 'Projected Report'}</h3>
        <table>
          <thead>
            <tr>
              <th>Goal Name</th>
              <th>${headerLabel}</th>
              <th>Target</th>
              <th>Progress %</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${row.name}</td>
                <td class="num">${row.value}</td>
                <td class="num">${row.target}</td>
                <td>${row.percentage}</td>
                <td class="currency">${row.salary}</td>
              </tr>
            `).join('')}
            <tr><td></td><td></td><td></td><td></td><td></td></tr>
            <tr>
               <td></td><td></td><td></td>
               <td style="font-weight:bold; text-align:right;">Total Gross</td>
               <td class="currency" style="font-weight:bold;">${totalSalary}</td>
            </tr>
             <tr>
               <td></td><td></td><td></td>
               <td style="text-align:right;">Tax (12%)</td>
               <td class="currency" style="color:red;">-${tax}</td>
            </tr>
            <tr>
               <td></td><td></td><td></td>
               <td style="font-weight:bold; text-align:right;">Net Salary</td>
               <td class="currency" style="font-weight:bold; color:green;">${netSalary}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${monthData.name.replace(/\s+/g, '_')}_${viewMode}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsMenuOpen(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/70 dark:hover:bg-gray-900/70 group">
      {/* Decorative gradient blobs for glass effect enhancement */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-80"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-80"></div>

      <div className="p-6 relative z-10">
        <div className="flex flex-col gap-6 mb-8 relative">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-5 flex-grow min-w-0">
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setIsCalendarOpen(prev => !prev)}
                        className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl text-gray-800 dark:text-gray-100 font-bold text-center w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center p-2 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 group/cal"
                        aria-haspopup="true"
                        aria-expanded={isCalendarOpen}
                        aria-label="Change month date"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 rounded-2xl opacity-0 group-hover/cal:opacity-100 transition-opacity"></div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-semibold opacity-70">{monthShort}</span>
                        <span className="text-3xl sm:text-4xl font-black tracking-tighter">{day}</span>
                      </button>
                      {isCalendarOpen && (
                        <Calendar
                            selectedDate={date}
                            onDateChange={(newDate) => {
                                onUpdateMonth({ date: newDate.toISOString() });
                                setIsCalendarOpen(false);
                            }}
                            onClose={() => setIsCalendarOpen(false)}
                        />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      {!isEditing ? (
                          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white tracking-tight truncate drop-shadow-sm">{monthData.name}</h2>
                      ) : (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                              <input 
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="bg-white/50 dark:bg-gray-700/50 border border-white/30 dark:border-gray-600 text-gray-900 dark:text-white text-lg sm:text-xl font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-auto backdrop-blur-sm shadow-inner"
                              />
                              <div className="flex gap-2">
                                  <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 text-sm font-bold transition-all transform hover:scale-105">Save</button>
                                  <button onClick={handleCancel} className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl backdrop-blur-md text-sm font-semibold transition-all">Cancel</button>
                              </div>
                          </div>
                      )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-end gap-3">
                {/* View Toggle Button */}
                 <button
                    onClick={toggleViewMode}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-md border shadow-sm ${
                        viewMode === 'current' 
                        ? 'bg-white/50 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                >
                    <ArrowsRightLeftIcon />
                    <span>{viewMode === 'current' ? 'Current' : 'Projected'}</span>
                </button>

                {/* Admin Menu */}
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/40 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-all shadow-sm"
                        aria-label="Options"
                        aria-expanded={isMenuOpen}
                    >
                        <DotsVerticalIcon />
                    </button>
                    
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 z-50 overflow-hidden ring-1 ring-black/5">
                            <div className="py-1">
                                <button 
                                    onClick={startEditing}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <PencilIcon />
                                    Rename
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsSalaryVisible(!isSalaryVisible);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    {isSalaryVisible ? <EyeOffIcon /> : <EyeIcon />}
                                    {isSalaryVisible ? 'Hide Overall Salary' : 'Show Overall Salary'}
                                </button>
                                <button 
                                    onClick={handleExport}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <DownloadIcon />
                                    Export as Excel
                                </button>
                                {onCloneCard && (
                                    <button 
                                        onClick={() => {
                                            onCloneCard();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <DuplicateIcon />
                                        Clone / Duplicate
                                    </button>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button 
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this month card? This action cannot be undone.')) {
                                            onDeleteCard();
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                >
                                    <TrashIcon />
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {monthData.goals.length > 0 && (
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-between uppercase tracking-wider px-1">
                <span>{viewMode === 'current' ? 'Current Stats' : 'End Project Stats'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                    {viewMode === 'current' ? 'Live' : 'Forecast'}
                </span>
            </h3>
            <GoalsTable 
              goals={monthData.goals} 
              onGoalUpdate={onGoalUpdate} 
              isSalaryVisible={isSalaryVisible} 
              monthId={monthData.id}
              monthDate={monthData.date}
              viewMode={viewMode} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthCard;