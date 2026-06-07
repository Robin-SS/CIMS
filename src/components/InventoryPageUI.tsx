import React from 'react';
import { Plus, Eye, ArrowUpDown, ArrowUp, ArrowDown, X, AlertTriangle } from 'lucide-react';

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

interface InventoryPageUIProps {
  // Global Layout Props
  userRole: string | undefined;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;

  // Table Props (Passed from Features)
  sortedIngredients: Ingredient[];
  sortColumn: keyof Ingredient;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof Ingredient) => void;

  // Form Props (Passed from Features)
  formError: string;
  formName: string;
  setFormName: (v: string) => void;
  formCategory: string;
  setFormCategory: (v: string) => void;
  formQuantity: string;
  setFormQuantity: (v: string) => void;
  formUnit: string;
  setFormUnit: (v: string) => void;
  formThreshold: string;
  setFormThreshold: (v: string) => void;
  formStockDate: string;
  setFormStockDate: (v: string) => void;
  formExpiryDate: string;
  setFormExpiryDate: (v: string) => void;
  onFormSubmit: (e: React.FormEvent) => void;
}

export default function InventoryPageUI({
  userRole,
  isModalOpen,
  setIsModalOpen,
  sortedIngredients,
  sortColumn,
  sortDirection,
  onSort,
  formError,
  formName,
  setFormName,
  formCategory,
  setFormCategory,
  formQuantity,
  setFormQuantity,
  formUnit,
  setFormUnit,
  formThreshold,
  setFormThreshold,
  formStockDate,
  setFormStockDate,
  formExpiryDate,
  setFormExpiryDate,
  onFormSubmit,
}: InventoryPageUIProps) {
  
  const renderSortIcon = (column: keyof Ingredient) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-stone-400 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-orange-600 inline" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-orange-600 inline" />;
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      {/* Header Banner */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h1 className="text-2xl font-bold text-stone-800">Cafe Inventory Management</h1>
        <p className="text-sm text-stone-500">Manage real-time raw materials stock ledger values.</p>
      </div>

      {/* Main Grid Wrapper */}
      <div className="flex flex-row gap-8 items-start w-full">
        
        {/* ==================== LEFT: TABLE DESIGN ==================== */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/50">
            <h2 className="font-bold text-stone-700 text-sm">Master Inventory Ledger</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider select-none">
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('ingredient_id')}>
                    ID {renderSortIcon('ingredient_id')}
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('ingredient_name')}>
                    Name {renderSortIcon('ingredient_name')}
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('ingredient_category')}>
                    Category {renderSortIcon('ingredient_category')}
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('stock_quantity')}>
                    Qty {renderSortIcon('stock_quantity')}
                  </th>
                  <th className="p-4">Unit</th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('threshold')}>
                    Threshold {renderSortIcon('threshold')}
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('stock_status')}>
                    Status {renderSortIcon('stock_status')}
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('stock_date')}>
                    Stock Date {renderSortIcon('stock_date')}
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100/80 transition" onClick={() => onSort('expiry_date')}>
                    Expiry Date {renderSortIcon('expiry_date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-stone-600">
                {sortedIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-stone-400">No records found.</td>
                  </tr>
                ) : (
                  sortedIngredients.map((item) => (
                    <tr key={item.ingredient_id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 font-mono text-xs text-stone-400">#{item.ingredient_id}</td>
                      <td className="p-4 font-semibold text-stone-800">{item.ingredient_name}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-md">{item.ingredient_category}</span>
                      </td>
                      <td className="p-4 font-medium">{item.stock_quantity}</td>
                      <td className="p-4 text-stone-500">{item.measurement_unit}</td>
                      <td className="p-4 font-mono text-stone-400">{item.threshold}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                          item.stock_status === 'NO STOCK' ? 'bg-red-50 text-red-700 border-red-200' :
                          item.stock_status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'
                        }`}>{item.stock_status}</span>
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

        {/* ==================== RIGHT: FORM PANEL DESIGN ==================== */}
        <div className="w-96 shrink-0 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-base font-bold text-stone-800 mb-2">Operations Panel</h2>
            {userRole === 'admin' ? (
              <div>
                {!isModalOpen ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-medium p-3 rounded-xl shadow-sm transition"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Ingredient</span>
                  </button>
                ) : (
                  <div className="text-stone-400 text-xs text-center font-medium py-3 bg-stone-50 border border-stone-200 border-dashed rounded-xl">
                    Registration form active below
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-500 font-medium text-xs text-center flex items-center justify-center space-x-1">
                <Eye className="w-4 h-4 text-stone-400" />
                <span>Dashboard locked in Read-Only Mode</span>
              </div>
            )}
          </div>

          {isModalOpen && userRole === 'admin' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 relative animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-stone-800 mb-1">Register Inbound Ingredient</h3>
              <p className="text-xs text-stone-500 mb-4">Provide parameters to open data fields row entries.</p>

              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              <form onSubmit={onFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Ingredient Name</label>
                  <input 
                    type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Espresso Beans Roast"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Asset Category</label>
                  <select 
                    value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                  >
                    <option value="Ingredients">Ingredients</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Consumables">Consumables</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Stock Quantity</label>
                    <input 
                      type="number" step="0.01" value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Measurement Unit</label>
                    <select 
                      value={formUnit} onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="L">L (Liters)</option>
                      <option value="pcs">pcs (Pieces)</option>
                      <option value="oz">oz (Ounces)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Minimum Safety Threshold</label>
                  <input 
                    type="number" value={formThreshold} onChange={(e) => setFormThreshold(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Inbound Stock Date</label>
                    <input 
                      type="date" value={formStockDate} onChange={(e) => setFormStockDate(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Expiration Date</label>
                    <input 
                      type="date" value={formExpiryDate} onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-sm transition mt-2 text-sm"
                >
                  Commit Asset Record
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}