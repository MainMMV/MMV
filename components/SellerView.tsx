
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Seller } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon, CalendarIcon } from './Icons';
import Calendar from './Calendar';

interface SellerViewProps {
  sellers: Seller[];
  onUpdate: (id: string, updatedValues: Partial<Seller>) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onBulkUpdate: (updatedSellers: Seller[]) => void;
}

const SellerView: React.FC<SellerViewProps> = ({ sellers, onUpdate, onAdd, onDelete }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1); // Default to yesterday
    return d;
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar on click outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
              setIsCalendarOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
  };

  // Projection Logic
  const dateMetrics = useMemo(() => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      // Assume "days passed" includes the selected day. 
      const daysPassed = selectedDate.getDate();
      const timeProgress = daysPassed / daysInMonth;
      
      return { daysPassed, daysInMonth, timeProgress };
  }, [selectedDate]);

  const getMetrics = (fact: number, plan: number) => {
      const pct = plan > 0 ? (fact / plan) * 100 : 0;
      const proj = dateMetrics.daysPassed > 0 ? (fact / dateMetrics.daysPassed) * dateMetrics.daysInMonth : 0;
      // Pace: 100% means exactly on track to hit 100% of plan by end of month based on time passed
      const pace = dateMetrics.timeProgress > 0 ? (pct / (dateMetrics.timeProgress * 100)) * 100 : 0;
      const left = Math.max(0, plan - fact);
      return { pct, proj, pace, left };
  };

  const handleInputChange = (id: string, field: keyof Seller, value: string) => {
      if (field === 'name') {
          onUpdate(id, { name: value });
      } else {
          // Remove spaces/commas for number parsing if user types formatted numbers
          const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(numericValue)) {
              onUpdate(id, { [field]: numericValue });
          } else if (value === '') {
              onUpdate(id, { [field]: 0 });
          }
      }
  };

  const handleExport = () => {
    const headers = [
        "Consultant", 
        "Total Fact", "Total Plan", "Total %", "Total Pace", "Left", "Total Proj", 
        "Bonus", 
        "CE Fact", "CE Plan", "CE %", "CE Pace", "CE Proj",
        "TC Fact", "TC Plan", "TC %", "TC Pace", "TC Proj"
    ];
    
    const rows = sellers.map(s => {
        const total = getMetrics(s.totalFact, s.totalPlan);
        const ce = getMetrics(s.ceFact, s.cePlan);
        const tc = getMetrics(s.tcFact, s.tcPlan);
        
        return [
            `"${s.name}"`,
            s.totalFact, s.totalPlan, total.pct.toFixed(2) + '%', total.pace.toFixed(0) + '%', total.left, total.proj.toFixed(0),
            s.bonus,
            s.ceFact, s.cePlan, ce.pct.toFixed(2) + '%', ce.pace.toFixed(0) + '%', ce.proj.toFixed(0),
            s.tcFact, s.tcPlan, tc.pct.toFixed(2) + '%', tc.pace.toFixed(0) + '%', tc.proj.toFixed(0)
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sellers_performance_${selectedDate.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Column Totals
  const totals = useMemo(() => sellers.reduce((acc, curr) => {
      acc.totalFact += curr.totalFact;
      acc.totalPlan += curr.totalPlan;
      acc.bonus += curr.bonus;
      acc.ceFact += curr.ceFact;
      acc.cePlan += curr.cePlan;
      acc.tcFact += curr.tcFact;
      acc.tcPlan += curr.tcPlan;
      
      const t = getMetrics(curr.totalFact, curr.totalPlan);
      acc.totalProjected += t.proj;
      acc.totalRemainder += t.left;

      const c = getMetrics(curr.ceFact, curr.cePlan);
      acc.ceProjected += c.proj;

      const tcMetrics = getMetrics(curr.tcFact, curr.tcPlan);
      acc.tcProjected += tcMetrics.proj;

      return acc;
  }, { 
      totalFact: 0, totalPlan: 0, totalProjected: 0, totalRemainder: 0, 
      bonus: 0, 
      ceFact: 0, cePlan: 0, ceProjected: 0,
      tcFact: 0, tcPlan: 0, tcProjected: 0
  }), [sellers, dateMetrics]);

  const formattedDate = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Styles for fixed widths to ensure stickiness works well
  const cellClass = "px-2 py-2 text-right border-l border-gray-200 dark:border-gray-700 min-w-[90px]";
  const inputClass = "w-full text-right bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none py-1";

  return (
    <div className="animate-fade-in pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Seller Performance</h2>
                <p className="text-gray-500 dark:text-gray-400">Advanced projection and pacing analysis.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                 <div className="relative w-full sm:w-auto" ref={calendarRef}>
                    <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm shadow-sm"
                    >
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span>{formattedDate}</span>
                    </button>
                    {isCalendarOpen && (
                        <Calendar 
                            selectedDate={selectedDate} 
                            onDateChange={(date) => {
                                setSelectedDate(date);
                                setIsCalendarOpen(false);
                            }} 
                            onClose={() => setIsCalendarOpen(false)}
                            align="right"
                        />
                    )}
                 </div>

                 <button 
                    onClick={handleExport}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                    <DownloadIcon />
                    <span>Export</span>
                </button>
                <button 
                    onClick={onAdd}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-md shadow-emerald-500/20"
                >
                    <PlusIcon />
                    <span>Add</span>
                </button>
            </div>
        </div>

        {/* Responsive Table Container */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-700/50 shadow-xl overflow-hidden relative">
            <div className="overflow-x-auto max-w-full">
                <table className="text-sm text-left border-collapse table-fixed w-max">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th scope="col" className="p-3 sticky left-0 z-20 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-[180px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Consultant</th>
                            
                            {/* Total Group */}
                            <th scope="col" className="px-2 py-3 text-center bg-emerald-50/50 dark:bg-emerald-900/10 min-w-[100px] border-l border-gray-200 dark:border-gray-700">Total Fact</th>
                            <th scope="col" className="px-2 py-3 text-center bg-emerald-50/50 dark:bg-emerald-900/10 min-w-[100px]">Total Plan</th>
                            <th scope="col" className="px-2 py-3 text-center bg-emerald-50/50 dark:bg-emerald-900/10 min-w-[60px]">%</th>
                            <th scope="col" className="px-2 py-3 text-center bg-emerald-50/50 dark:bg-emerald-900/10 min-w-[60px]" title="Pace vs Time">Pace</th>
                            <th scope="col" className="px-2 py-3 text-center bg-emerald-50/50 dark:bg-emerald-900/10 text-rose-500 min-w-[90px]">Left</th>
                            <th scope="col" className="px-2 py-3 text-center bg-emerald-50/50 dark:bg-emerald-900/10 text-indigo-500 min-w-[100px]">Projected</th>
                            
                            <th scope="col" className="px-2 py-3 text-center bg-yellow-50/50 dark:bg-yellow-900/10 border-l border-r border-gray-200 dark:border-gray-700 min-w-[90px]">Bonus</th>
                            
                            {/* CE Group */}
                            <th scope="col" className="px-2 py-3 text-center text-blue-600 dark:text-blue-400 min-w-[90px]">CE Fact</th>
                            <th scope="col" className="px-2 py-3 text-center text-blue-600 dark:text-blue-400 min-w-[90px]">CE Plan</th>
                            <th scope="col" className="px-2 py-3 text-center text-blue-600 dark:text-blue-400 min-w-[60px]">%</th>
                            <th scope="col" className="px-2 py-3 text-center text-blue-600 dark:text-blue-400 min-w-[60px]">Pace</th>
                            <th scope="col" className="px-2 py-3 text-center text-blue-600 dark:text-blue-400 min-w-[90px] border-r border-gray-200 dark:border-gray-700">Proj</th>
                            
                            {/* TC Group */}
                            <th scope="col" className="px-2 py-3 text-center text-purple-600 dark:text-purple-400 min-w-[90px]">TC Fact</th>
                            <th scope="col" className="px-2 py-3 text-center text-purple-600 dark:text-purple-400 min-w-[90px]">TC Plan</th>
                            <th scope="col" className="px-2 py-3 text-center text-purple-600 dark:text-purple-400 min-w-[60px]">%</th>
                            <th scope="col" className="px-2 py-3 text-center text-purple-600 dark:text-purple-400 min-w-[60px]">Pace</th>
                            <th scope="col" className="px-2 py-3 text-center text-purple-600 dark:text-purple-400 min-w-[90px]">Proj</th>

                            <th scope="col" className="px-2 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sellers.map((seller) => {
                            const total = getMetrics(seller.totalFact, seller.totalPlan);
                            const ce = getMetrics(seller.ceFact, seller.cePlan);
                            const tc = getMetrics(seller.tcFact, seller.tcPlan);
                            
                            const getPaceColor = (pace: number) => {
                                if (pace >= 100) return 'text-emerald-500 font-bold';
                                if (pace >= 90) return 'text-amber-500 font-medium';
                                return 'text-rose-500';
                            };

                            return (
                                <tr key={seller.id} className="hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors group">
                                    <td className="p-2 sticky left-0 z-10 bg-white/95 dark:bg-gray-900/95 group-hover:bg-gray-50/95 dark:group-hover:bg-gray-800/95 border-r border-gray-200 dark:border-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                        <input 
                                            type="text" 
                                            value={seller.name}
                                            onChange={(e) => handleInputChange(seller.id, 'name', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-gray-900 dark:text-white font-bold py-1 truncate"
                                            placeholder="Name"
                                        />
                                    </td>
                                    
                                    {/* Total */}
                                    <td className={`${cellClass} bg-emerald-50/20 dark:bg-emerald-900/5`}>
                                        <input type="text" value={formatCurrency(seller.totalFact)} onChange={(e) => handleInputChange(seller.id, 'totalFact', e.target.value)} className={inputClass} />
                                    </td>
                                    <td className={`${cellClass} bg-emerald-50/20 dark:bg-emerald-900/5`}>
                                        <input type="text" value={formatCurrency(seller.totalPlan)} onChange={(e) => handleInputChange(seller.id, 'totalPlan', e.target.value)} className={`${inputClass} text-gray-500 dark:text-gray-400`} />
                                    </td>
                                    <td className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-900/5">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${total.pct >= 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{total.pct.toFixed(0)}%</span>
                                    </td>
                                    <td className={`px-2 py-2 text-center text-xs bg-emerald-50/20 dark:bg-emerald-900/5 ${getPaceColor(total.pace)}`}>
                                        {total.pace.toFixed(0)}%
                                    </td>
                                    <td className="px-2 py-2 text-right font-mono text-xs text-rose-500 bg-emerald-50/20 dark:bg-emerald-900/5">
                                        {total.left > 0 ? formatCurrency(total.left) : <span className="text-emerald-500">✓</span>}
                                    </td>
                                    <td className="px-2 py-2 text-right font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-emerald-50/20 dark:bg-emerald-900/5">
                                        {formatCurrency(total.proj)}
                                    </td>

                                    {/* Bonus */}
                                    <td className="px-2 py-2 text-right font-mono text-amber-600 dark:text-amber-400 bg-yellow-50/20 dark:bg-yellow-900/5 border-l border-r border-gray-200 dark:border-gray-700">
                                         <input type="text" value={formatCurrency(seller.bonus)} onChange={(e) => handleInputChange(seller.id, 'bonus', e.target.value)} className={inputClass} />
                                    </td>

                                    {/* CE */}
                                    <td className={cellClass}>
                                         <input type="text" value={formatCurrency(seller.ceFact)} onChange={(e) => handleInputChange(seller.id, 'ceFact', e.target.value)} className={inputClass} />
                                    </td>
                                    <td className={cellClass}>
                                         <input type="text" value={formatCurrency(seller.cePlan)} onChange={(e) => handleInputChange(seller.id, 'cePlan', e.target.value)} className={`${inputClass} text-gray-400`} />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className={`text-xs font-medium ${ce.pct >= 100 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>{ce.pct.toFixed(0)}%</span>
                                    </td>
                                    <td className={`px-2 py-2 text-center text-xs ${getPaceColor(ce.pace)}`}>{ce.pace.toFixed(0)}%</td>
                                    <td className="px-2 py-2 text-right font-mono text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                                        {formatCurrency(ce.proj)}
                                    </td>

                                    {/* TC */}
                                    <td className={cellClass}>
                                         <input type="text" value={formatCurrency(seller.tcFact)} onChange={(e) => handleInputChange(seller.id, 'tcFact', e.target.value)} className={inputClass} />
                                    </td>
                                    <td className={cellClass}>
                                         <input type="text" value={formatCurrency(seller.tcPlan)} onChange={(e) => handleInputChange(seller.id, 'tcPlan', e.target.value)} className={`${inputClass} text-gray-400`} />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className={`text-xs font-medium ${tc.pct >= 100 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>{tc.pct.toFixed(0)}%</span>
                                    </td>
                                    <td className={`px-2 py-2 text-center text-xs ${getPaceColor(tc.pace)}`}>{tc.pace.toFixed(0)}%</td>
                                    <td className="px-2 py-2 text-right font-mono text-xs text-gray-500 dark:text-gray-400">
                                        {formatCurrency(tc.proj)}
                                    </td>

                                    <td className="px-2 py-2 text-center">
                                        <button onClick={() => onDelete(seller.id)} className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-400 dark:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"><TrashIcon className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100/90 dark:bg-gray-800/90 font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 sticky bottom-0 shadow-inner z-20">
                        <tr>
                            <td className="p-3 sticky left-0 z-20 bg-gray-100/95 dark:bg-gray-800/95 border-r border-gray-200 dark:border-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">Summary</td>
                            <td className="px-2 py-3 text-right">{formatCurrency(totals.totalFact)}</td>
                            <td className="px-2 py-3 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.totalPlan)}</td>
                            <td className="px-2 py-3 text-center text-emerald-600 dark:text-emerald-400">
                                {totals.totalPlan > 0 ? ((totals.totalFact / totals.totalPlan) * 100).toFixed(0) : 0}%
                            </td>
                            <td className="px-2 py-3 text-center">-</td>
                            <td className="px-2 py-3 text-right text-rose-500 text-xs">{formatCurrency(totals.totalRemainder)}</td>
                            <td className="px-2 py-3 text-right text-indigo-500 text-xs">{formatCurrency(totals.totalProjected)}</td>
                            
                            <td className="px-2 py-3 text-right text-amber-600 dark:text-amber-400 border-l border-r border-gray-200 dark:border-gray-700">
                                {formatCurrency(totals.bonus)}
                            </td>
                            <td className="px-2 py-3 text-right">{formatCurrency(totals.ceFact)}</td>
                            <td className="px-2 py-3 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.cePlan)}</td>
                            <td className="px-2 py-3 text-center text-blue-600 dark:text-blue-400">
                                {totals.cePlan > 0 ? ((totals.ceFact / totals.cePlan) * 100).toFixed(0) : 0}%
                            </td>
                            <td className="px-2 py-3 text-center">-</td>
                            <td className="px-2 py-3 text-right text-gray-500 text-xs border-r border-gray-200 dark:border-gray-700">{formatCurrency(totals.ceProjected)}</td>

                            <td className="px-2 py-3 text-right">{formatCurrency(totals.tcFact)}</td>
                            <td className="px-2 py-3 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.tcPlan)}</td>
                            <td className="px-2 py-3 text-center text-purple-600 dark:text-purple-400">
                                {totals.tcPlan > 0 ? ((totals.tcFact / totals.tcPlan) * 100).toFixed(0) : 0}%
                            </td>
                            <td className="px-2 py-3 text-center">-</td>
                            <td className="px-2 py-3 text-right text-gray-500 text-xs">{formatCurrency(totals.tcProjected)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
  );
};

export default SellerView;
