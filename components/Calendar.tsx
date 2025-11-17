import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

/**
 * Props for the Calendar component.
 */
interface CalendarProps {
  selectedDate: Date; // The currently selected date.
  onDateChange: (date: Date) => void; // Callback function when a new date is selected.
  onClose: () => void;
  align?: 'left' | 'right';
}

// English localization data for the calendar display.
const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthNamesShortEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
// Changed to start with Saturday
const daysOfWeekEn = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

type CalendarView = 'days' | 'months' | 'years';

/**
 * A full-featured calendar component that allows users to select a date.
 * It supports navigating through days, months, and years with a modern, popover-style UI.
 */
const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, onClose, align = 'left' }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [currentView, setCurrentView] = useState<CalendarView>('days');
  const [yearPage, setYearPage] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handlers for selecting a date/month/year.
  const handleDayClick = (day: number) => onDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  const handleMonthClick = (monthIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setCurrentView('days');
  };
  const handleYearClick = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setCurrentView('months');
  };

  // Handlers for navigating between views.
  const changeMonth = (delta: number) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));

  const renderDaysView = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Adjust first day of month to be Saturday=0
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 1) % 7;
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`flex items-center justify-center h-9 w-9 rounded-full cursor-pointer transition-colors text-sm ${
            isSelected ? 'bg-slate-600 text-white font-bold' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {day}
        </button>
      );
    }
    return (
      <>
        <div className="flex justify-between items-center px-4 py-2 text-zinc-800 dark:text-zinc-200">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700">
            <ChevronLeftIcon />
          </button>
          <div className="flex items-center gap-1 font-semibold">
            <button onClick={() => setCurrentView('months')} className="hover:text-slate-500 px-1 rounded-md">{monthNamesEn[viewDate.getMonth()]}</button>
            <button onClick={() => setCurrentView('years')} className="hover:text-slate-500 px-1 rounded-md">{viewDate.getFullYear()}</button>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700">
            <ChevronRightIcon />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-400 my-2 px-2">
          {daysOfWeekEn.map(day => <div key={day}>{day.slice(0, 2)}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center px-2">
          {days}
        </div>
      </>
    );
  };
  
  const renderMonthsView = () => (
    <>
      <div className="text-center font-semibold p-2">{viewDate.getFullYear()}</div>
      <div className="grid grid-cols-3 gap-2 p-4">
        {monthNamesShortEn.map((month, index) => (
          <button
            key={month}
            onClick={() => handleMonthClick(index)}
            className={`p-4 rounded-md text-sm font-semibold transition-colors ${
              viewDate.getMonth() === index ? 'bg-slate-600 text-white' : 'bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            {month}
          </button>
        ))}
      </div>
    </>
  );

  const renderYearsView = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = (Math.floor((currentYear - 2020) / 21)) * 21 + 2020 + (yearPage * 21);
    const years = Array.from({ length: 21 }, (_, i) => startYear + i);
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setYearPage(p => p - 1)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"><ChevronLeftIcon /></button>
          <span className="font-semibold text-sm">{years[0]} - {years[20]}</span>
          <button onClick={() => setYearPage(p => p + 1)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"><ChevronRightIcon /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map(year => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`py-2 px-1 rounded-md text-sm font-semibold transition-colors ${
                currentYear === year ? 'bg-slate-600 text-white' : 'bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'months': return renderMonthsView();
      case 'years': return renderYearsView();
      case 'days': default: return renderDaysView();
    }
  };

  const selectedDay = selectedDate.getDate();
  const selectedMonthShort = selectedDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const viewMonthLong = viewDate.toLocaleString('en-US', { month: 'long' });
  const viewYear = viewDate.getFullYear();
  
  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={calendarRef} className={`absolute z-40 top-full ${alignmentClass} mt-2 bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-80 border border-zinc-200 dark:border-zinc-700`}>
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0 bg-zinc-200 dark:bg-zinc-900/50 rounded-lg text-zinc-800 dark:text-zinc-100 font-bold text-center w-16 h-16 flex flex-col items-center justify-center p-2 shadow-inner">
            <span className="text-xs uppercase tracking-wider">{selectedMonthShort}</span>
            <span className="text-2xl font-extrabold">{selectedDay}</span>
        </div>
        <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{viewMonthLong} {viewYear}</h3>
        </div>
      </div>
      <div className="py-2 border-t border-zinc-200 dark:border-zinc-700">
        {renderContent()}
      </div>
      <div className="p-2 text-right border-t border-zinc-200 dark:border-zinc-700">
        <button onClick={onClose} className="font-semibold text-slate-500 hover:bg-slate-500/10 px-3 py-2 rounded-md text-sm">
          Close
        </button>
      </div>
    </div>
  );
};

export default Calendar;