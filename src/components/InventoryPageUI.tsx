import React, { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import type { Ingredient } from '../types/InventoryItem';

import cafeLogo       from '../assets/cafeLogo.png';
import homeIcon       from '../assets/homeIcon.png';
import posIcon        from '../assets/posIcon.png';
import inventoryIcon  from '../assets/inventoryIcon.png';
import insightsIcon   from '../assets/insightsIcon.png';
import addIcon        from '../assets/addIcon.png';
import editIcon       from '../assets/editIcon.png';
import deleteIcon     from '../assets/deleteIcon.png';
import adminIcon      from '../assets/adminIcon.png';
import searchIcon     from '../assets/searchIcon.png';

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
  selectedIds: Set<number>;
  onToggleSelect: (item: Ingredient) => void;
  onClearSelection: () => void;

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
  hasExpiry: boolean;              
  setHasExpiry: (v: boolean) => void; 
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
  selectedIds,
  onToggleSelect,
  onClearSelection,
  formError, formName, setFormName, formCategory, setFormCategory,
  formQuantity, setFormQuantity, formUnit, setFormUnit,
  formThreshold, setFormThreshold, formStockDate, setFormStockDate,
  formExpiryDate, setFormExpiryDate, hasExpiry, setHasExpiry, onFormSubmit,
  editError, editName, setEditName, editCategory, setEditCategory,
  editQuantity, setEditQuantity, editUnit, setEditUnit,
  editThreshold, setEditThreshold, editStockDate, setEditStockDate,
  editExpiryDate, setEditExpiryDate, onEditSubmit,
  deleteError, onDeleteSubmit,
  children,
}: InventoryPageUIProps) {

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = userRole?.toLowerCase() === 'admin';
  const CATEGORY_ORDER = ['INGREDIENTS', 'PACKAGING', 'CONSUMABLES'];

  const filteredIngredients = sortedIngredients.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.ingredient_name.toLowerCase().includes(q) ||
      item.ingredient_id.toString().includes(q) ||
      item.stock_status.toLowerCase().includes(q)
    );
  });

  const openView = (view: ActionView) => {
    setActionView(view);
    setIsModalOpen(view === 'add');
    onClearSelection();
    onSelectIngredient(null);
  };

  const goBackToMenu = () => {
    setActionView('menu');
    setIsModalOpen(false);
    onClearSelection();
    onSelectIngredient(null);
  };

  const renderSortIcon = (column: keyof Ingredient) => {
    if (sortColumn !== column) return <ArrowUpDown style={{ width: 11, height: 11, marginLeft: 4, display: 'inline', color: '#B0A89E' }} />;
    return sortDirection === 'asc'
      ? <ArrowUp   style={{ width: 11, height: 11, marginLeft: 4, display: 'inline', color: '#D1915F' }} />
      : <ArrowDown style={{ width: 11, height: 11, marginLeft: 4, display: 'inline', color: '#D1915F' }} />;
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 0.5, color: '#D1915F', marginBottom: 4
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #D1915F',
    fontSize: 13, outline: 'none', color: '#1E1E1E', backgroundColor: '#FFFFFF', boxSizing: 'border-box'
  };
  const submitBtnStyle: React.CSSProperties = {
    width: '100%', padding: '15px 0', background: '#D1915F', color: '#FFFFFF',
    fontWeight: 700, fontSize: 14, borderRadius: 10, border: 'none', cursor: 'pointer', marginTop: 4
  };

  const selectedCount = selectedIds.size;

  // Track if the loaded edit asset is configured as non-perishable
  const editItemHasNoExpiry = editCategory === 'PACKAGING' || editExpiryDate === '9999-12-31';

  const getStatusStyles = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'NO STOCK' || s === 'OUT OF STOCK') {
      return { color: '#EF4444', border: '1px solid #EF4444', dot: '#EF4444' };
    } else if (s === 'LOW STOCK') {
      return { color: '#F59E0B', border: '1px solid #FDE68A', dot: '#F59E0B' };
    } else {
      return { color: '#10B981', border: '1px solid #A7F3D0', dot: '#10B981' };
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif",
      padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', 
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');
        .inventory-row { transition: background-color 0.15s ease; }
        .inventory-row:hover { background-color: #FDFBF7; }
        .inventory-row.del-selected, .inventory-row.del-selected:hover { background-color: #FF2C2C !important; color: #FFFFFF; }
        .inventory-row.edit-selected, .inventory-row.edit-selected:hover { background-color: #D1915F !important; color: #FFFFFF; }
      `}</style>

     {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} alt="Logo" />
          <h1 style={{ fontFamily: "'Liu Jian Mao Cao', cursive", fontSize: 33, color: '#1E1E1E', lineHeight: 0.85, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            <span>Tita's</span><span>cafe</span>
          </h1>
        </div>

        <div style={{ boxShadow: '0 0px 5px #d772204d', display: 'flex', alignItems: 'center', gap: 10, background: '#faebe0', padding: '10px 20px', borderRadius: 28, border: '2px solid #f2d8c3', color: '#D1915F', fontWeight: 'bold', fontSize: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Guest'}</span>
        </div>
      </header>


      {/* MAIN */}
        <main style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 340px', 
          gap: 24, 
          flexGrow: 1, 
          alignItems: 'stretch', 
          marginBottom: 24,
          height: '0px',                      
          minHeight: 'calc(102.5vh - 270px)', 
          maxHeight: 'calc(102.5vh - 270px)'  
        }}>        
        {/* LEFT: Table */}

        <section style={{ 
          border: '2px solid #f2d8c3', 
          borderRadius: 12, 
          background: '#FFFFFF', 
          padding: 24, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16, 
          boxSizing: 'border-box',
          overflow: 'hidden' ,
          boxShadow: '0 0px 5px #d772204d',
        }}>          
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#D1915F', margin: 0 }}>Inventory</h2>
              <p style={{ fontSize: 12, color: '#8A7E72', margin: 0 }}>Manage your stock levels and ingredient details</p>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                style={{ boxShadow: '0 0px 5px #d772204d', padding: '10px 16px', paddingRight: 40, borderRadius: 10, border: '2px solid #f2d8c3', fontSize: 14, width: 240, outline: 'none', color: '#8A7E72', backgroundColor: '#FFFFFF' }} />
              <button style={{ position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                <img src={searchIcon} alt="" style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', padding: 0, boxSizing: 'border-box',}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 14 }}>
              <thead>
                <tr>
                  {([
                    ['ingredient_id',    'Item ID'],
                    ['ingredient_name',  'Name'],
                    ['stock_quantity',   'Qty'],
                    ['measurement_unit', 'Unit'],
                    ['threshold',        'Threshold'],
                    ['stock_status',     'Stock Status'],
                    ['expiry_date',      'Expiration Date'],
                  ] as [keyof Ingredient, string][]).map(([col, label]) => (
                    <th key={`${col}`} onClick={() => onSort(col)} style={{ backgroundColor: '#ffffff', color: '#D1915F', fontWeight: 600, padding: '12px 16px', textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5, borderBottom: '2px solid #f2d8c3', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      {label}{renderSortIcon(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORY_ORDER.map(category => {
                  const items = filteredIngredients.filter(i => i.ingredient_category.toUpperCase() === category);
                  if (items.length === 0) return null;
                  return (
                    <Fragment key={category}>
                      <tr>
                        <td colSpan={7} style={{ backgroundColor: '#D1915F', color: '#ffffff', fontWeight: 700, padding: '8px 16px', fontSize: 13, letterSpacing: 0.5, textAlign: 'left' }}>
                          {category}
                        </td>
                      </tr>
                      {items.map((item) => {
                        const isDelSelected = selectedIds.has(item.ingredient_id);
                        const isEditSelected = selectedIngredient?.ingredient_id === item.ingredient_id;
                        
                        let trClass = 'inventory-row';
                        if (actionView === 'delete' && isDelSelected) trClass += ' del-selected';
                        if (actionView === 'edit' && isEditSelected) trClass += ' edit-selected';

                        const handleRowClick = () => {
                          if (!isAdmin) return;
                          if (actionView === 'delete') onToggleSelect(item);
                          else if (actionView === 'edit' || actionView === 'menu') {
                            onSelectIngredient(item);
                            if (actionView === 'menu') setActionView('edit');
                          }
                        };

                        const textColor = (actionView === 'delete' && isDelSelected) || (actionView === 'edit' && isEditSelected) ? '#FFFFFF' : '#000000';
                        
                        // 🌟 Setup the Pill Styling for this specific row
                        const pillStyle = getStatusStyles(item.stock_status || 'IN STOCK');

                        return (
                          <tr key={item.ingredient_id} onClick={handleRowClick} className={trClass} style={{ cursor: isAdmin ? 'pointer' : 'default' }}>
                            <td style={{ padding: '14px 16px', color: textColor, borderBottom: '1px solid #F1F1F1' }}>{item.ingredient_id}</td>
                            <td style={{ padding: '14px 16px', color: textColor, borderBottom: '1px solid #F1F1F1' }}><strong>{item.ingredient_name}</strong></td>
                            <td style={{ padding: '14px 16px', color: textColor, borderBottom: '1px solid #F1F1F1' }}>{item.stock_quantity}</td>
                            <td style={{ padding: '14px 16px', color: textColor, borderBottom: '1px solid #F1F1F1' }}>{item.measurement_unit}</td>
                            <td style={{ padding: '14px 16px', color: textColor, borderBottom: '1px solid #F1F1F1' }}>{item.threshold} {item.measurement_unit}</td>
                            
                            {/* 🌟 The new visually consistent Status Pill Design */}
                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #F1F1F1' }}>
                              <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 6, 
                                  padding: '6px 12px', 
                                  borderRadius: 20, 
                                  border: pillStyle.border, 
                                  color: pillStyle.color, 
                                  fontWeight: 800, 
                                  fontSize: 11, 
                                  backgroundColor: '#FFFFFF', 
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                  textTransform: 'uppercase',
                                  whiteSpace: 'nowrap'
                                }}>
                                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: pillStyle.dot }}></div>
                                  {item.stock_status || 'IN STOCK'}
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px', color: textColor, borderBottom: '1px solid #F1F1F1' }}>
                              {item.expiry_date === '9999-12-31' ? 'N/A' : (item.expiry_date || 'N/A')}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
                {filteredIngredients.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#8A7E72', fontStyle: 'italic' }}>
                      No inventory data matches your search query criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT: Actions Panel / Notifications Panel */}
        <aside style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          background: '#FFFFFF', 
          border: '2px solid #f2d8c3', 
          borderRadius: 12, 
          overflow: 'hidden', 
          position: 'relative',
          boxShadow: '0 0px 5px #d772204d',
        }}>          
        <h2 style={{ fontSize: 25, fontWeight: 800, color: '#D1915F', padding: '16px 24px', borderBottom: '2px solid #f2d8c3', margin: 0, textTransform: 'uppercase', textAlign: 'center' }}>
            {isAdmin ? 'Actions' : 'Notifications'}
          </h2>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1 }}>
            
            {/* 🔴 IF ADMIN: SHOW ACTIONS MENU & FORMS 🔴 */}
            {isAdmin ? (
              <>
                {actionView === 'menu' && (
                  <>
                    <button onClick={() => openView('add')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12, padding: '20px', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', cursor: 'pointer', boxSizing: 'border-box' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '100%', border: '2px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={addIcon} alt="" style={{ width: 22, height: 22 }} /></div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#D1915F' }}>ADD</span>
                    </button>
                    <button onClick={() => openView('edit')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12, padding: '20px', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', cursor: 'pointer', boxSizing: 'border-box' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '100%', border: '2px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={editIcon} alt="" style={{ width: 22, height: 22 }} /></div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#D1915F' }}>EDIT</span>
                    </button>
                    <button onClick={() => openView('delete')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 12, padding: '20px', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', cursor: 'pointer', boxSizing: 'border-box' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '100%', border: '2px solid #FF2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={deleteIcon} alt="" style={{ width: 22, height: 22 }} /></div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#FF4A4A' }}>DELETE</span>
                    </button>

                    <hr style={{ border: 'none', borderTop: '3px solid #f2d8c3', margin: '12px 0' }} />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#D1915F', margin: '0 0 4px 0', textTransform: 'uppercase', textAlign: 'left' }}>
                      Alerts Overview
                    </h3>
                    <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '200px', paddingRight: 4 }}>
                      {children}
                    </div>
                  </>
                )}

                {actionView === 'add' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#D1915F' }}> ADD INGREDIENT</h3>
                    <button onClick={goBackToMenu} style={{ background: 'transparent', border: 'none', color: '#8A7E72', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </div>                    
                    {formError && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: '10px 12px', borderRadius: 10, display: 'flex', gap: 8 }}>
                        <AlertTriangle style={{ width: 14, height: 14 }} />
                        <span style={{ fontWeight: 600 }}>{formError}</span>
                      </div>
                    )}
                    <form onSubmit={async (e) => { e.preventDefault(); const ok = await onFormSubmit(e); if (ok) goBackToMenu(); }} 
                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>                      <div>
                        <label style={labelStyle}>Item Name</label>
                        <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Espresso Beans" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Category</label>
                        <select value={formCategory} onChange={e => setFormCategory(e.target.value)} style={inputStyle}>
                          <option value="INGREDIENTS">INGREDIENTS</option>
                          <option value="PACKAGING">PACKAGING</option>
                          <option value="CONSUMABLES">CONSUMABLES</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><label style={labelStyle}>Quantity</label><input type="number" step="0.01" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} style={inputStyle} /></div>
                        <div>
                          <label style={labelStyle}>Unit</label>
                          <select value={formUnit} onChange={e => setFormUnit(e.target.value)} style={inputStyle}>
                            <option value="kg">kg</option><option value="L">L</option><option value="pcs">pcs</option><option value="oz">oz</option>
                          </select>
                        </div>
                      </div>
                      <div><label style={labelStyle}>Threshold</label><input type="number" value={formThreshold} onChange={e => setFormThreshold(e.target.value)} style={inputStyle} /></div>
                      
                      {/* Checkbox Toggle — Displays for BOTH Ingredients and Consumables */}
                      {formCategory !== 'PACKAGING' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, textAlign: 'left' }}>
                          <input 
                            type="checkbox" 
                            id="hasExpiryCheck" 
                            checked={hasExpiry} 
                            onChange={(e) => {
                              setHasExpiry(e.target.checked);
                              if (!e.target.checked) setFormExpiryDate('');
                            }} 
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <label htmlFor="hasExpiryCheck" style={{ fontSize: 13, fontWeight: 600, color: '#8A7E72', cursor: 'pointer' }}>
                            This item has an expiration date
                          </label>
                        </div>
                      )}

                      {/* Dynamic date grid layout rendering mapping */}
                      <div style={{ display: 'grid', gridTemplateColumns: !hasExpiry ? '1fr' : '1fr 1fr', gap: 8 }}>
                        <div><label style={labelStyle}>Stock Date</label><input type="date" value={formStockDate} onChange={e => setFormStockDate(e.target.value)} style={inputStyle} /></div>
                        {hasExpiry && (
                          <div><label style={labelStyle}>Expiry Date</label><input type="date" value={formExpiryDate} onChange={e => setFormExpiryDate(e.target.value)} style={inputStyle} /></div>
                        )}
                      </div>
                      
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <button type="submit" style={{ ...submitBtnStyle, backgroundColor: '#09AA29', textTransform: 'uppercase', marginTop: 0, borderRadius: '0 0 12px 12px' }}>Confirm</button>
                      </div>
                    </form>
                  </div>
                )}

                {actionView === 'edit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#D1915F' }}>EDIT INGREDIENT</h3>
                    <button onClick={goBackToMenu} style={{ background: 'transparent', border: 'none', color: '#8A7E72', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </div>                    
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: '#8A7E72' }}>{selectedIngredient ? 'All fields must be filled up with complete and correct information.' : 'Select the ingredient you need to edit on the table.'}</p>
                    </div>
                    {editError && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: '10px 12px', borderRadius: 10, display: 'flex', gap: 8 }}>
                        <AlertTriangle style={{ width: 14, height: 14 }} />
                        <span style={{ fontWeight: 600 }}>{editError}</span>
                      </div>
                    )}
                    {selectedIngredient ? (
                      <form onSubmit={async (e) => { e.preventDefault(); const ok = await onEditSubmit(e); if (ok) goBackToMenu(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div><label style={labelStyle}>Name</label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} /></div>
                        <div>
                          <label style={labelStyle}>Category</label>
                          <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={inputStyle}>
                            <option value="INGREDIENTS">INGREDIENTS</option><option value="PACKAGING">PACKAGING</option><option value="CONSUMABLES">CONSUMABLES</option>
                          </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div><label style={labelStyle}>Quantity</label><input type="number" step="0.01" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} style={inputStyle} /></div>
                          <div>
                            <label style={labelStyle}>Unit of Measurement</label>
                            <select value={editUnit} onChange={e => setEditUnit(e.target.value)} style={inputStyle}>
                              <option value="kg">kg</option><option value="L">L</option><option value="pcs">pcs</option><option value="oz">oz</option>
                            </select>
                          </div>
                        </div>
                        <div><label style={labelStyle}>Threshold</label><input type="number" value={editThreshold} onChange={e => setEditThreshold(e.target.value)} style={inputStyle} /></div>
                        
                        {/* Expiration checkbox option rendered for edit panels */}
                        {editCategory !== 'PACKAGING' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, textAlign: 'left' }}>
                            <input 
                              type="checkbox" 
                              id="editExpiryCheck" 
                              checked={editExpiryDate !== '9999-12-31'} 
                              onChange={(e) => setEditExpiryDate(e.target.checked ? '' : '9999-12-31')} 
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <label htmlFor="editExpiryCheck" style={{ fontSize: 13, fontWeight: 600, color: '#8A7E72', cursor: 'pointer' }}>
                              This item has an expiration date
                            </label>
                          </div>
                        )}

                        {/* Dynamic date grid layout spacing wrapper evaluating derived state metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: editItemHasNoExpiry ? '1fr' : '1fr 1fr', gap: 8 }}>
                          <div><label style={labelStyle}>Stock Date</label><input type="date" value={editStockDate} onChange={e => setEditStockDate(e.target.value)} style={inputStyle} /></div>
                          {!editItemHasNoExpiry && (
                            <div><label style={labelStyle}>Expiration Date</label><input type="date" value={editExpiryDate} onChange={e => setEditExpiryDate(e.target.value)} style={inputStyle} /></div>
                          )}
                        </div>

                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <button type="button" onClick={goBackToMenu} style={{ ...submitBtnStyle, backgroundColor: '#E5E5E5', color: '#1E1E1E', marginTop: 0, borderRadius: '0 0 0 12px' }}>Cancel</button>
                          <button type="submit" style={{ ...submitBtnStyle, backgroundColor: '#09AA29', marginTop: 0, borderRadius: '0 0 12px 0' }}>Confirm</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #f2d8c3', borderRadius: 12, padding: 20, textAlign: 'center', color: '#8A7E72', fontSize: 13, fontStyle: 'italic' }}>
                        No row selected. Please select an item on the list table to view details.
                      </div>
                    )}
                  </div>
                )}
              
                {actionView === 'delete' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#D1915F' }}>DELETE INGREDIENT</h3>
                    <button onClick={goBackToMenu} style={{ background: 'transparent', border: 'none', color: '#8A7E72', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </div>                    
        <div>
                  <p style={{ margin: 0, fontSize: 11, color: '#8A7E72' }}>Click rows on the table to select. Click again to deselect.</p>
                    </div>
                    {deleteError && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: '10px 12px', borderRadius: 10, display: 'flex', gap: 8 }}>
                        <AlertTriangle style={{ width: 14, height: 14 }} />
                        <span style={{ fontWeight: 600 }}>{deleteError}</span>
                      </div>
                    )}
                    {selectedCount > 0 ? (
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 6, background: '#FFFFFF', padding: 16, borderRadius: 12, border: '1px solid #E5E5E5', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#8A7E72', textTransform: 'uppercase' }}>{selectedCount} item{selectedCount > 1 ? 's' : ''} selected</span>
                          <button onClick={onClearSelection} style={{ background: 'none', border: 'none', fontSize: 11, color: '#FF2C2C', cursor: 'pointer', fontWeight: 600 }}>Clear all</button>
                        </div>
                        {filteredIngredients.filter(i => selectedIds.has(i.ingredient_id)).map(i => (
                          <div key={i.ingredient_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F1F1' }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1E1E' }}>{i.ingredient_name}</div>
                              <div style={{ fontSize: 11, color: '#8A7E72' }}>#{i.ingredient_id} · {i.stock_quantity} {i.measurement_unit}</div>
                            </div>
                            <button onClick={() => onToggleSelect(i)} style={{ background: 'none', border: 'none', color: '#FF2C2C', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #f2d8c3', borderRadius: 12, padding: 20, marginBottom: '60px', textAlign: 'center', color: '#8A7E72', fontSize: 13, fontStyle: 'italic' }}>                        No rows selected. Click any ingredient row on the table.
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                      <button type="button" onClick={async () => { const ok = await onDeleteSubmit(); if (ok) goBackToMenu(); }} disabled={selectedCount === 0} style={{ ...submitBtnStyle, backgroundColor: '#FF2C2C', textTransform: 'uppercase', marginTop: 0, borderRadius: '0 0 12px 12px', opacity: selectedCount > 0 ? 1 : 0.5, cursor: selectedCount > 0 ? 'pointer' : 'not-allowed' }}>
                        {selectedCount > 1 ? `Delete ${selectedCount} Items` : 'Delete Product/s'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* 🔵 IF STAFF: ONLY SHOW NOTIFICATIONS 🔵 */
              <div style={{ flexGrow: 1 }}>
                {children}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* FOOTER NAV */}
      <nav style={{ boxShadow: '0 0px 5px #d772204d', background: '#ffffff', borderRadius: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6, width: '100%', boxSizing: 'border-box', border: '2px solid #f2d8c3', marginTop: 16 }}>
        {[
          { label: 'HOME',           icon: homeIcon,      path: '/home',      active: false },
          { label: 'POINT OF SALES', icon: posIcon,       path: '/pos',       active: false  },
          { label: 'INVENTORY',      icon: inventoryIcon, path: '/inventory', active: true },
          { label: 'INSIGHTS',       icon: insightsIcon,  path: '/insights',  active: false },
        ].map(({ label, icon, path, active }) => (
          <button key={label} type="button" onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, margin: '0 4px', padding: '14px 22px', borderRadius: 28, cursor: 'pointer', color: '#D1915F', fontWeight: 700, fontSize: 14, transition: 'all 0.2s ease-in-out', border: active ? '2px solid #f2d8c3' : '2px solid transparent', background: active ? '#FFFFFF' : 'transparent', boxShadow: active ? '0 0px 5px #d772204d' : 'none' }}>
            <img src={icon} alt="" style={{ height: 22, width: 22, objectFit: 'contain', flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}