import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/Product';
import { useInventory } from '../context/InventoryContext';
// FIXED: Removed the unused ShoppingCart import to keep compilation clean
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import cafeLogo    from '../assets/cafeLogo.png';
import homeIcon    from '../assets/homeIcon.png';
import posIcon     from '../assets/posIcon.png';
import inventoryIcon from '../assets/inventoryIcon.png';
import insightsIcon  from '../assets/insightsIcon.png';
import addIcon     from '../assets/addIcon.png';
import editIcon    from '../assets/editIcon.png';
import deleteIcon  from '../assets/deleteIcon.png';
import adminIcon   from '../assets/adminIcon.png';

interface PosTerminalUIProps {
  userRole: string | undefined;
  products: Product[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  actionView: string;
  setActionView: (view: string) => void;
  
  // Logical Render Form Prop Mappings
  productName: string;
  setProductName: (v: string) => void;
  productCategory: string;
  setProductCategory: (v: string) => void;
  productPrice: string;
  setProductPrice: (v: string) => void;
  formError: string;
  isSubmitting: boolean;
  selectedRecipes: any[];
  handleAddIngredientRow: () => void;
  handleUpdateRecipeRow: (index: number, fields: any) => void;
  handleRemoveRecipeRow: (index: number) => void;
  handleFormSubmit: (e: React.FormEvent) => void;

  onProductClick: (product: Product) => void;
  children?: React.ReactNode;
}

export default function PosTerminalUI({
  userRole, products, activeTab, setActiveTab, selectedCategory, onSelectCategory,
  actionView, setActionView, productName, setProductName, productCategory, setProductCategory,
  productPrice, setProductPrice, formError, isSubmitting, selectedRecipes,
  handleAddIngredientRow, handleUpdateRecipeRow, handleRemoveRecipeRow, handleFormSubmit,
  onProductClick, children
}: PosTerminalUIProps) {
  
  const navigate = useNavigate();
  const { ingredients } = useInventory();
  const isAdmin = userRole?.toLowerCase() === 'admin';
  
  // Adjusted to match uppercase checking for your frontend tabs, while select dropdown options handle database capitalization mapping
  const categories = ['ALL', 'CLASSICS', 'SIGNATURES', 'NON-COFFEE', 'DESSERTS', 'PASTRIES', 'EXTRAS'];

  const safeProducts = products || [];
  const filteredProducts = selectedCategory === 'ALL' 
    ? safeProducts 
    : safeProducts.filter(p => (p.product_category || '').toUpperCase() === selectedCategory);

  // Styled design variables matched back to your system aesthetic rules
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#D1915F', marginBottom: 4 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #D1915F', fontSize: 13, outline: 'none', color: '#1E1E1E', backgroundColor: '#FFFFFF', boxSizing: 'border-box' };
  const submitBtnStyle: React.CSSProperties = { width: '100%', padding: '15px 0', background: '#D1915F', color: '#FFFFFF', fontWeight: 700, fontSize: 14, borderRadius: 10, border: 'none', cursor: 'pointer', marginTop: 4 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif", padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} alt="Logo" />
          <h1 style={{ fontFamily: "'Liu Jian Mao Cao', cursive", fontSize: 33, color: '#1E1E1E', lineHeight: 0.85, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            <span>Tita's</span><span>cafe</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 16, background: '#FFFFFF', padding: '6px', borderRadius: 30, border: '1px solid #D3C9BE' }}>
          {['POINT OF SALES', 'TRANSACTIONS', 'RECENT ACTIVITY'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: 24, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, letterSpacing: 0.5, transition: 'all 0.2s', backgroundColor: activeTab === tab ? '#F1F1F1' : 'transparent', color: activeTab === tab ? '#1E1E1E' : '#8A7E72' }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', padding: '12px 20px', borderRadius: 28, border: '1px solid #D3C9BE', color: '#D1915F', fontWeight: 'bold', fontSize: 16, textTransform: 'capitalize' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Guest'}</span>
        </div>
      </header>

      {/* CONDITIONAL MAIN WORKSPACE */}
      {activeTab === 'POINT OF SALES' && (
        <main style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, flexGrow: 1, alignItems: 'stretch', marginBottom: 24 }}>
          
          <section style={{ border: '1px solid #D3D3D3', borderRadius: 12, background: '#FFFFFF', padding: 24, boxShadow: '0 4px 40px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10, borderBottom: '2px solid #F1F1F1' }}>
              {categories.map(category => (
                <button key={category} onClick={() => onSelectCategory(category)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, whiteSpace: 'nowrap', transition: 'all 0.2s ease', color: selectedCategory === category ? '#1E1E1E' : '#A39BA6', borderBottom: selectedCategory === category ? '3px solid #D1915F' : '3px solid transparent', paddingBottom: 4 }}>
                  {category}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16, overflowY: 'auto', maxHeight: 500, paddingRight: 8 }}>
              {filteredProducts.map(product => (
                <button key={product.product_id} onClick={() => onProductClick(product)} disabled={!product.availability} style={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: product.availability ? 'pointer' : 'not-allowed', opacity: product.availability ? 1 : 0.5, transition: 'transform 0.1s ease, box-shadow 0.1s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} onMouseEnter={e => { if(product.availability) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}} onMouseLeave={e => { if(product.availability) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}}>
                  <div style={{ width: 60, height: 80, backgroundColor: '#F9F8F6', borderRadius: 8, marginBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {product.image_url ? <img src={product.image_url} alt={product.product_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 24 }}>🥤</span>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1E1E1E', textAlign: 'center', lineHeight: 1.2, marginBottom: 4, height: 26, overflow: 'hidden' }}>{product.product_name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#D1915F' }}>  ₱ {Number(product.product_price).toFixed(2)} </span>
                </button>
              ))}
            </div>
          </section>

          {/* RIGHT SIDEBAR WRAPPER PANEL */}
          <aside style={{ display: 'flex', flexDirection: 'column' }}>
            {actionView === 'add' ? (
              // PHYSICAL THEME RENDERING FOR THE ADD PRODUCT INTERFACE FORM
              <div style={{ background: '#F9F8F6', border: '1px solid #D1915F', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', position: 'relative', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1E1E1E' }}>ADD MENU ITEM</h3>
                  <button type="button" onClick={() => setActionView('menu')} style={{ background: 'none', border: 'none', color: '#8A7E72', cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}>Cancel</button>
                </div>

                {formError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: 10, borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1 }}>
                  <div>
                    <label style={labelStyle}>Product Name</label>
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., Latte" style={inputStyle} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={labelStyle}>Category</label>
                      {/* FIXED: Dropdown values mapped out to align directly with your exact case-sensitive Supabase Enum labels */}
                      <select value={productCategory} onChange={e => setProductCategory(e.target.value)} style={inputStyle}>
                        <option value="Classics">Classics</option>
                        <option value="Signatures">Signatures</option>
                        <option value="Non-Coffee">Non-Coffee</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Pastries">Pastries</option>
                        <option value="Extras">Extras</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Price (PHP)</label>
                      <input type="number" step="0.01" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="150.00" style={inputStyle} />
                    </div>
                  </div>

                  {/* RECIPE INGREDIENT ROW ROW MANIPULATION MAPPER TABLE BLOCK */}
                  <div style={{ borderTop: '1px solid #D3C9BE', paddingTop: 10, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Recipe Ingredients</label>
                      <button type="button" onClick={handleAddIngredientRow} style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#D1915F', color: '#FFF', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                        <Plus style={{ width: 12, height: 14 }} /> Add
                      </button>
                    </div>

                    <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 180, display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }}>
                      {selectedRecipes.map((row, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 4, alignItems: 'center', background: '#FFF', padding: 6, borderRadius: 8, border: '1px solid #D3C9BE' }}>
                          <select value={row.ingredient_id} onChange={e => handleUpdateRecipeRow(idx, { ingredient_id: parseInt(e.target.value) })} style={{ ...inputStyle, padding: '4px', fontSize: 12 }}>
                            {ingredients.map(ing => (
                              <option key={ing.ingredient_id} value={ing.ingredient_id}>{ing.ingredient_name}</option>
                            ))}
                          </select>
                          {/* FIXED: Included safe evaluation to cast NaN inputs back to empty tracking metrics so the user can backspace smoothly */}
                          <input 
                            type="number" 
                            step="0.1" 
                            value={Number.isNaN(row.standard_quantity) ? '' : row.standard_quantity} 
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              handleUpdateRecipeRow(idx, { standard_quantity: Number.isNaN(val) ? NaN : val });
                            }} 
                            style={{ ...inputStyle, padding: '4px', fontSize: 12 }} 
                          />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#8A7E72', textAlign: 'center' }}>{row.standard_measurement_unit}</span>
                          <button type="button" onClick={() => handleRemoveRecipeRow(idx)} style={{ background: 'none', border: 'none', color: '#FF2C2C', cursor: 'pointer', padding: 2 }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} style={{ ...submitBtnStyle, background: isSubmitting ? '#B0A89E' : '#09AA29' }}>
                    {isSubmitting ? 'SAVING ITEM...' : 'CONFIRM AND PUBLISH'}
                  </button>
                </form>
              </div>
            ) : isAdmin ? (
              <div style={{ background: '#F9F8F6', border: '1px solid #D1915F', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#D1915F', margin: '0 0 8px 0', textTransform: 'uppercase', textAlign: 'center' }}>Actions</h2>
                <button onClick={() => setActionView('add')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #D1915F', cursor: 'pointer', transition: 'transform 0.1s ease' }}>
                  <div style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={addIcon} alt="Add" style={{ width: 24, height: 24 }} /></div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#D1915F' }}>ADD</span>
                </button>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #D1915F', cursor: 'pointer', transition: 'transform 0.1s ease' }}>
                  <div style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={editIcon} alt="Edit" style={{ width: 24, height: 24 }} /></div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#D1915F' }}>EDIT</span>
                </button>
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #FF2C2C', cursor: 'pointer', transition: 'transform 0.1s ease' }}>
                  <div style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #FF2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={deleteIcon} alt="Delete" style={{ width: 24, height: 24 }} /></div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#FF4A4A' }}>DELETE</span>
                </button>
              </div>
            ) : (
              <div style={{ flexGrow: 1, height: '100%' }}>{children}</div>
            )}
          </aside>
        </main>
      )}

      {/* Placeholders for other Top Nav Tabs */}
      {activeTab === 'TRANSACTIONS' && (
        <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F1F1', borderRadius: 12, border: '1px solid #D3D3D3', marginBottom: 24 }}>
          <h2 style={{ color: '#8A7E72' }}>Transactions Module Pending...</h2>
        </main>
      )}
      {activeTab === 'RECENT ACTIVITY' && (
        <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F1F1', borderRadius: 12, border: '1px solid #D3D3D3', marginBottom: 24 }}>
          <h2 style={{ color: '#8A7E72' }}>Recent Activity Module Pending...</h2>
        </main>
      )}

      {/* FOOTER */}
      <nav style={{ background: '#f1f1f1', borderRadius: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6, boxShadow: '0 4px 40px #ccbfbf', width: '100%', boxSizing: 'border-box', border: '1px solid #D3C9BE' }}>
        {[
          { label: 'HOME',           icon: homeIcon,      path: '/home',      active: false },
          { label: 'POINT OF SALES', icon: posIcon,       path: '/pos',       active: true  },
          { label: 'INVENTORY',      icon: inventoryIcon, path: '/inventory', active: false },
          { label: 'INSIGHTS',       icon: insightsIcon,  path: '/insights',  active: false },
        ].map(({ label, icon, path, active }) => (
          <button key={label} type="button" onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, margin: '0 4px', padding: '14px 22px', borderRadius: 28, cursor: 'pointer', color: '#D1915F', fontWeight: 700, fontSize: 14, transition: 'all 0.2s ease-in-out', border: active ? '1px solid #D3C9BE' : '1px solid transparent', background: active ? '#FFFFFF' : 'transparent', boxShadow: active ? '0 2px 4px #ccbfbf' : 'none' }}>
            <img src={icon} alt="" style={{ height: 22, width: 22, objectFit: 'contain', flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}