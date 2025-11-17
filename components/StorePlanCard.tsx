import React, { useState, useMemo, useEffect } from 'react';
import { StorePlan } from '../types';
import PieChart from './PieChart';

interface StorePlanCardProps {
  planData: StorePlan;
  onUpdate: (updatedValues: Partial<StorePlan>) => void;
  currentDate: Date;
  cardIndex: number;
}

const StorePlanCard: React.FC<StorePlanCardProps> = ({ planData, onUpdate, currentDate, cardIndex }) => {
  const [editingPlan, setEditingPlan] = useState(planData.plan100.toString());
  const [editingActual, setEditingActual] = useState(planData.actualSum.toString());

  useEffect(() => {
    setEditingPlan(planData.plan100.toString());
  }, [planData.plan100]);
  
  useEffect(() => {
    setEditingActual(planData.actualSum.toString());
  }, [planData.actualSum]);

  const dateInfo = useMemo(() => {
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
  }, [currentDate, cardIndex]);

  const formatNumber = (value: number, decimals = 0) => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };
  
  const handleBlur = (field: 'plan100' | 'actualSum') => {
    const value = field === 'plan100' ? editingPlan : editingActual;
    const numericValue = parseInt(value.replace(/,/g, ''), 10);
    if (!isNaN(numericValue)) {
      onUpdate({ [field]: numericValue });
    }
  };
  
  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  }

  const renderRow = (label: string, planValue: number) => {
    const isPlanEditable = label === 'To 100%';
    const isActualEditable = label === 'To 100%';

    const actualPercent = planValue > 0 ? (planData.actualSum / planValue) * 100 : 0;
    const tempPercent = dateInfo.daysPassed > 0 && dateInfo.daysInPeriod > 0 ? actualPercent / (dateInfo.daysPassed / dateInfo.daysInPeriod) : 0;
    const remainder = planValue - planData.actualSum;
    const daily = dateInfo.daysRemaining > 0 ? remainder / dateInfo.daysRemaining : 0;

    return (
      <tr className="border-b border-zinc-200 dark:border-zinc-700">
        <td className="px-2 py-2 whitespace-nowrap">{label}</td>
        <td className="px-2 py-2 whitespace-nowrap text-red-500 font-bold text-right">
          {isPlanEditable ? (
             <input
                type="text"
                value={formatNumber(Number(editingPlan))}
                onChange={(e) => handleChange(setEditingPlan, e.target.value)}
                onBlur={() => handleBlur('plan100')}
                className="w-full bg-transparent text-right focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-md p-1"
              />
          ) : formatNumber(planValue)}
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-right">
          {isActualEditable ? (
             <input
                type="text"
                value={formatNumber(Number(editingActual))}
                onChange={(e) => handleChange(setEditingActual, e.target.value)}
                onBlur={() => handleBlur('actualSum')}
                className="w-full bg-transparent text-right focus:outline-none focus:ring-1 focus:ring-amber-500 rounded-md p-1"
              />
          ) : formatNumber(planData.actualSum)}
        </td>
        <td className="px-2 py-2">
            <div className="flex justify-center">
                <PieChart percentage={actualPercent} />
            </div>
        </td>
        <td className="px-2 py-2">
            <div className="flex justify-center">
                <PieChart percentage={tempPercent} />
            </div>
        </td>
        <td className="px-2 py-2 whitespace-nowrap text-red-500 font-bold text-right">{formatNumber(remainder)}</td>
        <td className="px-2 py-2 whitespace-nowrap text-right">{formatNumber(daily)}</td>
      </tr>
    );
  };

  const plan90 = planData.plan100 * 0.9;
  const plan80 = planData.plan100 * 0.8;

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-zinc-600 dark:text-zinc-300 table-fixed">
                <thead className="text-xs text-white uppercase bg-zinc-600 dark:bg-zinc-700">
                    <tr>
                        <th scope="col" className="px-2 py-2 w-48">{planData.name}</th>
                        <th scope="col" className="px-2 py-2 text-right w-44">Plan</th>
                        <th scope="col" className="px-2 py-2 text-right w-44">Total Sum</th>
                        <th scope="col" className="px-2 py-2 text-center w-28">Total %</th>
                        <th scope="col" className="px-2 py-2 text-center w-28">Temp %</th>
                        <th scope="col" className="px-2 py-2 text-right w-44">Remainder</th>
                        <th scope="col" className="px-2 py-2 text-right w-44">Daily</th>
                    </tr>
                </thead>
                <tbody>
                    {renderRow('To 100%', planData.plan100)}
                    {renderRow('To 90%', plan90)}
                    {renderRow('To 80%', plan80)}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StorePlanCard;