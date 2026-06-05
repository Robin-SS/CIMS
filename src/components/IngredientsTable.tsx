import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_category: string;
  stock_quantity: number;
  measurement_unit: string;
  threshold: number;
  stock_status: string;
  stock_date: string;
  expiry_date: string;
}

interface IngredientsTableProps {
  ingredients: Ingredient[];
}

export default function IngredientsTable({ ingredients }: IngredientsTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Ingredient>('ingredient_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: keyof Ingredient) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    let valueA = a[sortColumn];
    let valueB = b[sortColumn];

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (column: keyof Ingredient) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-stone-400 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-orange-600 inline" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-orange-600 inline" />;
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-4 border-b border-stone-200 bg-stone-50/50">
        <h2 className="font-bold text-stone-700 text-sm">Master Inventory Ledger</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider select-none">
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('ingredient_id')}>
                ID {renderSortIcon('ingredient_id')}
              </th>
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('ingredient_name')}>
                Name {renderSortIcon('ingredient_name')}
              </th>
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('ingredient_category')}>
                Category {renderSortIcon('ingredient_category')}
              </th>
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('stock_quantity')}>
                Qty {renderSortIcon('stock_quantity')}
              </th>
              <th className="p-4">Unit</th>
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('threshold')}>
                Threshold {renderSortIcon('threshold')}
              </th>
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('stock_status')}>
                Status {renderSortIcon('stock_status')}
              </th>
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('stock_date')}>
                Stock Date {renderSortIcon('stock_date')}
              </th>
              <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => handleSort('expiry_date')}>
                Expiry Date {renderSortIcon('expiry_date')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
            {sortedIngredients.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-stone-400">
                  No active material tracking records found inside database table matrix.
                </td>
              </tr>
            ) : (
              sortedIngredients.map((item) => (
                <tr key={item.ingredient_id} className="hover:bg-stone-50/50 transition">
                  <td className="p-4 font-mono text-xs text-stone-400">#{item.ingredient_id}</td>
                  <td className="p-4 font-semibold text-stone-800">{item.ingredient_name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-md">
                      {item.ingredient_category}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{item.stock_quantity}</td>
                  <td className="p-4 text-stone-500">{item.measurement_unit}</td>
                  <td className="p-4 font-mono text-stone-400">{item.threshold}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                      item.stock_status === 'NO STOCK' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : item.stock_status === 'Low Stock' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {item.stock_status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-stone-500">{item.stock_date}</td>
                  <td className="p-4 text-xs text-stone-500">{item.expiry_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}