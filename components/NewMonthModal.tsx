
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons';

interface NewMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMonth: (year: number, monthIndex: number) => void;
  existingMonths: Set<string>; // Format "YYYY-M" e.g. "2025-0" for Jan 2025
}

const NewMonthModal: React.FC<NewMonthModalProps> = ({ isOpen, onClose, onSelectMonth, existingMonths }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  if (!isOpen) return null;

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create New Month</h3>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                <CloseIcon />
            </button>
        </div>
        
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors">
                    <ChevronLeftIcon />
                </button>
                <span className="text-xl font-bold text-zinc-900 dark:text-white">{year}</span>
                <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors">
                    <ChevronRightIcon />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {months.map((month, index) => {
                    const isExists = existingMonths.has(`${year}-${index}`);
                    return (
                        <button
                            key={month}
                            onClick={() => !isExists && onSelectMonth(year, index)}
                            disabled={isExists}
                            className={`
                                py-3 px-2 rounded-xl text-sm font-medium transition-all
                                ${isExists 
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-700/50 opacity-60' 
                                    : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-md border border-zinc-200 dark:border-zinc-600 active:scale-95'
                                }
                            `}
                        >
                            {month.slice(0, 3)}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewMonthModal;
