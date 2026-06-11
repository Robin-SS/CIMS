import React, { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Search 
} from 'lucide-react';
import type { Ingredient } from '../types/InventoryItem';

type ActionView = 'menu' | 'add' | 'edit' | 'delete';

interface InventoryPageUIProps {
  userRole: string | undefined;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;

  sortedIngredients: Ingredient[];
  sortColumn: keyof Ingredient;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof Ingredient) => void;

  actionView: ActionView;
  setActionView: (view: ActionView) => void;
  selectedIngredient: Ingredient | null;
  onSelectIngredient: (item: Ingredient | null) => void;

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
  onFormSubmit: (e: React.FormEvent) => Promise<boolean>;

  editError: string;
  editName: string;
  setEditName: (v: string) => void;
  editCategory: string;
  setEditCategory: (v: string) => void;
  editQuantity: string;
  setEditQuantity: (v: string) => void;
  editUnit: string;
  setEditUnit: (v: string) => void;
  editThreshold: string;
  setEditThreshold: (v: string) => void;
  editStockDate: string;
  setEditStockDate: (v: string) => void;
  editExpiryDate: string;
  setEditExpiryDate: (v: string) => void;
  onEditSubmit: (e: React.FormEvent) => Promise<boolean>;

  deleteError: string;
  onDeleteSubmit: () => Promise<boolean>;
  
  children?: React.ReactNode;
}

export default function InventoryPageUI({
  userRole,
  isModalOpen: _isModalOpen,
  setIsModalOpen,
  sortedIngredients,
  sortColumn,
  sortDirection,
  onSort,
  actionView,
  setActionView,
  selectedIngredient,
  onSelectIngredient,
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
  editError,
  editName,
  setEditName,
  editCategory,
  setEditCategory,
  editQuantity,
  setEditQuantity,
  editUnit,
  setEditUnit,
  editThreshold,
  setEditThreshold,
  editStockDate,
  setEditStockDate,
  editExpiryDate,
  setEditExpiryDate,
  onEditSubmit,
  deleteError,
  onDeleteSubmit,
  children,
}: InventoryPageUIProps) {
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const CATEGORY_ORDER = ['INGREDIENTS', 'PACKAGING', 'CONSUMABLES'];

  // Safe fallback maps prevent properties of null exceptions during filtering
  const filteredIngredients = (sortedIngredients || []).filter(item => {
    if (!item) return false;
    const q = searchQuery.toLowerCase();
    const name = (item.ingredient_name || '').toLowerCase();
    const id = (item.ingredient_id || '').toString();
    const status = (item.stock_status || '').toLowerCase();
    return name.includes(q) || id.includes(q) || status.includes(q);
  });

  const openView = (view: ActionView) => {
    setActionView(view);
    setIsModalOpen(view === 'add');
    onSelectIngredient(null); 
  };

  const goBackToMenu = () => {
    setActionView('menu');
    setIsModalOpen(false);
    onSelectIngredient(null);
  };

  const renderSortIcon = (column: keyof Ingredient) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-stone-400 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-orange-600 inline" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-orange-600 inline" />;
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8 font-sans selection:bg-orange-200">
      
      {/* ==================== HEADER ==================== */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Tita's Cafe Ledger Management</h1>
          <p className="text-sm text-stone-500">Real-time parameters for raw stock controls and module parameters.</p>
        </div>
        <div className="bg-stone-50 border border-stone-200 px-5 py-2.5 rounded-xl font-bold text-orange-600 uppercase tracking-wide text-sm">
          Access Role: {userRole || 'Guest'}
        </div>
      </div>

      {/* ==================== GRID WRAPPER ==================== */}
      <div className="flex flex-row gap-8 items-start w-full">
        
        {/* ==================== LEFT COLUMN: MASTER DATA TABLE ==================== */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          
          <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center gap-4">
            <h2 className="font-bold text-stone-700 text-sm tracking-wide uppercase">Active Inventory Materials</h2>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search raw material assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-stone-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs text-stone-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 text-[11px] font-bold uppercase tracking-wider select-none sticky top-0 z-10">
                  <th className="p-4 cursor-pointer hover:bg-stone-100 transition" onClick={() => onSort('ingredient_id')}>ID {renderSortIcon('ingredient_id')}</th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100 transition" onClick={() => onSort('ingredient_name')}>Name {renderSortIcon('ingredient_name')}</th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100 transition" onClick={() => onSort('stock_quantity')}>Qty {renderSortIcon('stock_quantity')}</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100 transition" onClick={() => onSort('threshold')}>Threshold {renderSortIcon('threshold')}</th>
                  <th className="p-4 cursor-pointer hover:bg-stone-100 transition" onClick={() => onSort('stock_status')}>Status {renderSortIcon('stock_status')}</th>
                  <th className="p-4">Expiration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                {filteredIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400 font-medium italic">No ledger records matched selection criteria.</td>
                  </tr>
                ) : (
                  CATEGORY_ORDER.map(category => {
                    // Safe string matching guard to bypass layout categorization row crash
                    const categoryItems = filteredIngredients.filter(item => 
                      (item.ingredient_category || '').toUpperCase() === category
                    );
                    if (categoryItems.length === 0) return null;

                    return (
                      <Fragment key={category}>
                        <tr className="bg-stone-100/80 border-y border-stone-200/60 sticky top-[37px] z-10">
                          <td colSpan={7} className="px-4 py-2 text-stone-700 font-bold tracking-wider text-[10px] uppercase bg-stone-100">
                            {category}
                          </td>
                        </tr>

                        {categoryItems.map((item) => {
                          const isSelected = selectedIngredient?.ingredient_id === item.ingredient_id;
                          let rowSelectionStyle = "hover:bg-stone-50/70 transition duration-75 text-stone-600";
                          if (isSelected) {
                            rowSelectionStyle = actionView === 'delete' ? "bg-red-500 text-white font-medium" : "bg-orange-500 text-white font-medium";
                          }

                          return (
                            <tr 
                              key={item.ingredient_id} 
                              onClick={() => {
                                if (actionView === 'delete' || actionView === 'edit' || actionView === 'menu') {
                                  onSelectIngredient(item);
                                  if (actionView === 'menu') setActionView('edit');
                                }
                              }}
                              className={`cursor-pointer ${rowSelectionStyle}`}
                            >
                              <td className={`p-4 font-mono text-[11px] ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>#{item.ingredient_id}</td>
                              <td className={`p-4 font-semibold ${isSelected ? 'text-white' : 'text-stone-800'}`}>{item.ingredient_name}</td>
                              <td className="p-4 font-semibold">{item.stock_quantity}</td>
                              <td className={`p-4 ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>{item.measurement_unit}</td>
                              <td className={`p-4 font-mono ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>{item.threshold}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                                  isSelected ? 'bg-white/20 text-white border-transparent' :
                                  item.stock_status === 'NO STOCK' || item.stock_status === 'Low Stock' || item.stock_status === 'LOW STOCK'
                                    ? 'bg-red-50 text-red-700 border-red-200' 
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }`}>
                                  {item.stock_status}
                                </span>
                              </td>
                              <td className={`p-4 text-[11px] ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>{item.expiry_date || 'N/A'}</td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: SYSTEM PANELS ==================== */}
        <div className="w-96 shrink-0 space-y-6">

          {children}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col">
            <h2 className="text-base font-bold text-stone-800 border-b border-stone-100 pb-3 mb-4 uppercase tracking-wide text-center">
              {userRole === 'admin' ? `${actionView} Control view` : 'System Authorization'}
            </h2>

            {userRole === 'admin' ? (
              <div className="w-full">
                
                {actionView === 'menu' && (
                  <div className="space-y-3">
                    <button onClick={() => openView('add')} className="w-full flex items-center justify-between bg-white border-2 border-orange-600 text-orange-600 font-bold p-4 rounded-xl hover:bg-orange-50 transition">
                      <Plus className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wider">Add Ingredient</span>
                    </button>
                    <button onClick={() => openView('edit')} className="w-full flex items-center justify-between bg-white border-2 border-amber-600 text-amber-600 font-bold p-4 rounded-xl hover:bg-amber-50 transition">
                      <Edit3 className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wider">Edit Definition</span>
                    </button>
                    <button onClick={() => openView('delete')} className="w-full flex items-center justify-between bg-white border-2 border-red-600 text-red-600 font-bold p-4 rounded-xl hover:bg-red-50 transition">
                      <Trash2 className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wider">Delete Records</span>
                    </button>
                  </div>
                )}

                {actionView === 'add' && (
                  <div className="space-y-4">
                    <button onClick={goBackToMenu} className="text-xs font-semibold text-orange-600 hover:underline">← Cancel & Back</button>
                    {formError && (
                      <div className="bg-red-50 border border-red-100 text-red-800 text-xs p-3 rounded-xl flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-medium">{formError}</span>
                      </div>
                    )}
                    <form onSubmit={async (e) => { e.preventDefault(); if (await onFormSubmit(e)) goBackToMenu(); }} className="space-y-3 text-left">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Item Name</label>
                        <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Espresso Beans" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Category</label>
                        <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white outline-none">
                          <option value="INGREDIENTS">INGREDIENTS</option>
                          <option value="PACKAGING">PACKAGING</option>
                          <option value="CONSUMABLES">CONSUMABLES</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Quantity</label>
                          <input type="number" step="0.01" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Unit</label>
                          <select value={formUnit} onChange={e => setFormUnit(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white outline-none">
                            <option value="kg">kg</option>
                            <option value="L">L</option>
                            <option value="pcs">pcs</option>
                            <option value="oz">oz</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Safety Threshold</label>
                        <input type="number" value={formThreshold} onChange={e => setFormThreshold(e.target.value)} placeholder="5" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Stock Date</label>
                          <input type="date" value={formStockDate} onChange={e => setFormStockDate(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Expiry Date</label>
                          <input type="date" value={formExpiryDate} onChange={e => setFormExpiryDate(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-2.5 bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-orange-700 transition shadow-sm">Commit Asset Record</button>
                    </form>
                  </div>
                )}

                {actionView === 'edit' && (
                  <div className="space-y-4">
                    <button onClick={goBackToMenu} className="text-xs font-semibold text-orange-600 hover:underline">← Cancel & Back</button>
                    {editError && (
                      <div className="bg-red-50 border border-red-100 text-red-800 text-xs p-3 rounded-xl flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-medium">{editError}</span>
                      </div>
                    )}
                    {selectedIngredient ? (
                      <form onSubmit={async (e) => { e.preventDefault(); if (await onEditSubmit(e)) goBackToMenu(); }} className="space-y-3 text-left">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Modify Name</label>
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Category Group</label>
                          <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white outline-none">
                            <option value="INGREDIENTS">INGREDIENTS</option>
                            <option value="PACKAGING">PACKAGING</option>
                            <option value="CONSUMABLES">CONSUMABLES</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Quantity Level</label>
                            <input type="number" step="0.01" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Measurement Unit</label>
                            <select value={editUnit} onChange={e => setEditUnit(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white outline-none">
                              <option value="kg">kg</option>
                              <option value="L">L</option>
                              <option value="pcs">pcs</option>
                              <option value="oz">oz</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Minimum Alert Baseline</label>
                          <input type="number" value={editThreshold} onChange={e => setEditThreshold(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Stock Date</label>
                            <input type="date" value={editStockDate} onChange={e => setEditStockDate(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Expiration Date</label>
                            <input type="date" value={editExpiryDate} onChange={e => setEditExpiryDate(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs outline-none" />
                          </div>
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-orange-700 transition shadow-sm">Save Ingredient Changes</button>
                      </form>
                    ) : (
                      <div className="p-6 border-2 border-dashed border-stone-200 text-stone-400 italic text-center rounded-xl text-xs">
                        Select a row from the database table to edit parameters.
                      </div>
                    )}
                  </div>
                )}

                {actionView === 'delete' && (
                  <div className="space-y-4">
                    <button onClick={goBackToMenu} className="text-xs font-semibold text-orange-600 hover:underline">← Cancel & Back</button>
                    {deleteError && (
                      <div className="bg-red-50 border border-red-100 text-red-800 text-xs p-3 rounded-xl flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-medium">{deleteError}</span>
                      </div>
                    )}
                    {selectedIngredient ? (
                      <div className="space-y-4 text-left">
                        <div className="bg-red-50/50 p-4 border border-red-100 rounded-xl space-y-2">
                          <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">Removal Targets</span>
                          <h4 className="font-bold text-stone-800 text-base">{selectedIngredient.ingredient_name}</h4>
                          <p className="text-stone-500 text-[11px]">Material Reference Ident Key: #{selectedIngredient.ingredient_id}</p>
                        </div>
                        <button onClick={async () => { if (await onDeleteSubmit()) goBackToMenu(); }} className="w-full py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-red-700 transition shadow-md">
                          Confirm Permanent Deletion
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 border-2 border-dashed border-stone-200 text-stone-400 italic text-center rounded-xl text-xs">
                        Select a target profile row item from the list to remove.
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-500 font-medium text-xs text-center flex items-center justify-center space-x-1">
                <Eye className="w-4 h-4 text-stone-400" />
                <span>Ledger Locked in Read-Only Mode</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ==================== FOOTER ==================== */}
      <nav className="mt-8 bg-stone-50 border border-stone-200 p-1.5 rounded-full shadow-sm max-w-4xl mx-auto flex items-center justify-between w-full">
        {[
          { label: 'HOME',           path: '/home',       active: false },
          { label: 'POINT OF SALES', path: '/pos',        active: false },
          { label: 'INVENTORY',      path: '/inventory',  active: true  },
          { label: 'INSIGHTS',       path: '/insights',   active: false },
        ].map(({ label, path, active }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`flex-1 text-center py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
              active ? 'bg-white text-orange-600 border border-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

    </div>
  );
}