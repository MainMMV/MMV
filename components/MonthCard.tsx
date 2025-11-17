import React, { useState } from 'react';
import { MonthData, Goal, GoalStatus } from '../types';
import GoalsTable from './GoalsTable';
import { PencilIcon, EyeIcon, EyeOffIcon, TrashIcon } from './Icons';
import Calendar from './Calendar';

/**
 * Props for the MonthCard component.
 */
interface MonthCardProps {
  monthData: MonthData;
  onGoalUpdate: (monthId: string, goalId: string, updatedValues: Partial<Goal>) => void;
  onUpdateMonth: (updatedValues: Partial<MonthData>) => void;
  onDeleteCard: () => void;
}

/**
 * A card component that displays all information for a single month.
 */
const MonthCard: React.FC<MonthCardProps> = ({ monthData, onGoalUpdate, onUpdateMonth, onDeleteCard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(monthData.name);
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const date = new Date(monthData.date);
  const day = date.getDate();
  const monthShort = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();

  const handleSave = () => {
    onUpdateMonth({ name: editingName });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingName(monthData.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 overflow-hidden backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-grow w-full">
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setIsCalendarOpen(prev => !prev)}
                    className="bg-zinc-200 dark:bg-zinc-700/80 rounded-xl text-zinc-800 dark:text-zinc-100 font-bold text-center w-16 h-16 flex flex-col items-center justify-center p-2 shadow-md hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-800 focus:ring-slate-600"
                    aria-haspopup="true"
                    aria-expanded={isCalendarOpen}
                    aria-label="Change month date"
                  >
                    <span className="text-xs uppercase tracking-wider">{monthShort}</span>
                    <span className="text-3xl font-extrabold">{day}</span>
                  </button>
                  {isCalendarOpen && (
                    <Calendar
                        selectedDate={date}
                        onDateChange={(newDate) => {
                            onUpdateMonth({ date: newDate.toISOString() });
                            setIsCalendarOpen(false);
                        }}
                        // FIX: Added missing 'onClose' prop to handle closing the calendar from outside.
                        onClose={() => setIsCalendarOpen(false)}
                    />
                  )}
                </div>
                <div className="flex-grow">
                  {!isEditing ? (
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{monthData.name}</h2>
                  ) : (
                      <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white text-xl font-bold rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-600 w-full"
                          />
                          <button onClick={handleSave} className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-semibold">Save</button>
                          <button onClick={handleCancel} className="px-3 py-1 bg-zinc-500 dark:bg-zinc-600 text-white rounded-md hover:bg-zinc-600 dark:hover:bg-zinc-700 text-sm">Cancel</button>
                      </div>
                  )}
                </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 self-end sm:self-auto">
                <button 
                    onClick={() => setIsEditing(true)} 
                    disabled={isEditing}
                    className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:text-zinc-800 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Edit month name"
                >
                    <PencilIcon />
                </button>
                
                <button 
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this month card? This action cannot be undone.')) {
                            onDeleteCard();
                        }
                    }}
                    className="p-2 rounded-md hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                    aria-label="Delete month card"
                >
                    <TrashIcon />
                </button>

                <button 
                    onClick={() => setIsSalaryVisible(!isSalaryVisible)}
                    className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:text-zinc-800 dark:hover:text-white transition-colors"
                    aria-label={isSalaryVisible ? "Hide salary summary" : "Show salary summary"}
                >
                    {isSalaryVisible ? <EyeOffIcon/> : <EyeIcon/>}
                </button>
            </div>
        </div>

        {monthData.goals.length > 0 && (
          <div>
             <h3 className="text-lg font-semibold text-zinc-600 dark:text-zinc-300 mb-3">Goal Progress</h3>
            <GoalsTable 
              goals={monthData.goals} 
              onGoalUpdate={onGoalUpdate} 
              isSalaryVisible={isSalaryVisible} 
              monthId={monthData.id}
              monthDate={monthData.date} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthCard;