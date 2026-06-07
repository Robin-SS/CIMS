import { AlertTriangle, X } from 'lucide-react';
import React from 'react';

interface AddIngredientFormUIProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  errorMessage: string;
  name: string;
  setName: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  quantity: string;
  setQuantity: (v: string) => void;
  unit: string;
  setUnit: (v: string) => void;
  threshold: string;
  setThreshold: (v: string) => void;
  stockDate: string;
  setStockDate: (v: string) => void;
  expiryDate: string;
  setExpiryDate: (v: string) => void;
}

export default function AddIngredientFormUI({
  onClose,
  onSubmit,
  errorMessage,
  name,
  setName,
  category,
  setCategory,
  quantity,
  setQuantity,
  unit,
  setUnit,
  threshold,
  setThreshold,
  stockDate,
  setStockDate,
  expiryDate,
  setExpiryDate,
}: AddIngredientFormUIProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 relative animate-in fade-in slide-in-from-top-2 duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-base font-bold text-stone-800 mb-1">Register Inbound Ingredient</h3>
      <p className="text-xs text-stone-500 mb-4">Provide parameters to open data fields row entries.</p>

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Ingredient Name</label>
          <input 
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Espresso Beans Roast"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Asset Category</label>
          <select 
            value={category} onChange={(e) => setCategory(e.target.value)}
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
              type="number" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Measurement Unit</label>
            <select 
              value={unit} onChange={(e) => setUnit(e.target.value)}
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
            type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)}
            placeholder="5"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Inbound Stock Date</label>
            <input 
              type="date" value={stockDate} onChange={(e) => setStockDate(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Expiration Date</label>
            <input 
              type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
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
  );
}