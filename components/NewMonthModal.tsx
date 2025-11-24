import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons';

interface NewMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMonth: (year: number, monthIndex: number) => void;
  existingMonths: Set<string>; // Format "YYYY-M" e.g. "2025-0" for Jan 2025
}

const NewMonthModal: React.FC<NewMonthModalProps> = ({ isOpen, onClose, onSelectMonth, existingMonths }) => {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const modalRef = useRef<HTMLDivElement>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Reset year when opening
  useEffect(() => {
    if (isOpen) {
      setViewYear(new Date().getFullYear());
    }
  }, [isOpen]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
              onClose();
          }
      };

      if (isOpen) {
          document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  const changeYear = (delta: number) => {
    setViewYear(prev => prev + delta);
  };

  const handleMonthClick = (monthIndex: number) => {
    // The existingMonths set format is "YYYY-M"
    if (existingMonths.has(`${viewYear}-${monthIndex}`)) {
       // If month already exists, we do not allow creating it again to avoid duplication confusion
       return;
    }
    onSelectMonth(viewYear, monthIndex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Month</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                <CloseIcon />
            </button>
        </div>

        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => changeYear(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                    <ChevronLeftIcon />
                </button>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{viewYear}</span>
                <button onClick={() => changeYear(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                    <ChevronRightIcon />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {months.map((month, index) => {
                    const isExisting = existingMonths.has(`${viewYear}-${index}`);
                    return (
                        <button
                            key={month}
                            onClick={() => !isExisting && handleMonthClick(index)}
                            disabled={isExisting}
                            className={`
                                py-3 px-2 rounded-xl text-sm font-medium transition-all relative
                                ${isExisting 
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent' 
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md border border-gray-200 dark:border-gray-600'
                                }
                            `}
                        >
                            {month}
                            {isExisting && <span className="absolute bottom-1 left-0 right-0 text-[9px] text-center font-normal opacity-70">Added</span>}
                        </button>
                    );
                })}
            </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900/30 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50">
            Select a month to create a new tracking card.
        </div>
      </div>
    </div>
  );
};

export default NewMonthModal;