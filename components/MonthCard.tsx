import React, { useState, useRef, useEffect } from 'react';
import { MonthData, Goal } from '../types';
import GoalsTable from './GoalsTable';
import { PencilIcon, EyeIcon, EyeOffIcon, TrashIcon, DotsVerticalIcon, DuplicateIcon, ArrowsRightLeftIcon, CalendarIcon } from './Icons';
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

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 overflow-hidden backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative">
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
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* View Toggle Button */}
                 <button
                    onClick={toggleViewMode}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        viewMode === 'current' 
                        ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600' 
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                    }`}
                >
                    <ArrowsRightLeftIcon />
                    <span>{viewMode === 'current' ? 'Current' : 'Projected'}</span>
                </button>

                {/* Admin Menu */}
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:text-zinc-800 dark:hover:text-white transition-colors text-zinc-500 dark:text-zinc-400"
                        aria-label="Options"
                        aria-expanded={isMenuOpen}
                    >
                        <DotsVerticalIcon />
                    </button>
                    
                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-20 overflow-hidden">
                            <div className="py-1">
                                <button 
                                    onClick={startEditing}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                                >
                                    <PencilIcon />
                                    Rename
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsSalaryVisible(!isSalaryVisible);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                                >
                                    {isSalaryVisible ? <EyeOffIcon /> : <EyeIcon />}
                                    {isSalaryVisible ? 'Hide Overall Salary' : 'Show Overall Salary'}
                                </button>
                                {onCloneCard && (
                                    <button 
                                        onClick={() => {
                                            onCloneCard();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                                    >
                                        <DuplicateIcon />
                                        Clone / Duplicate
                                    </button>
                                )}
                                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                                <button 
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this month card? This action cannot be undone.')) {
                                            onDeleteCard();
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-semibold"
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
          <div>
            <h3 className="text-lg font-semibold text-zinc-600 dark:text-zinc-300 mb-3 flex items-center justify-between">
                {viewMode === 'current' ? 'Current Stats' : 'End Project Stats'}
                <span className="text-xs font-normal text-zinc-400">
                    {viewMode === 'current' ? 'Real-Time' : 'Projection'}
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