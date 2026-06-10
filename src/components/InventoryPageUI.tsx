import React, { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import type { Ingredient } from '../types/InventoryItem';

// Icons for Bottom Navigation Bar and Actions Panel (in .png format)
import cafeLogo    from '../assets/cafeLogo.png';
import homeIcon    from '../assets/homeIcon.png';
import posIcon     from '../assets/posIcon.png';
import inventoryIcon from '../assets/inventoryIcon.png';
import insightsIcon  from '../assets/insightsIcon.png';
import addIcon     from '../assets/addIcon.png';
import editIcon    from '../assets/editIcon.png';
import deleteIcon  from '../assets/deleteIcon.png';
import adminIcon   from '../assets/adminIcon.png';
import searchIcon from '../assets/searchIcon.png';

type ActionView = 'menu' | 'add' | 'edit' | 'delete';

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

  // Selection Props
  selectedIngredient: Ingredient | null;
  onSelectIngredient: (item: Ingredient | null) => void;

  // Add Form Props (Passed from Features)
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

  // Edit Form Props (Passed from Features)
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
}

export default function InventoryPageUI({
  userRole,
  isModalOpen: _isModalOpen, 
  setIsModalOpen,
  sortedIngredients,
  sortColumn,
  sortDirection,
  onSort,
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
}: InventoryPageUIProps) {

  // Bottom Navigation Bar Routing
  const navigate = useNavigate();
  const [actionView, setActionView] = useState<ActionView>('menu');
  
  // Search Field for Filtering Inventory Items & Filters by Search Query [US12]
  const [searchQuery, setSearchQuery] = useState('');
  const filteredIngredients = sortedIngredients.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.ingredient_name.toLowerCase().includes(q) ||
      item.ingredient_id.toString().includes(q) ||
      item.stock_status.toLowerCase().includes(q)
    );
  });

  // Opens a Sub-Panel in the Actions Panel
  const openView = (view: ActionView) => {
    setActionView(view);
    setIsModalOpen(view === 'add');
    if (view === 'menu') {
      onSelectIngredient(null);
    }
  };

  // Returns to Main Menu
  const goBackToMenu = () => {
    setActionView('menu');
    setIsModalOpen(false);
    onSelectIngredient(null);
  };

  const renderSortIcon = (column: keyof Ingredient) => {
    if (sortColumn !== column) return <ArrowUpDown style={{ width: 11, height: 11, marginLeft: 4, display: 'inline', color: '#B0A89E' }} />;
    return sortDirection === 'asc'
      ? <ArrowUp   style={{ width: 11, height: 11, marginLeft: 4, display: 'inline', color: '#D1915F' }} />
      : <ArrowDown style={{ width: 11, height: 11, marginLeft: 4, display: 'inline', color: '#D1915F' }} />;
  };

  // For Table Categorization (Ingredients, Packaging, Consumables) [US11]
  const CATEGORY_ORDER = ['INGREDIENTS', 'PACKAGING', 'CONSUMABLES'];

  // For Labels, Inputs, and Submit Buttons Inside Sub-Panels (ADD/EDIT/DELETE) - for uniformity hehe
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 0.5, color: '#D1915F', marginBottom: 4
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #D1915F',
    fontSize: 13, outline: 'none', color: '#1E1E1E', backgroundColor: '#FFFFFF', boxSizing: 'border-box'
  };

  const submitBtnStyle: React.CSSProperties = {
    width: '100%', padding: '10px 0', background: '#D1915F', color: '#FFFFFF',
    fontWeight: 700, fontSize: 14, borderRadius: 10, border: 'none', cursor: 'pointer', marginTop: 4
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif",
      padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box'
    }}>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>

      {/* ====================[HEADER] LOGO + TITLE + ACCESS ==================== */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} />
            <h1 style={{
              fontFamily: "'Liu Jian Mao Cao', cursive", fontSize: 33, color: '#1E1E1E',
              lineHeight: 0.85, margin: 0, padding: 0, display: 'flex', flexDirection: 'column'
            }}>
              <span>Tita's</span>
              <span>cafe</span>
            </h1>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'white',
          padding: '15px 25px', borderRadius: 28, border: '1px solid #D3C9BE',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)', color: '#D1915F', fontWeight: 'bold',
          fontSize: 20, textTransform: 'capitalize'
        }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Guest'}</span>
        </div>
      </header>

      {/* ====================[LEFT COLUMN] INVENTORY TABLE + ACTIONS PANEL==================== */}
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, flexGrow: 1, alignItems: 'stretch', marginBottom: 24 }}>
        
        <section style={{
          border: '1px solid #D3D3D3', borderRadius: 12, background: '#F1F1F1', padding: 24,
          boxShadow: '0 4px 40px #ccbfbf', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box'
        }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#000000', margin: 0 }}>Inventory</h2>
              <p style={{ fontSize: 12, color: '#8A7E72', margin: 0 }}>Manage your stock levels and ingredient details</p>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '10px 16px', paddingRight: 40, borderRadius: 10, border: '1px solid #D3D3D3',
                  fontSize: 14, width: 240, outline: 'none', color: '#1E1E1E', backgroundColor: '#FFFFFF'
                }}
              />
              <button style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: '#D1915F', fontSize: 16, cursor: 'pointer' }} aria-label="Search">
                <img src={searchIcon} alt="" style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', background: '#FFFFFF', borderRadius: 12, border: '1px solid #D3D3D3', maxHeight: 520 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 14 }}>
              <thead>
                <tr>
                  {([
                    ['ingredient_id',       'Item ID'],
                    ['ingredient_name',     'Name'],
                    ['stock_quantity',      'Qty'],
                    ['measurement_unit',    'Unit'],
                    ['threshold',           'Threshold'],
                    ['stock_status',        'Stock Status'],
                    ['expiry_date',         'Expiration Date'],
                  ] as [keyof Ingredient, string][]).map(([col, label]) => (
                    <th
                      key={col}
                      onClick={() => onSort(col)}
                      style={{
                        backgroundColor: '#ffffff', color: '#D1915F', fontWeight: 600, padding: '12px 16px',
                        textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5,
                        borderBottom: '1px solid #D3D3D3', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap'
                      }}
                    >
                      {label}{renderSortIcon(col)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {CATEGORY_ORDER.map(category => {
                  const items = filteredIngredients.filter(item =>
                    item.ingredient_category.toUpperCase() === category
                  );
                  if (items.length === 0) return null;

                  return (
                    <Fragment key={category}>
                      <tr>
                        <td colSpan={7} style={{ backgroundColor: '#D1915F', color: '#ffffff', fontWeight: 700, padding: '8px 16px', fontSize: 13, letterSpacing: 0.5, textAlign: 'left'}}>
                          {category}
                        </td>
                      </tr>

                      {items.map((item) => {
                        const isSelected = selectedIngredient?.ingredient_id === item.ingredient_id;
                        return (
                          <tr
                            key={item.ingredient_id}
                            onClick={() => {
                              // Click row to select item if user has opened Edit or Delete panel view
                              if (actionView === 'edit' || actionView === 'delete' || actionView === 'menu') {
                                onSelectIngredient(item);
                                if (actionView === 'menu') {
                                  setActionView('edit');
                                }
                              }
                            }}
                            style={{ 
                              transition: 'background-color 0.15s ease',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#D1915F' : ''
                            }}
                            onMouseEnter={e => { if(!isSelected) e.currentTarget.style.backgroundColor = '#FDFBF7'; }}
                            onMouseLeave={e => { if(!isSelected) e.currentTarget.style.backgroundColor = ''; }}
                          >
                            <td style={{ padding: '14px 16px', color: isSelected ? '#FFFFFF' : '#000000', borderBottom: '1px solid #F1F1F1' }}>{item.ingredient_id}</td>
                            <td style={{ padding: '14px 16px', color: isSelected ? '#FFFFFF' : '#000000', borderBottom: '1px solid #F1F1F1' }}><strong>{item.ingredient_name}</strong></td>
                            <td style={{ padding: '14px 16px', color: isSelected ? '#FFFFFF' : '#000000', borderBottom: '1px solid #F1F1F1' }}>{item.stock_quantity}</td>
                            <td style={{ padding: '14px 16px', color: isSelected ? '#FFFFFF' : '#000000', borderBottom: '1px solid #F1F1F1' }}>{item.measurement_unit}</td>
                            <td style={{ padding: '14px 16px', color: isSelected ? '#FFFFFF' : '#000000', borderBottom: '1px solid #F1F1F1' }}>{item.threshold} {item.measurement_unit}</td>
                            
                            <td style={{ padding: '14px 16px', borderBottom: '1px solid #F1F1F1' }}>
                              <span style={{
                                fontWeight: 700, fontSize: 12,
                                color: isSelected ? '#FFFFFF' : (item.stock_status === 'LOW STOCK' || item.stock_status === 'Low Stock' ? '#C62828' : '#09AA29')
                              }}>
                                {item.stock_status === 'LOW STOCK' || item.stock_status === 'Low Stock' ? '🔴 ' : '🟢 '}
                                {item.stock_status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', color: isSelected ? '#FFFFFF' : '#000000', borderBottom: '1px solid #F1F1F1' }}>{item.expiry_date || 'N/A'}</td>
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

        {/* ====================[RIGHT COLUMN: ADMIN] ACTIONS PANEL==================== */}
        <aside style={{
          display: 'flex', flexDirection: 'column', background: '#F1F1F1',
          border: '1px solid #D1915F', borderRadius: 12, boxShadow: '0 4px 40px #ccbfbf', overflow: 'hidden', position: 'relative', paddingBottom: 80
        }}>

          <h2 style={{
            fontSize: 25, fontWeight: 800, color: '#D1915F', padding: '16px 24px',
            borderBottom: '1px solid #D1915F', margin: 0, textTransform: 'uppercase', textAlign: 'center'
          }}>
            {userRole?.toLowerCase() === 'admin' ? 'Actions' : 'Notifications'}
          </h2>

          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1 }}>

            {userRole?.toLowerCase() === 'admin' ? (
              <>
                {actionView === 'menu' && (
                  <>
                    {/* [ADD] BUTTON */}
                    <button
                      onClick={() => openView('add')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #D1915F',
                        cursor: 'pointer', boxSizing: 'border-box',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 55, height: 55, borderRadius: '50%', border: '3px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
                          <img src={addIcon} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 25, fontWeight: 800, color: '#D1915F', letterSpacing: 0.5 }}>ADD</span>
                    </button>

                    {/* [EDIT] BUTTON */}
                    <button
                      onClick={() => openView('edit')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #D1915F',
                        cursor: 'pointer', boxSizing: 'border-box',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 55, height: 55, borderRadius: '50%', border: '3px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
                          <img src={editIcon} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 25, fontWeight: 800, color: '#D1915F', letterSpacing: 0.5 }}>EDIT</span>
                    </button>

                    {/* [DELETE] BUTTON */}
                    <button
                      onClick={() => openView('delete')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #FF2C2C',
                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 55, height: 55, borderRadius: '50%', border: '3px solid #FF2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
                          <img src={deleteIcon} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 25, fontWeight: 800, color: '#FF4A4A', letterSpacing: 0.5 }}>DELETE</span>
                    </button>
                  </>
                )}

                {/* Inside [ADD] Sub-Panel (US6) */}
                {actionView === 'add' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                    <button onClick={goBackToMenu} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#D1915F', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                      ← Back to Dashboard
                    </button>

                    {formError && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: '10px 12px', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontWeight: 600 }}>{formError}</span>
                      </div>
                    )}

                    <form
                      onSubmit={async (e) => { 
                        e.preventDefault();
                        const isSavedSuccessfully = await onFormSubmit(e); 
                        if (isSavedSuccessfully) {
                          goBackToMenu();
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                    >
                      <div>
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
                        <div>
                          <label style={labelStyle}>Quantity</label>
                          <input type="number" step="0.01" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} placeholder="0.00" style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Unit</label>
                          <select value={formUnit} onChange={e => setFormUnit(e.target.value)} style={inputStyle}>
                            <option value="kg">kg</option>
                            <option value="L">L</option>
                            <option value="pcs">pcs</option>
                            <option value="oz">oz</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>Threshold</label>
                        <input type="number" value={formThreshold} onChange={e => setFormThreshold(e.target.value)} placeholder="5" style={inputStyle} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <label style={labelStyle}>Stock Date</label>
                          <input type="date" value={formStockDate} onChange={e => setFormStockDate(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Expiry Date</label>
                          <input type="date" value={formExpiryDate} onChange={e => setFormExpiryDate(e.target.value)} style={inputStyle} />
                        </div>
                      </div>

                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <button type="submit" style={{...submitBtnStyle, backgroundColor: '#09AA29', textTransform: 'uppercase', marginTop: 0, borderRadius: '0 0 12px 12px' }}>
                          Confirm
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Inside [EDIT] Sub-Panel (US7) - Matches design mockup specs exactly! */}
                {actionView === 'edit' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                    <button onClick={goBackToMenu} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#8A7E72', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                      ← Back to Dashboard
                    </button>

                    <div style={{ marginBottom: 4 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: '#1E1E1E' }}>EDIT INGREDIENT</h3>
                      <p style={{ margin: 0, fontSize: 11, color: '#8A7E72' }}>
                        {selectedIngredient ? 'All fields must be filled up with complete and correct information.' : 'Select the ingredient you need to edit on the table.'}
                      </p>
                    </div>

                    {editError && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: '10px 12px', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontWeight: 600 }}>{editError}</span>
                      </div>
                    )}

                    {selectedIngredient ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const isUpdatedSuccessfully = await onEditSubmit(e);
                          if (isUpdatedSuccessfully) {
                            goBackToMenu();
                          }
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                      >
                        <div>
                          <label style={labelStyle}>Name</label>
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                        </div>

                        <div>
                          <label style={labelStyle}>Category</label>
                          <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={inputStyle}>
                            <option value="INGREDIENTS">INGREDIENTS</option>
                            <option value="PACKAGING">PACKAGING</option>
                            <option value="CONSUMABLES">CONSUMABLES</option>
                          </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={labelStyle}>Quantity</label>
                            <input type="number" step="0.01" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Unit of Measurement</label>
                            <select value={editUnit} onChange={e => setEditUnit(e.target.value)} style={inputStyle}>
                              <option value="kg">kg</option>
                              <option value="L">L</option>
                              <option value="pcs">pcs</option>
                              <option value="oz">oz</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={labelStyle}>Threshold</label>
                          <input type="number" value={editThreshold} onChange={e => setEditThreshold(e.target.value)} style={inputStyle} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={labelStyle}>Stock Date</label>
                            <input type="date" value={editStockDate} onChange={e => setEditStockDate(e.target.value)} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Expiration Date</label>
                            <input type="date" value={editExpiryDate} onChange={e => setEditExpiryDate(e.target.value)} style={inputStyle} />
                          </div>
                        </div>

                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <button type="button" onClick={goBackToMenu} style={{ ...submitBtnStyle, backgroundColor: '#E5E5E5', color: '#1E1E1E', marginTop: 0, borderRadius: '0 0 0 12px' }}>
                            Cancel
                          </button>
                          <button type="submit" style={{ ...submitBtnStyle, backgroundColor: '#09AA29', marginTop: 0, borderRadius: '0 0 12px 0' }}>
                            Confirm
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #D3C9BE', borderRadius: 12, padding: 20, textAlign: 'center', color: '#8A7E72', fontSize: 13, fontStyle: 'italic' }}>
                        No row selected. Please select an item on the list table to view details.
                      </div>
                    )}
                  </div>
                )}

                {/* Inside [DELETE] Sub-Panel (US10) */}
                {actionView === 'delete' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button onClick={goBackToMenu} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#8A7E72', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                      ← Back to Dashboard
                    </button>
                    {/* Placeholder for Delete Feature */}
                  </div>
                )}
              </>
            ) : (
              <div style={{ flexGrow: 1 }} />
            )}

          </div>
        </aside>
      </main>

      {/* ==================== [FOOTER] BOTTOM NAVIGATION BAR ==================== */}
      <nav style={{
        background: '#f1f1f1', borderRadius: 35, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: 6, boxShadow: '0 4px 40px #ccbfbf',
        width: '100%', boxSizing: 'border-box', border: '1px solid #D3C9BE', marginTop: 16
      }}>
        {[
          { label: 'HOME',           icon: homeIcon,       path: '/home',       active: false },
          { label: 'POINT OF SALES', icon: posIcon,        path: '/pos',        active: false },
          { label: 'INVENTORY',      icon: inventoryIcon,  path: '/inventory',  active: true  },
          { label: 'INSIGHTS',       icon: insightsIcon,   path: '/insights',   active: false },
        ].map(({ label, icon, path, active }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              flex: 1, margin: '0 4px', padding: '14px 22px', borderRadius: 28, cursor: 'pointer',
              color: '#D1915F', fontWeight: 700, fontSize: 14,
              transition: 'all 0.2s ease-in-out', border: active ? '1px solid #D3C9BE' : '1px solid transparent',
              background: active ? '#FFFFFF' : 'transparent',
              boxShadow: active ? '0 2px 4px #ccbfbf' : 'none',
            }}
          >
            <img src={icon} alt="" style={{ height: 22, width: 22, objectFit: 'contain', flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}