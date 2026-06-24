import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/Product';
import { useInventory } from '../context/InventoryContext';
import { AlertTriangle, Plus, Trash2, X } from 'lucide-react';
import type { ActivityLog } from '../types/ActivityLog';
import IngredientAdjustmentForm from '../features/IngredientAdjustmentForm';
import AdjustmentRequestReviewPanel from '../features/RequestApproval';

import cafeLogo     from '../assets/cafeLogo.png';
import homeIcon    from '../assets/homeIcon.png';
import posIcon     from '../assets/posIcon.png';
import inventoryIcon from '../assets/inventoryIcon.png';
import insightsIcon  from '../assets/insightsIcon.png';
import addIcon     from '../assets/addIcon.png';
import editIcon    from '../assets/editIcon.png';
import deleteIcon  from '../assets/deleteIcon.png';
import adminIcon   from '../assets/adminIcon.png';
import { supabase } from '../supabaseClient';

interface PosTerminalUIProps {
  userRole: string | undefined;
  products: Product[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  actionView: string;
  setActionView: (view: string) => void;

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
  activityLogs?: ActivityLog[]; 
  refetchActivityLogs?: () => void;
  activityFilter?: string; 
  setActivityFilter?: (filter: string) => void; 
  children?: React.ReactNode;

  selectedDeleteIds?: number[];
  setSelectedDeleteIds?: React.Dispatch<React.SetStateAction<number[]>>;
  
  onIngredientRequestSubmit?: (payload: { ingredient_id: number; quantity: number; reason: string }) => Promise<void>;
  userId?: string | number;
  username?: string;
}

export default function PosTerminalUI({
  userRole,
  products,
  activeTab,
  setActiveTab,
  selectedCategory,
  onSelectCategory,
  actionView,
  setActionView,
  productName,
  setProductName,
  productCategory,
  setProductCategory,
  productPrice,
  setProductPrice,
  formError,
  isSubmitting,
  selectedRecipes,
  handleAddIngredientRow,
  handleUpdateRecipeRow,
  handleRemoveRecipeRow,
  handleFormSubmit,
  onProductClick,
  activityLogs,
  refetchActivityLogs,
  children,
  selectedDeleteIds = [], 
  setSelectedDeleteIds,
  userId,
  username,
  activityFilter,
  setActivityFilter,
}: PosTerminalUIProps) {
  const navigate = useNavigate();
  const { ingredients, refreshInventory } = useInventory();

  const isAdmin = userRole?.toLowerCase() === 'admin';

  const categories = ['ALL', 'CLASSICS', 'SIGNATURES', 'NON-COFFEE', 'DESSERTS', 'PASTRIES', 'EXTRAS'];
  const safeProducts = products || [];

  const filteredProducts = selectedCategory === 'ALL' 
    ? safeProducts 
    : safeProducts.filter(p => (p.product_category || '').toUpperCase() === selectedCategory);

  const productsToDelete = safeProducts.filter(p => selectedDeleteIds.includes(p.product_id));

  const [localAdjustmentRequests, setLocalAdjustmentRequests] = useState<any[]>([]);
  const activeUserId = userId && String(userId).trim(); 
  const currentUsername = username || 'You';

  const fetchAdjustmentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_adjustment_requests') 
        .select('request_id, quantity, approval_status, requested_by, ingredient_id, reason')
        .order('request_id', { ascending: false });

      if (error) throw error;

      const requesterIds = Array.from(
        new Set((data || []).map((req: any) => req.requested_by).filter(Boolean))
      );

      let usernameById: Record<string, string> = {};
      if (requesterIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', requesterIds);
        
        if (profilesError) throw profilesError;
        
        usernameById = Object.fromEntries(
          (profilesData || []).map((p: any) => [p.id, p.username])
        );
      }

      const formattedRequests = data.map((req: any) => {
        const matchedIngredient = ingredients.find((ing) => ing.ingredient_id === req.ingredient_id);
        
        return {
          id: req.request_id,
          username: usernameById[req.requested_by] || 'System', 
          ingredient_id: req.ingredient_id,
          ingredient_name: matchedIngredient?.ingredient_name || `Ingredient #${req.ingredient_id}`, 
          quantity: req.quantity,
          reason: req.reason,
          status: req.approval_status || 'pending'
        };
      });

      setLocalAdjustmentRequests(formattedRequests);
    } catch (error) {
      console.error("Error running inventory sync query:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'PRODUCT REQUEST') {
      fetchAdjustmentRequests();
    }
    if (activeTab === 'RECENT ACTIVITY' && refetchActivityLogs) {
      refetchActivityLogs();
    }
  }, [activeTab]);

  const handleNewRequestLogged = (insertedRow: any) => {
    const matchedIngredient = ingredients.find(
      (ing) => ing.ingredient_id === insertedRow.ingredient_id
    );

    setLocalAdjustmentRequests((prev) => [
      {
        id: insertedRow.request_id,
        username: currentUsername,
        ingredient_id: insertedRow.ingredient_id,
        ingredient_name: matchedIngredient?.ingredient_name || `Ingredient #${insertedRow.ingredient_id}`,
        quantity: insertedRow.quantity,
        reason: insertedRow.reason,
        status: insertedRow.approval_status || 'pending'
      },
      ...prev
    ]);
    fetchAdjustmentRequests();
  };

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#D1915F', marginBottom: 4 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #D1915F', fontSize: 13, outline: 'none', color: '#1E1E1E', backgroundColor: '#FFFFFF', boxSizing: 'border-box' };
  const submitBtnStyle: React.CSSProperties = { width: '100%', padding: '15px 0', background: '#D1915F', color: '#FFFFFF', fontWeight: 700, fontSize: 14, borderRadius: 10, border: 'none', cursor: 'pointer', marginTop: 4 };

  const handleRemoveFromDeleteQueue = (id: number) => {
    if (setSelectedDeleteIds) {
      setSelectedDeleteIds(prev => prev.filter(item => item !== id));
    }
  };

  const safeLogs = activityLogs || [];
  const filteredLogs = activityFilter === 'ALL' 
    ? safeLogs 
    : safeLogs.filter(log => log.target === activityFilter);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif", padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} alt="Logo" />
          <h1 style={{ fontFamily: "'Liu Jian Mao Cao', cursive", fontSize: 33, color: '#1E1E1E', lineHeight: 0.85, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            <span>Tita's</span><span>cafe</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 16, background: '#FFFFFF', padding: '6px', borderRadius: 30, border: '2px solid #f2d8c3' }}>
          {['POINT OF SALES', 'RECENT ACTIVITY', 'PRODUCT REQUEST'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: 24, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, letterSpacing: 0.5, transition: 'all 0.2s', backgroundColor: activeTab === tab ? '#faebe0' : 'transparent', color: activeTab === tab ? '#D1915F' : '#D1915F' }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faebe0', padding: '10px 20px', borderRadius: 28, border: '2px solid #f2d8c3', color: '#D1915F', fontWeight: 'bold', fontSize: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Guest'}</span>
        </div>
      </header>

      {activeTab === 'POINT OF SALES' && (
        <main style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, flexGrow: 1, alignItems: 'stretch', marginBottom: 24 }}>
          <section style={{ border: '2px solid #f2d8c3', borderRadius: 12, background: '#FFFFFF', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10, borderBottom: '2px solid #f2d8c3' }}>
              {categories.map(category => (
                <button key={category} onClick={() => onSelectCategory(category)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, whiteSpace: 'nowrap', transition: 'all 0.2s ease', color: selectedCategory === category ? '#D1915F' : '#8A7E72', borderBottom: selectedCategory === category ? '3px solid #D1915F' : '3px solid transparent', paddingBottom: 4 }}>
                  {category}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16, overflowY: 'auto', maxHeight: 500, paddingRight: 8 }}>
              {filteredProducts.map(product => {
                const isSelectedForDeletion = selectedDeleteIds.includes(product.product_id);
                const isSelectedForEditing = actionView === 'edit' && productName && product.product_name === productName;
                
                // 1. Cross-reference live recipes inside the grid loop for LOW STOCK warning thresholds
                let hasLowStock = false;
                if ((product as any).prod_ingredient && (product as any).prod_ingredient.length > 0) {
                  hasLowStock = (product as any).prod_ingredient.some((recipe: any) => {
                    const match = ingredients.find((ing) => ing.ingredient_id === recipe.ingredient_id);
                    return match ? Number(match.stock_quantity) <= Number(match.threshold) : false;
                  });
                } else if (ingredients && ingredients.length > 0) {
                  hasLowStock = ingredients.some((ing) => {
                    const isBelowThreshold = Number(ing.stock_quantity) <= Number(ing.threshold);
                    const isKeywordMatch = product.product_name.toLowerCase().includes(ing.ingredient_name.toLowerCase());
                    return isBelowThreshold && isKeywordMatch;
                  });
                }

                // 2. Checks if stock is 0 OR less than the recipe's standard required portion
                let isInsufficientStock = false;
                if ((product as any).prod_ingredient && (product as any).prod_ingredient.length > 0) {
                  isInsufficientStock = (product as any).prod_ingredient.some((recipe: any) => {
                    const match = ingredients.find((ing) => ing.ingredient_id === recipe.ingredient_id);
                    if (!match) return false;
                    
                    const currentStock = Number(match.stock_quantity);
                    const neededStock = Number(recipe.standard_quantity);
                    
                    return currentStock <= 0 || currentStock < neededStock;
                  });
                } else if (ingredients && ingredients.length > 0) {
                  isInsufficientStock = ingredients.some((ing) => {
                    const isZeroStock = Number(ing.stock_quantity) <= 0;
                    const isKeywordMatch = product.product_name.toLowerCase().includes(ing.ingredient_name.toLowerCase());
                    return isZeroStock && isKeywordMatch;
                  });
                }

                const isCardDisabled = (!product.availability || isInsufficientStock) && actionView !== 'edit' && actionView !== 'delete';

                // FIXED: Changed flags below to read (actionView === 'menu' || actionView === 'order') 
                // This ensures the visual banners stay active inside Take Orders mode!
                const shouldShowStatusBanners = actionView === 'menu' || actionView === 'order';

                return (
                    <button 
                      key={product.product_id} 
                      onClick={() => onProductClick(product)} 
                      disabled={isCardDisabled} 
                      style={{ 
                        background: isSelectedForEditing ? '#faebe0' : '#FFFFFF', 
                        border: isSelectedForDeletion 
                          ? '2px solid #FF2C2C' 
                          : isSelectedForEditing 
                            ? '2px solid #D1915F' 
                            : actionView === 'edit' 
                              ? '2px dashed #D1915F' 
                              : '2px solid #f2d8c3', 
                        borderRadius: 12, 
                        padding: 12, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        cursor: isCardDisabled ? 'not-allowed' : 'pointer', 
                        opacity: isCardDisabled ? 0.35 : 1, 
                        transition: 'all 0.1s ease', 
                        boxSizing: 'border-box',
                        boxShadow: isSelectedForDeletion ? '0 4px 12px rgba(255, 44, 44, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
                        transform: (isSelectedForDeletion || isSelectedForEditing) ? 'scale(0.97)' : 'none'
                      }}
                    >
                    <div style={{ width: 60, height: 80, backgroundColor: '#F9F8F6', borderRadius: 8, marginBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                      {isSelectedForDeletion && <div style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#FF2C2C', color: '#FFF', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', zIndex: 5 }}>✖</div>}
                      {product.image_url ? <img src={product.image_url} alt={product.product_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 24 }}>☕</span>}
                      
                      {/* CONDITIONAL BACKDROP TEXT BANNER */}
                      {isInsufficientStock && shouldShowStatusBanners ? (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(30, 30, 30, 0.9)',
                          color: '#FFFFFF',
                          fontSize: '9px',
                          fontWeight: 800,
                          textAlign: 'center',
                          padding: '3px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          zIndex: 3
                        }}>
                          SOLD OUT
                        </div>
                      ) : hasLowStock && shouldShowStatusBanners ? (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(220, 38, 38, 0.9)',
                          color: '#FFFFFF',
                          fontSize: '9px',
                          fontWeight: 800,
                          textAlign: 'center',
                          padding: '3px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          zIndex: 3
                        }}>
                          LOW STOCK
                        </div>
                      ) : null}
                    </div>
                    <span style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 700, color: '#D1915F', textAlign: 'center', lineHeight: 1.2, marginBottom: 4, height: 26, overflow: 'hidden' }}>{product.product_name}</span>
                    <span style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 800, color: '#D1915F' }}>₱ {Number(product.product_price).toFixed(2)} </span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column' }}>
            {actionView === 'delete' ? (
              <div style={{ background: '#FFFFFF', border: '2px solid #FFC1C1', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FF2C2C' }}>DELETE PRODUCTS</h3>
                  <button type="button" onClick={() => { setActionView('menu'); if(setSelectedDeleteIds) setSelectedDeleteIds([]); }} style={{ background: 'none', border: 'none', color: '#8A7E72', cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}>Cancel</button>
                </div>
                <div style={{ background: '#FFF0F0', color: '#C53030', fontSize: 12, padding: '10px 12px', borderRadius: 10, fontWeight: 600, border: '2px solid #C53030' }}>🚨 Multi-select active. Select cards on the left grid to queue them for permanent extraction.</div>
                {formError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: 10, borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center' }}><AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} /><span>{formError}</span></div>}
                <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {productsToDelete.length === 0 ? <div style={{ textAlign: 'center', color: '#A0AEC0', fontSize: 13, marginTop: 40, fontStyle: 'italic' }}>No items currently queued.</div> : productsToDelete.map((prod) => (
                    <div key={prod.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '10px 14px', borderRadius: 10, border: '1px solid #FFD8D8' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={{ fontSize: 13, fontWeight: 700, color: '#1E1E1E' }}>{prod.product_name}</span><span style={{ fontSize: 12, fontWeight: 600, color: '#FF2C2C' }}>₱ {Number(prod.product_price).toFixed(2)}</span></div>
                      <button type="button" onClick={() => handleRemoveFromDeleteQueue(prod.product_id)} style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', padding: 4 }}><X style={{ width: 16, height: 16 }} /></button>
                    </div>
                  ))}
                </div>
                <button type="button" disabled={isSubmitting || productsToDelete.length === 0} onClick={handleFormSubmit} style={{ ...submitBtnStyle, background: productsToDelete.length === 0 ? '#E2E8F0' : isSubmitting ? '#B0A89E' : '#FF2C2C', color: productsToDelete.length === 0 ? '#A0AEC0' : '#FFF' }}>{isSubmitting ? 'DELETING SELECTED...' : `CONFIRM REMOVAL (${productsToDelete.length})`}</button>
              </div>
            ) : actionView === 'add' || actionView === 'edit' ? (
              <div style={{ background: '#FFFFFF', border: '2px solid #f2d8c3', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', position: 'relative', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#D1915F', textTransform: 'uppercase' }}>{actionView === 'edit' ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                  <button type="button" onClick={() => setActionView('menu')} style={{ background: 'none', border: 'none', color: '#8A7E72', cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}>Cancel</button>
                </div>
                
                {actionView === 'edit' && !productName && <div style={{ background: '#FFFBEB', border: '2px solid #FDE68A', color: '#B45309', fontSize: 11, padding: '10px 12px', borderRadius: 10, textAlign: 'center', fontWeight: 600 }}>💡 Tap any catalog product card on the left to pre-fill its form fields.</div>}
                {formError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: 10, borderRadius: 10, display: 'flex', gap: 6, alignItems: 'center' }}><AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} /><span>{formError}</span></div>}
                
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, flexGrow: 1 }}>
                  <div><label style={labelStyle}>Product Name</label><input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g., Latte" style={inputStyle} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><label style={labelStyle}>Category</label><select value={productCategory} onChange={e => setProductCategory(e.target.value)} style={inputStyle}><option value="Classics">Classics</option><option value="Signatures">Signatures</option><option value="Non-Coffee">Non-Coffee</option><option value="Desserts">Desserts</option><option value="Pastries">Pastries</option><option value="Extras">Extras</option></select></div>
                    <div><label style={labelStyle}>Price (PHP)</label><input type="number" step="0.01" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="150.00" style={inputStyle} /></div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #D3C9BE', paddingTop: 10, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Recipe Ingredients</label>
                      <button type="button" onClick={handleAddIngredientRow} style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#D1915F', color: '#FFF', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}><Plus style={{ width: 12, height: 14 }} /> Add</button>
                    </div>
                    <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 180, display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }}>
                      {selectedRecipes.map((row, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 4, alignItems: 'center', background: '#FFF', padding: 6, borderRadius: 8, border: '2px solid #f2d8c3' }}>
                          <select value={row.ingredient_id} onChange={e => handleUpdateRecipeRow(idx, { ingredient_id: parseInt(e.target.value) })} style={{ ...inputStyle, padding: '4px', fontSize: 12 }}>
                            {ingredients.map(ing => <option key={ing.ingredient_id} value={ing.ingredient_id}>{ing.ingredient_name}</option>)}
                          </select>
                          <input type="number" step="0.1" value={Number.isNaN(row.standard_quantity) ? '' : row.standard_quantity} onChange={e => { const val = parseFloat(e.target.value); handleUpdateRecipeRow(idx, { standard_quantity: Number.isNaN(val) ? NaN : val }); }} style={{ ...inputStyle, padding: '4px', fontSize: 12 }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#8A7E72', textAlign: 'center' }}>{row.standard_measurement_unit}</span>
                          <button type="button" onClick={() => handleRemoveRecipeRow(idx)} style={{ background: 'none', border: 'none', color: '#FF2C2C', cursor: 'pointer', padding: 2 }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} style={{ ...submitBtnStyle, background: isSubmitting ? '#B0A89E' : actionView === 'edit' ? '#D1915F' : '#09AA29' }}>{isSubmitting ? 'SAVING CHANGES...' : actionView === 'edit' ? 'CONFIRM AND UPDATE' : 'CONFIRM AND PUBLISH'}</button>
                </form>
              </div>
            ) : isAdmin && actionView === 'menu' ? (
              <div style={{ background: '#ffffff', border: '2px solid #f2d8c3', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                <button onClick={() => setActionView('add')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', cursor: 'pointer' }}><div style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={addIcon} alt="Add" style={{ width: 24, height: 24 }} /></div><span style={{ fontSize: 20, fontWeight: 800, color: '#D1915F' }}>ADD</span></button>
                <button onClick={() => setActionView('edit')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', cursor: 'pointer' }}><div style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #D1915F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={editIcon} alt="Edit" style={{ width: 24, height: 24 }} /></div><span style={{ fontSize: 20, fontWeight: 800, color: '#D1915F' }}>EDIT</span></button>
                <button onClick={() => setActionView('delete')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', cursor: 'pointer' }}><div style={{ width: 45, height: 45, borderRadius: '50%', border: '2px solid #FF2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={deleteIcon} alt="Delete" style={{ width: 24, height: 24 }} /></div><span style={{ fontSize: 20, fontWeight: 800, color: '#FF4A4A' }}>DELETE</span></button>
                
                <hr style={{ border: 'none', borderTop: '2px solid #f2d8c3', margin: '4px 0' }} />
                
                <button onClick={() => setActionView('order')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: '#D1915F', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(209, 145, 95, 0.2)' }}>
                  <div style={{ width: 45, height: 45, borderRadius: '50%', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 22 }}>🛒</span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>TAKE ORDERS</span>
                </button>
              </div>
            ) : actionView === 'order' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                <button onClick={() => setActionView('menu')} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#8A7E72', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>← Back to Menu</button>
                <div style={{ flexGrow: 1, height: '100%' }}>{children}</div>
              </div>
            ) : (
              <div style={{ flexGrow: 1, height: '100%' }}>{children}</div>
            )}
          </aside>
        </main>
      )}
             
      {activeTab === 'RECENT ACTIVITY' && (
        <main style={{ 
           flexGrow: 1, 
           height: '0px', 
           minHeight: 'calc(102.5vh - 270px)', 
           maxHeight: 'calc(102.5vh - 270px)',
           background: '#FFFFFF', 
           borderRadius: 12, 
           border: '2px solid #f2d8c3', 
           marginBottom: 24, 
           display: 'flex', 
           flexDirection: 'column', 
           overflow: 'hidden' 
        }}>
          <div style={{ background: '#faebe0', padding: '12px 20px', borderBottom: '2px solid #f2d8c3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#D1915F', textTransform: 'uppercase' }}>
              RECENT ACTIVITY
            </h2>
            
            {setActivityFilter && (
              <select 
                value={activityFilter} 
                onChange={(e) => setActivityFilter(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '2px solid #f2d8c3', backgroundColor: '#FFFFFF',
                  fontSize: 12, fontWeight: 600, color: '#8A7E72', cursor: 'pointer', outline: 'none'
                }}
              >
                <option value="ALL">All Activities</option>
                <option value="Transactions">Transactions</option>
                <option value="User Authentication">Logins / Auth</option>
                <option value="products">Products</option>
                <option value="Inventory">Inventory</option>
              </select>
            )}
          </div>

          <div style={{ 
             display: 'grid', 
             gridTemplateColumns: '80px 80px 1fr 1fr 200px', 
             padding: '12px 20px', 
             background: '#FFFFFF', 
             borderBottom: '2px solid #f2d8c3', 
             fontSize: 12, 
             fontWeight: 600, 
             color: '#D1915F',
             marginTop: '3px',
           }}>
            <span style={{ textAlign: 'center' }}>User ID</span>
            <span style={{ textAlign: 'center' }}>Log ID</span>
            <span>Activity</span>
            <span>Target</span>
            <span style={{ textAlign: 'center' }}>Timestamp</span>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', paddingTop: '12px' }}>
            {filteredLogs.map((log, index) => (
              <div key={index} style={{ 
                 display: 'grid', gridTemplateColumns: '80px 80px 1fr 1fr 200px', 
                 padding: '16px 20px', borderBottom: '2px solid #f2e4d9',
                fontSize: 13, color: '#8A7E72', alignItems: 'center'
              }}>
                <span style={{ textAlign: 'center' }}>{log.user_id}</span>
                <span style={{ textAlign: 'center' }}>{log.log_id || '--'}</span>
                <span>{log.activity}</span>
                <span>{log.target}</span>
                <span style={{ textAlign: 'right' }}>
                  {new Date(log.created_at).toLocaleString('en-CA', { hour12: false }).replace(',', '')}
                </span>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#A39BA6', fontStyle: 'italic', fontSize: 14 }}>
                No recent activity logs found for this filter.
              </div>
            )}
          </div>
        </main>
      )}

      {activeTab === 'PRODUCT REQUEST' && (
        <main style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 360px', 
            gap: 24, 
            flexGrow: 1, 
            alignItems: 'stretch', 
            marginBottom: 24,
            height: '0px', 
            minHeight: 'calc(102.5vh - 270px)', 
            maxHeight: 'calc(102.5vh - 270px)'
          }}>
          <section style={{ 
              border: '2px solid #f2d8c3', 
              borderRadius: 12, 
              background: '#FFFFFF', 
              padding: 24, 
              display: 'flex', 
              flexDirection: 'column', 
              boxSizing: 'border-box', 
              minWidth: 0, 
              height: '100%',
              overflow: 'hidden' 
            }}>
            <div style={{ paddingBottom: 16, borderBottom: '2px solid #f2d8c3', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#D1915F', textTransform: 'uppercase', letterSpacing: 0.5 }}>Logged Ingredient Requests</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#8A7E72' }}>Reviewing system reconciliation data and operational queue logs.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '10px 16px', background: '#faebe0', borderRadius: '8px 8px 0 0', fontSize: 11, fontWeight: 700, color: '#D1915F', textTransform: 'uppercase', border: '2px solid #f2d8c3', borderBottom: 'none' }}>
              <span>Req No.</span><span>Requested By</span><span>Item</span><span>Quantity Change</span><span style={{ textAlign: 'center' }}>Status</span>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', maxWidth: '100%', border: '2px solid #f2d8c3', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
              {localAdjustmentRequests && localAdjustmentRequests.length > 0 ? (
                localAdjustmentRequests.map((req, idx) => {
                  const rowKey = req.id !== null && req.id !== undefined ? req.id : `fallback-key-${idx}`;
                  const statusLower = req.status?.toLowerCase() || 'pending';
                  const badgeBg = statusLower === 'pending' ? '#FEF3C7' : statusLower === 'rejected' ? '#FEE2E2' : '#DCFCE7';
                  const badgeText = statusLower === 'pending' ? '#D97706' : statusLower === 'rejected' ? '#DC2626' : '#15803D';
                  
                  return (
                    <div key={rowKey} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '14px 16px', borderBottom: '1px solid #f2d8c3', fontSize: 13, color: '#1E1E1E', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#8A7E72' }}>#{req.id ?? '--'}</span>
                      <span style={{ textTransform: 'capitalize' }}>{req.username || 'System'}</span>
                      <span style={{ fontWeight: 700 }}>{req.ingredient_name || `ID: ${req.ingredient_id}`}</span>
                      <span style={{ color: req.quantity < 0 ? '#FF2C2C' : '#09AA29', fontWeight: 600 }}>{req.quantity > 0 ? `+${req.quantity}` : req.quantity}</span>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: badgeBg, color: badgeText }}>{req.status || 'Pending'}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#8A7E72', fontStyle: 'italic', fontSize: 13 }}>No recorded adjustment logs in session view.</div>
              )}
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', width: '360px', minWidth: '360px', boxSizing: 'border-box', height: '100%' }}>
            {userRole === 'admin' ? (
              <AdjustmentRequestReviewPanel 
                requests={localAdjustmentRequests} 
                userId={activeUserId} 
                onReviewed={async () => {
                  await fetchAdjustmentRequests(); // 1. Refresh the pending list
                  await refreshInventory();        // 2. 🌟 INSTANTLY REFRESH THE INVENTORY!
                }} 
              />
            ) : (
              <IngredientAdjustmentForm 
                ingredients={ingredients} 
                userId={activeUserId} 
                onSuccess={handleNewRequestLogged} 
              /> 
            )}
          </aside>
        </main>
      )}

      <nav style={{ background: '#ffffff', borderRadius: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6, width: '100%', boxSizing: 'border-box', border: '2px solid #f2d8c3', marginTop: 16 }}>
        {[
          { label: 'HOME',         icon: homeIcon,      path: '/home',      active: false },
          { label: 'POINT OF SALES', icon: posIcon,       path: '/pos',       active: true  },
          { label: 'INVENTORY',      icon: inventoryIcon, path: '/inventory', active: false },
          { label: 'INSIGHTS',       icon: insightsIcon,  path: '/insights',  active: false },
        ].map(({ label, icon, path, active }) => (
          <button key={label} type="button" onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, margin: '0 4px', padding: '14px 22px', borderRadius: 28, cursor: 'pointer', color: '#D1915F', fontWeight: 700, fontSize: 14, transition: 'all 0.2s ease-in-out', border: active ? '2px solid #f2d8c3' : '2px solid transparent', background: active ? '#FFFFFF' : 'transparent', boxShadow: active ? '0 1px 4px #f2d8c3' : 'none' }}>
            <img src={icon} alt="" style={{ height: 22, width: 22, objectFit: 'contain', flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}