import React, { useMemo } from 'react';
import { IncomeItem, IncomeCategory } from '../types';

/**
 * Props for the IncomeTable component.
 */
interface IncomeTableProps {
  items: IncomeItem[]; // An array of income items to display.
}

/**
 * A map of income categories to their corresponding Tailwind CSS classes for styling.
 */
const categoryStyles: { [key in IncomeCategory]: string } = {
  [IncomeCategory.DEFAULT]: 'bg-transparent',
  [IncomeCategory.REJECTED]: 'bg-orange-600/30 text-orange-300',
  [IncomeCategory.SELLER]: 'bg-transparent',
  [IncomeCategory.BANK_CARD]: 'bg-gray-600/30',
  [IncomeCategory.IN_CASH]: 'bg-gray-600/30',
  [IncomeCategory.COMBINED]: 'bg-transparent',
  [IncomeCategory.SOLIFY]: 'bg-transparent',
  [IncomeCategory.FINE]: 'bg-transparent text-red-400',
  [IncomeCategory.OVERALL]: 'bg-transparent font-bold',
};

/**
 * A table component to display a detailed breakdown of income items.
 * It calculates and displays subtotals and overall totals.
 */
const IncomeTable: React.FC<IncomeTableProps> = ({ items }) => {
  /**
   * Helper function to format a number as a currency string.
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  /**
   * useMemo is used to calculate totals only when the `items` prop changes.
   * This prevents unnecessary recalculations on every render.
   */
  const totals = useMemo(() => {
    const totalQuantity = items.reduce((acc, item) => {
       // Only sum quantities for specific categories.
       if (item.category === IncomeCategory.SELLER || item.category === IncomeCategory.REJECTED) {
            return acc + item.quantity;
       }
       return acc;
    }, 0);
    
    const subTotal = items.reduce((acc, item) => acc + (item.income * item.quantity), 0);
    // The overall total includes the subtotal plus any fines.
    const overallTotal = subTotal + items.find(i => i.category === IncomeCategory.FINE)?.income || 0;

    return { totalQuantity, subTotal, overallTotal };
  }, [items]);

  // Find the index of the "Seller" item to correctly place the subtotal row.
  const sellerItemIndex = items.findIndex(item => item.category === IncomeCategory.SELLER);


  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
          <tr>
            <th scope="col" className="px-4 py-3">Type</th>
            <th scope="col" className="px-4 py-3 text-right">Income</th>
            <th scope="col" className="px-4 py-3 text-right">Quantity</th>
            <th scope="col" className="px-4 py-3 text-right">Equal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const equal = item.income * item.quantity;
            // Determine if this is the row after which the subtotal should be inserted.
            const isSubTotalRow = index === sellerItemIndex;
            return (
              <React.Fragment key={item.id}>
                <tr className={`border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors duration-150 ${categoryStyles[item.category]}`}>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{item.type}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(item.income)}</td>
                  {/* Display quantity only if it's greater than 0 */}
                  <td className="px-4 py-2 text-right">{item.quantity > 0 ? item.quantity : ''}</td>
                  <td className="px-4 py-2 text-right font-semibold text-white">{formatCurrency(equal)}</td>
                </tr>
                {/* Conditionally render the subtotal row */}
                {isSubTotalRow && (
                   <tr className="border-b border-gray-700/50 font-semibold">
                       <td className="px-4 py-2"></td>
                       <td className="px-4 py-2"></td>
                       <td className="px-4 py-2 text-right text-gray-400">{totals.totalQuantity}</td>
                       <td className="px-4 py-2 text-right">{formatCurrency(totals.subTotal)}</td>
                   </tr>
                )}
              </React.Fragment>
            )
          })}
          {/* Footer row for the overall total */}
           <tr className="font-bold text-white">
              <td className="px-4 py-3">Overall</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right text-gray-400">0.12</td>
              <td className="px-4 py-3 text-right text-lg">{formatCurrency(totals.overallTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default IncomeTable;
