import React from 'react';
import { Seller } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon } from './Icons';

interface SellerViewProps {
  sellers: Seller[];
  onUpdate: (id: string, updatedValues: Partial<Seller>) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const SellerView: React.FC<SellerViewProps> = ({ sellers, onUpdate, onAdd, onDelete }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
  };

  const calculatePercentage = (fact: number, plan: number) => {
      if (!plan || plan === 0) return 0;
      return (fact / plan) * 100;
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
        "Total Fact", "Total Plan", "Total %", "Count", "Bonus", 
        "CE Fact", "CE Plan", "CE %", 
        "TC Fact", "TC Plan", "TC %"
    ];
    
    const rows = sellers.map(s => {
        const totalPct = calculatePercentage(s.totalFact, s.totalPlan).toFixed(2) + '%';
        const cePct = calculatePercentage(s.ceFact, s.cePlan).toFixed(2) + '%';
        const tcPct = calculatePercentage(s.tcFact, s.tcPlan).toFixed(2) + '%';
        
        return [
            `"${s.name}"`,
            s.totalFact, s.totalPlan, totalPct, s.totalCount, s.bonus,
            s.ceFact, s.cePlan, cePct,
            s.tcFact, s.tcPlan, tcPct
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sellers_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Column Totals
  const totals = sellers.reduce((acc, curr) => {
      acc.totalFact += curr.totalFact;
      acc.totalPlan += curr.totalPlan;
      acc.totalCount += curr.totalCount;
      acc.bonus += curr.bonus;
      acc.ceFact += curr.ceFact;
      acc.cePlan += curr.cePlan;
      acc.tcFact += curr.tcFact;
      acc.tcPlan += curr.tcPlan;
      return acc;
  }, { totalFact: 0, totalPlan: 0, totalCount: 0, bonus: 0, ceFact: 0, cePlan: 0, tcFact: 0, tcPlan: 0 });

  return (
    <div className="animate-fade-in pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Seller Performance</h2>
                <p className="text-gray-500 dark:text-gray-400">Track individual sales performance against plans.</p>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                    <DownloadIcon />
                    <span>Export</span>
                </button>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-md shadow-emerald-500/20"
                >
                    <PlusIcon />
                    <span>Add Consultant</span>
                </button>
            </div>
        </div>

        {/* Responsive Glass Table Container */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-700/50 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th scope="col" className="px-4 py-4 sticky left-0 z-10 bg-gray-100/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-[1px_0_5px_rgba(0,0,0,0.05)] border-r border-gray-200 dark:border-gray-700">Consultant Name</th>
                            
                            {/* Total Section */}
                            <th scope="col" className="px-2 py-4 text-center border-l border-gray-200 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/10">Total Actual</th>
                            <th scope="col" className="px-2 py-4 text-center bg-emerald-50/50 dark:bg-emerald-900/10">Total Plan</th>
                            <th scope="col" className="px-2 py-4 text-center bg-emerald-50/50 dark:bg-emerald-900/10">Qty</th>
                            <th scope="col" className="px-2 py-4 text-center bg-emerald-50/50 dark:bg-emerald-900/10">% Done</th>
                            <th scope="col" className="px-2 py-4 text-center bg-yellow-50/50 dark:bg-yellow-900/10 border-l border-r border-gray-200 dark:border-gray-700">Bonus</th>
                            
                            {/* CE Section */}
                            <th scope="col" className="px-2 py-4 text-center text-blue-600 dark:text-blue-400">CE Actual</th>
                            <th scope="col" className="px-2 py-4 text-center text-blue-600 dark:text-blue-400">CE Plan</th>
                            <th scope="col" className="px-2 py-4 text-center text-blue-600 dark:text-blue-400 border-r border-gray-200 dark:border-gray-700">CE %</th>
                            
                            {/* TC Section */}
                            <th scope="col" className="px-2 py-4 text-center text-purple-600 dark:text-purple-400">TC Actual</th>
                            <th scope="col" className="px-2 py-4 text-center text-purple-600 dark:text-purple-400">TC Plan</th>
                            <th scope="col" className="px-2 py-4 text-center text-purple-600 dark:text-purple-400">TC %</th>

                            <th scope="col" className="px-2 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sellers.map((seller) => {
                            const totalPct = calculatePercentage(seller.totalFact, seller.totalPlan);
                            const cePct = calculatePercentage(seller.ceFact, seller.cePlan);
                            const tcPct = calculatePercentage(seller.tcFact, seller.tcPlan);
                            
                            return (
                                <tr key={seller.id} className="hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors group">
                                    <td className="px-4 py-2 sticky left-0 z-10 bg-white/90 dark:bg-gray-900/90 group-hover:bg-gray-50/90 dark:group-hover:bg-gray-800/90 border-r border-gray-200 dark:border-gray-700 shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
                                        <input 
                                            type="text" 
                                            value={seller.name}
                                            onChange={(e) => handleInputChange(seller.id, 'name', e.target.value)}
                                            className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-gray-900 dark:text-white font-semibold py-1"
                                        />
                                    </td>
                                    
                                    {/* Total Fields */}
                                    <td className="px-2 py-2 text-right font-mono font-bold text-gray-800 dark:text-gray-200 border-l border-gray-200 dark:border-gray-700 bg-emerald-50/20 dark:bg-emerald-900/5">
                                        <input 
                                            type="text" 
                                            value={formatCurrency(seller.totalFact)}
                                            onChange={(e) => handleInputChange(seller.id, 'totalFact', e.target.value)}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none py-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-right bg-emerald-50/20 dark:bg-emerald-900/5">
                                        <input 
                                            type="text" 
                                            value={formatCurrency(seller.totalPlan)}
                                            onChange={(e) => handleInputChange(seller.id, 'totalPlan', e.target.value)}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-gray-500 dark:text-gray-400 py-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-900/5">
                                        <input 
                                            type="text" 
                                            value={seller.totalCount}
                                            onChange={(e) => handleInputChange(seller.id, 'totalCount', e.target.value)}
                                            className="w-16 text-center mx-auto bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-gray-600 dark:text-gray-300 py-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center bg-emerald-50/20 dark:bg-emerald-900/5">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${totalPct >= 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                            {totalPct.toFixed(1)}%
                                        </span>
                                    </td>

                                    {/* Bonus */}
                                    <td className="px-2 py-2 text-right font-mono text-amber-600 dark:text-amber-400 bg-yellow-50/20 dark:bg-yellow-900/5 border-l border-r border-gray-200 dark:border-gray-700">
                                         <input 
                                            type="text" 
                                            value={formatCurrency(seller.bonus)}
                                            onChange={(e) => handleInputChange(seller.id, 'bonus', e.target.value)}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-amber-500 focus:outline-none py-1"
                                        />
                                    </td>

                                    {/* CE Fields */}
                                    <td className="px-2 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                                         <input 
                                            type="text" 
                                            value={formatCurrency(seller.ceFact)}
                                            onChange={(e) => handleInputChange(seller.id, 'ceFact', e.target.value)}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none py-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-right font-mono text-gray-400">
                                         <input 
                                            type="text" 
                                            value={formatCurrency(seller.cePlan)}
                                            onChange={(e) => handleInputChange(seller.id, 'cePlan', e.target.value)}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none py-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700">
                                        <span className={`text-xs font-medium ${cePct >= 100 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                            {cePct.toFixed(0)}%
                                        </span>
                                    </td>

                                    {/* TC Fields */}
                                    <td className="px-2 py-2 text-right font-mono text-gray-700 dark:text-gray-300">
                                         <input 
                                            type="text" 
                                            value={formatCurrency(seller.tcFact)}
                                            onChange={(e) => handleInputChange(seller.id, 'tcFact', e.target.value)}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-purple-500 focus:outline-none py-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-right font-mono text-gray-400">
                                         <input 
                                            type="text" 
                                            value={formatCurrency(seller.tcPlan)}
                                            onChange={(e) => handleInputChange(seller.id, 'tcPlan', e.target.value)}
                                            className="w-full text-right bg-transparent border-b border-transparent focus:border-purple-500 focus:outline-none py-1"
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className={`text-xs font-medium ${tcPct >= 100 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>
                                            {tcPct.toFixed(0)}%
                                        </span>
                                    </td>

                                    <td className="px-2 py-2 text-center">
                                        <button 
                                            onClick={() => onDelete(seller.id)}
                                            className="p-1.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-400 dark:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100/80 dark:bg-gray-800/80 font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700">
                        <tr>
                            <td className="px-4 py-3 sticky left-0 z-10 bg-gray-100/95 dark:bg-gray-800/95 border-r border-gray-200 dark:border-gray-700">Total Summary</td>
                            <td className="px-2 py-3 text-right">{formatCurrency(totals.totalFact)}</td>
                            <td className="px-2 py-3 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.totalPlan)}</td>
                            <td className="px-2 py-3 text-center">{formatCurrency(totals.totalCount)}</td>
                            <td className="px-2 py-3 text-center text-emerald-600 dark:text-emerald-400">
                                {calculatePercentage(totals.totalFact, totals.totalPlan).toFixed(1)}%
                            </td>
                            <td className="px-2 py-3 text-right text-amber-600 dark:text-amber-400 border-l border-r border-gray-200 dark:border-gray-700">
                                {formatCurrency(totals.bonus)}
                            </td>
                            <td className="px-2 py-3 text-right">{formatCurrency(totals.ceFact)}</td>
                            <td className="px-2 py-3 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.cePlan)}</td>
                            <td className="px-2 py-3 text-center text-blue-600 dark:text-blue-400 border-r border-gray-200 dark:border-gray-700">
                                {calculatePercentage(totals.ceFact, totals.cePlan).toFixed(0)}%
                            </td>
                            <td className="px-2 py-3 text-right">{formatCurrency(totals.tcFact)}</td>
                            <td className="px-2 py-3 text-right text-gray-500 dark:text-gray-400">{formatCurrency(totals.tcPlan)}</td>
                            <td className="px-2 py-3 text-center text-purple-600 dark:text-purple-400">
                                {calculatePercentage(totals.tcFact, totals.tcPlan).toFixed(0)}%
                            </td>
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
