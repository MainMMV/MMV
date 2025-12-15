
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Seller } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon, CalendarIcon, CogIcon, CheckCircleIcon } from './Icons';
import Calendar from './Calendar';

interface SellerViewProps {
  sellers: Seller[];
  onUpdate: (id: string, updatedValues: Partial<Seller>) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onBulkUpdate: (updatedSellers: Seller[]) => void;
}

const SellerView: React.FC<SellerViewProps> = ({ sellers, onUpdate, onAdd, onDelete, onBulkUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1); // Default to yesterday
    return d;
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Plan Distribution State
  const [showPlanSettings, setShowPlanSettings] = useState(false);
  const [teamTotalPlan, setTeamTotalPlan] = useState('');
  const [teamCePlan, setTeamCePlan] = useState('');
  const [teamTcPlan, setTeamTcPlan] = useState('');

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

  // Sync team plan inputs when opening settings
  useEffect(() => {
    if (showPlanSettings) {
        const tPlan = sellers.reduce((sum, s) => sum + s.totalPlan, 0);
        const cPlan = sellers.reduce((sum, s) => sum + s.cePlan, 0);
        const tcPlan = sellers.reduce((sum, s) => sum + s.tcPlan, 0);
        setTeamTotalPlan(tPlan.toString());
        setTeamCePlan(cPlan.toString());
        setTeamTcPlan(tcPlan.toString());
    }
  }, [showPlanSettings, sellers]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatInputNumber = (val: string) => {
      // Remove non-numeric chars and format with commas
      const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
      if (isNaN(num)) return '';
      return num.toLocaleString('en-US');
  };

  const handleTeamPlanChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
      const num = val.replace(/[^0-9]/g, '');
      setter(num);
  };

  const handleDistributePlans = () => {
    const count = sellers.length;
    if (count === 0) return;

    const newTotal = parseInt(teamTotalPlan.replace(/[^0-9]/g, ''), 10) || 0;
    const newCe = parseInt(teamCePlan.replace(/[^0-9]/g, ''), 10) || 0;
    const newTc = parseInt(teamTcPlan.replace(/[^0-9]/g, ''), 10) || 0;

    const perSellerTotal = Math.floor(newTotal / count);
    const perSellerCe = Math.floor(newCe / count);
    const perSellerTc = Math.floor(newTc / count);

    const updatedSellers = sellers.map(s => ({
        ...s,
        totalPlan: perSellerTotal,
        cePlan: perSellerCe,
        tcPlan: perSellerTc
    }));

    onBulkUpdate(updatedSellers);
    setShowPlanSettings(false);
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

  // Update alignment to right side for all numeric columns
  const thClass = "px-0.5 py-1 text-right font-bold text-[9px] sm:text-[10px] leading-tight";
  const tdClass = "px-0.5 py-1 text-right text-[10px] sm:text-[10px]";
  const inputClass = "w-full text-right bg-transparent border-none focus:ring-0 p-0 text-[10px] sm:text-[10px]";

  return (
    <div className="animate-fade-in pb-12 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Seller Performance</h2>
            </div>
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                 <button 
                    onClick={() => setShowPlanSettings(!showPlanSettings)}
                    className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md transition-colors font-semibold text-xs border border-gray-200 dark:border-gray-700 ${showPlanSettings ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    title="Distribute Plans"
                 >
                    <CogIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">Set Plans</span>
                 </button>

                 <div className="relative flex-grow sm:flex-grow-0" ref={calendarRef}>
                    <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-xs shadow-sm"
                    >
                        <CalendarIcon className="w-3 h-3 text-gray-500" />
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
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-xs"
                >
                    <DownloadIcon className="w-3 h-3"/>
                    <span>Export</span>
                </button>
                <button 
                    onClick={onAdd}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-semibold text-xs shadow-md shadow-emerald-500/20"
                >
                    <PlusIcon className="w-3 h-3"/>
                    <span>Add</span>
                </button>
            </div>
        </div>

        {/* Plan Distribution Panel */}
        {showPlanSettings && (
            <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/50 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Team Total Plan</label>
                            <input 
                                type="text" 
                                value={formatInputNumber(teamTotalPlan)}
                                onChange={(e) => handleTeamPlanChange(setTeamTotalPlan, e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm font-mono text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase">Team CE Plan</label>
                            <input 
                                type="text" 
                                value={formatInputNumber(teamCePlan)}
                                onChange={(e) => handleTeamPlanChange(setTeamCePlan, e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm font-mono text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-1 uppercase">Team TC Plan</label>
                            <input 
                                type="text" 
                                value={formatInputNumber(teamTcPlan)}
                                onChange={(e) => handleTeamPlanChange(setTeamTcPlan, e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm font-mono text-right focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleDistributePlans}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap h-[34px]"
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        Distribute to {sellers.length} Sellers
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                    Enter the total target for the entire team. This amount will be divided equally among all {sellers.length} active sellers.
                </p>
            </div>
        )}

        {/* Compact Table Container - Removed overflow-x-auto to force fit */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-lg border border-white/40 dark:border-gray-700/50 shadow-sm w-full">
            <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-100/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    <tr>
                        <th className="p-1 text-left w-[12%] text-[10px] sm:text-[11px] font-bold">Name</th>
                        
                        {/* Total Group */}
                        <th className={`${thClass} bg-emerald-50/50 dark:bg-emerald-900/10 w-[6%]`}>T.Fact</th>
                        <th className={`${thClass} bg-emerald-50/50 dark:bg-emerald-900/10 w-[6%]`}>T.Plan</th>
                        <th className={`${thClass} bg-emerald-50/50 dark:bg-emerald-900/10 w-[4%]`}>%</th>
                        <th className={`${thClass} bg-emerald-50/50 dark:bg-emerald-900/10 w-[4%]`}>Pace</th>
                        <th className={`${thClass} bg-emerald-50/50 dark:bg-emerald-900/10 text-rose-500 w-[5%]`}>Left</th>
                        <th className={`${thClass} bg-emerald-50/50 dark:bg-emerald-900/10 text-indigo-500 w-[6%]`}>Proj</th>
                        
                        <th className={`${thClass} bg-yellow-50/50 dark:bg-yellow-900/10 border-l border-r border-gray-200 dark:border-gray-700 w-[5%]`}>Bonus</th>
                        
                        {/* CE Group */}
                        <th className={`${thClass} text-blue-600 dark:text-blue-400 w-[6%]`}>CE Fact</th>
                        <th className={`${thClass} text-blue-600 dark:text-blue-400 w-[6%]`}>CE Plan</th>
                        <th className={`${thClass} text-blue-600 dark:text-blue-400 w-[4%]`}>%</th>
                        <th className={`${thClass} text-blue-600 dark:text-blue-400 w-[4%]`}>Pace</th>
                        <th className={`${thClass} text-blue-600 dark:text-blue-400 w-[6%] border-r border-gray-200 dark:border-gray-700`}>Proj</th>
                        
                        {/* TC Group */}
                        <th className={`${thClass} text-purple-600 dark:text-purple-400 w-[6%]`}>TC Fact</th>
                        <th className={`${thClass} text-purple-600 dark:text-purple-400 w-[6%]`}>TC Plan</th>
                        <th className={`${thClass} text-purple-600 dark:text-purple-400 w-[4%]`}>%</th>
                        <th className={`${thClass} text-purple-600 dark:text-purple-400 w-[4%]`}>Pace</th>
                        <th className={`${thClass} text-purple-600 dark:text-purple-400 w-[6%]`}>Proj</th>

                        <th className="w-[3%]"></th>
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
                                <td className="p-1 border-r border-gray-100 dark:border-gray-700/50">
                                    <input 
                                        type="text" 
                                        value={seller.name}
                                        onChange={(e) => handleInputChange(seller.id, 'name', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-bold text-[10px] sm:text-xs truncate p-0"
                                        placeholder="Name"
                                    />
                                </td>
                                
                                {/* Total */}
                                <td className={`${tdClass} bg-emerald-50/20 dark:bg-emerald-900/5`}>
                                    <input type="text" value={formatCurrency(seller.totalFact)} onChange={(e) => handleInputChange(seller.id, 'totalFact', e.target.value)} className={inputClass} />
                                </td>
                                <td className={`${tdClass} bg-emerald-50/20 dark:bg-emerald-900/5`}>
                                    <input type="text" value={formatCurrency(seller.totalPlan)} onChange={(e) => handleInputChange(seller.id, 'totalPlan', e.target.value)} className={`${inputClass} font-medium text-gray-700 dark:text-gray-200`} />
                                </td>
                                <td className={`${tdClass} bg-emerald-50/20 dark:bg-emerald-900/5`}>
                                    <span className={`inline-block ${total.pct >= 100 ? 'text-emerald-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>{total.pct.toFixed(0)}</span>
                                </td>
                                <td className={`${tdClass} bg-emerald-50/20 dark:bg-emerald-900/5 ${getPaceColor(total.pace)}`}>
                                    {total.pace.toFixed(0)}
                                </td>
                                <td className={`${tdClass} font-mono text-rose-500 bg-emerald-50/20 dark:bg-emerald-900/5`}>
                                    {total.left > 0 ? formatCurrency(total.left) : <span className="text-emerald-500">✓</span>}
                                </td>
                                <td className={`${tdClass} font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-emerald-50/20 dark:bg-emerald-900/5`}>
                                    {formatCurrency(total.proj)}
                                </td>

                                {/* Bonus */}
                                <td className={`${tdClass} font-mono text-amber-600 dark:text-amber-400 bg-yellow-50/20 dark:bg-yellow-900/5 border-l border-r border-gray-100 dark:border-gray-700/50`}>
                                     <input type="text" value={formatCurrency(seller.bonus)} onChange={(e) => handleInputChange(seller.id, 'bonus', e.target.value)} className={inputClass} />
                                </td>

                                {/* CE */}
                                <td className={tdClass}>
                                     <input type="text" value={formatCurrency(seller.ceFact)} onChange={(e) => handleInputChange(seller.id, 'ceFact', e.target.value)} className={inputClass} />
                                </td>
                                <td className={tdClass}>
                                     <input type="text" value={formatCurrency(seller.cePlan)} onChange={(e) => handleInputChange(seller.id, 'cePlan', e.target.value)} className={`${inputClass} font-medium text-blue-700 dark:text-blue-300`} />
                                </td>
                                <td className={`${tdClass}`}>
                                    <span className={`${ce.pct >= 100 ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500'}`}>{ce.pct.toFixed(0)}</span>
                                </td>
                                <td className={`${tdClass} ${getPaceColor(ce.pace)}`}>{ce.pace.toFixed(0)}</td>
                                <td className={`${tdClass} font-mono text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700/50`}>
                                    {formatCurrency(ce.proj)}
                                </td>

                                {/* TC */}
                                <td className={tdClass}>
                                     <input type="text" value={formatCurrency(seller.tcFact)} onChange={(e) => handleInputChange(seller.id, 'tcFact', e.target.value)} className={inputClass} />
                                </td>
                                <td className={tdClass}>
                                     <input type="text" value={formatCurrency(seller.tcPlan)} onChange={(e) => handleInputChange(seller.id, 'tcPlan', e.target.value)} className={`${inputClass} font-medium text-purple-700 dark:text-purple-300`} />
                                </td>
                                <td className={`${tdClass}`}>
                                    <span className={`${tc.pct >= 100 ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-500'}`}>{tc.pct.toFixed(0)}</span>
                                </td>
                                <td className={`${tdClass} ${getPaceColor(tc.pace)}`}>{tc.pace.toFixed(0)}</td>
                                <td className={`${tdClass} font-mono text-gray-500 dark:text-gray-400`}>
                                    {formatCurrency(tc.proj)}
                                </td>

                                <td className="p-0.5 text-center">
                                    <button onClick={() => onDelete(seller.id)} className="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-400 dark:text-rose-500 opacity-0 group-hover:opacity-100"><TrashIcon className="w-3 h-3" /></button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot className="bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 text-[10px] sm:text-[10px]">
                    <tr>
                        <td className="p-1 border-r border-gray-200 dark:border-gray-700">Summary</td>
                        <td className="px-0.5 py-1 text-right">{formatCurrency(totals.totalFact)}</td>
                        <td className="px-0.5 py-1 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.totalPlan)}</td>
                        <td className="px-0.5 py-1 text-right text-emerald-600 dark:text-emerald-400">
                            {totals.totalPlan > 0 ? ((totals.totalFact / totals.totalPlan) * 100).toFixed(0) : 0}%
                        </td>
                        <td className="px-0.5 py-1 text-right">-</td>
                        <td className="px-0.5 py-1 text-right text-rose-500">{formatCurrency(totals.totalRemainder)}</td>
                        <td className="px-0.5 py-1 text-right text-indigo-500">{formatCurrency(totals.totalProjected)}</td>
                        
                        <td className="px-0.5 py-1 text-right text-amber-600 dark:text-amber-400 border-l border-r border-gray-200 dark:border-gray-700">
                            {formatCurrency(totals.bonus)}
                        </td>
                        <td className="px-0.5 py-1 text-right">{formatCurrency(totals.ceFact)}</td>
                        <td className="px-0.5 py-1 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.cePlan)}</td>
                        <td className="px-0.5 py-1 text-right text-blue-600 dark:text-blue-400">
                            {totals.cePlan > 0 ? ((totals.ceFact / totals.cePlan) * 100).toFixed(0) : 0}%
                        </td>
                        <td className="px-0.5 py-1 text-right">-</td>
                        <td className="px-0.5 py-1 text-right text-gray-500 border-r border-gray-200 dark:border-gray-700">{formatCurrency(totals.ceProjected)}</td>

                        <td className="px-0.5 py-1 text-right">{formatCurrency(totals.tcFact)}</td>
                        <td className="px-0.5 py-1 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.tcPlan)}</td>
                        <td className="px-0.5 py-1 text-right text-purple-600 dark:text-purple-400">
                            {totals.tcPlan > 0 ? ((totals.tcFact / totals.tcPlan) * 100).toFixed(0) : 0}%
                        </td>
                        <td className="px-0.5 py-1 text-right">-</td>
                        <td className="px-0.5 py-1 text-right text-gray-500">{formatCurrency(totals.tcProjected)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
  );
};

export default SellerView;
