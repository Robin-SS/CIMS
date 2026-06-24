import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts, ProductService } from '../services/ProductService'; 
import { useActivityLogs, ActivityService } from '../services/ActivityService'; 
import PosTerminalUI from '../components/PosTerminalUI';
import OrderSummary, { type OrderItem } from '../features/OrderSummary';
import AddProductForm from '../features/AddProductForm'; 
import EditProductForm from '../features/EditProductForm'; 
import type { Product } from '../types/Product';
import { useInventory } from '../context/InventoryContext'; 
import { supabase } from '../supabaseClient'; 

export default function PosTerminal() {
  const { user } = useAuth();
  
  const { products, isLoading, error, refetch: refetchProducts } = useProducts(); 
  const { logs, refetch: refetchLogs } = useActivityLogs(); 
  
  const [activeTab, setActiveTab] = useState<string>('POINT OF SALES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionView, setActionView] = useState<string>('menu'); 
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  
  // 🌟 NEW state metrics for the secondary confirmation step
  const [showFinalConfirm, setShowFinalConfirm] = useState<boolean>(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const { ingredients, refreshInventory } = useInventory(); 

  const handleProductClick = (product: Product) => {
    if (actionView === 'delete') {
      setSelectedDeleteIds((prev) => 
        prev.includes(product.product_id)
          ? prev.filter(id => id !== product.product_id) 
          : [...prev, product.product_id]                
      );
      return;
    }

    if (actionView === 'edit') {
      setSelectedProductId(product.product_id);
      return;
    }

    if (user?.role === 'admin' && actionView === 'menu') return;

    if ((product as any).prod_ingredient && ingredients) {
      const lowStockIngredientAlerts: string[] = [];

      (product as any).prod_ingredient.forEach((recipe: any) => {
        const match = ingredients.find((ing) => ing.ingredient_id === recipe.ingredient_id);
        if (match) {
          const currentStock = Number(match.stock_quantity);
          const thresholdLimit = Number(match.threshold);

          if (currentStock <= 0) {
            lowStockIngredientAlerts.push(`• ${match.ingredient_name}: OUT OF STOCK (Current: 0)`);
          } else if (currentStock <= thresholdLimit) {
            lowStockIngredientAlerts.push(`• ${match.ingredient_name}: REACHED THRESHOLD (Current: ${currentStock} / Min: ${thresholdLimit})`);
          }
        }
      });

      if (lowStockIngredientAlerts.length > 0) {
        alert(
          `⚠️ STOCK WARNING for "${product.product_name}"\n\n` +
          `The following ingredients are below safe levels:\n` +
          `${lowStockIngredientAlerts.join('\n')}\n\n` +
          `Click OK to proceed with adding this item to the order.`
        );
      }
    }

    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.product_id === product.product_id);
      if (existingItem) {
        return prevItems.map((item) => 
          item.product.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setOrderItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product.product_id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter((item) => item.quantity > 0);
    });
  };

  const handleCloseEditMode = () => {
    setActionView('menu');
    setSelectedProductId(null);
  };

  const handleConfirmBatchDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    if (selectedDeleteIds.length === 0) return;
    
    setDeleteError('');
    setIsDeleting(true);
    
    const { success, error: err } = await ProductService.deleteProductsBatch(selectedDeleteIds, user?.user_id);
    
    setIsDeleting(false);

    if (!success) {
      setDeleteError(err?.message || 'Failed to complete batch catalog cleanup.');
    } else {
      setSelectedDeleteIds([]);
      setActionView('menu');
      refetchProducts(); 
    }
  };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
    setShowFinalConfirm(false);
    setPendingPaymentMethod('');
  };

  // 🌟 MODIFIED step 1: Stage payment option and route view to confirmation sub-panel
  const handleSelectPaymentMethod = (paymentMethod: string) => {
    setPendingPaymentMethod(paymentMethod);
    setShowFinalConfirm(true);
  };

  // 🌟 MODIFIED step 2: Executes the transactional queries after confirmation
  const handleConfirmPaymentExecution = async () => {
    if (!user || orderItems.length === 0 || !pendingPaymentMethod) return;

    setIsProcessingPayment(true);
    const totalBill = orderItems.reduce((sum, item) => sum + (Number(item.product.product_price) * item.quantity) * 1.12, 0);
    
    const itemsForDb = orderItems.map(item => ({
      product_id: item.product.product_id,
      quantity: item.quantity
    }));

    try {
      const { error: rpcError } = await supabase.rpc('process_order_and_deduct_stock', {
        p_user_id: user.user_id,
        p_items: itemsForDb,
        p_payment_method: pendingPaymentMethod,
        p_amount_paid: totalBill
      });

      if (rpcError) {
        alert('Error processing order: ' + rpcError.message);
        setIsProcessingPayment(false);
        return;
      }

      await ActivityService.logAction(
        user.id, 
        `Processed Order via ${pendingPaymentMethod} (Total: Php ${totalBill.toFixed(2)})`, 
        'Transactions'
      );

      setOrderItems([]);
      setIsPaymentModalOpen(false);
      setShowFinalConfirm(false);
      setPendingPaymentMethod('');
      refetchLogs();
      await refreshInventory(); 

      alert(`Order processed successfully using ${pendingPaymentMethod}! Inventory updated.`);
    } catch (err: any) {
      alert('Unexpected transaction failure: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleResetModalLayout = () => {
    setIsPaymentModalOpen(false);
    setShowFinalConfirm(false);
    setPendingPaymentMethod('');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F9F8F6', color: '#D1915F', fontFamily: "'Inter', sans-serif" }}>
        <h2>Loading Menu Catalog...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FEF2F2', color: '#B91C1C', fontFamily: "'Inter', sans-serif" }}>
        <h2>Database Error: {error}</h2>
      </div>
    );
  }

  const grandTotalAmount = orderItems.reduce((sum, item) => sum + (Number(item.product.product_price) * item.quantity) * 1.12, 0);

  return (
    <AddProductForm onClose={() => setActionView('menu')} onRefreshCatalog={refetchProducts}>
      {(addProps) => (
        <EditProductForm productId={selectedProductId || 0} onClose={handleCloseEditMode} onRefreshCatalog={refetchProducts}>
          {(editProps) => {
            const isEditingItem = actionView === 'edit' && selectedProductId !== null;
            return (
              <>
                <PosTerminalUI
                  userRole={user?.role}
                  userId={user?.user_id}
                  username={user?.username}
                  products={products}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onProductClick={handleProductClick}
                  actionView={actionView}
                  setActionView={setActionView}
                  activityLogs={logs} 
                  refetchActivityLogs={refetchLogs}
                  activityFilter={activityFilter}
                  setActivityFilter={setActivityFilter}
                  productName={isEditingItem ? editProps.productName : addProps.productName}
                  setProductName={isEditingItem ? editProps.setProductName : addProps.setProductName}
                  productCategory={isEditingItem ? editProps.productCategory : addProps.productCategory}
                  setProductCategory={isEditingItem ? editProps.setProductCategory : addProps.setProductCategory}
                  productPrice={isEditingItem ? editProps.productPrice : addProps.productPrice}
                  setProductPrice={isEditingItem ? editProps.setProductPrice : addProps.setProductPrice}
                  formError={actionView === 'delete' ? deleteError : (isEditingItem ? editProps.formError : addProps.formError)}
                  isSubmitting={actionView === 'delete' ? isDeleting : (isEditingItem ? editProps.isSubmitting : addProps.isSubmitting)}
                  selectedRecipes={isEditingItem ? editProps.selectedRecipes : addProps.selectedRecipes}
                  handleAddIngredientRow={isEditingItem ? editProps.handleAddIngredientRow : addProps.handleAddIngredientRow}
                  handleUpdateRecipeRow={isEditingItem ? editProps.handleUpdateRecipeRow : addProps.handleUpdateRecipeRow}
                  handleRemoveRecipeRow={isEditingItem ? editProps.handleRemoveRecipeRow : addProps.handleRemoveRecipeRow}
                  handleFormSubmit={actionView === 'delete' ? handleConfirmBatchDelete : isEditingItem ? editProps.handleFormSubmit : addProps.handleFormSubmit}
                  selectedDeleteIds={selectedDeleteIds}
                  setSelectedDeleteIds={setSelectedDeleteIds}
                >
                  <OrderSummary 
                    orderItems={orderItems} 
                    onUpdateQuantity={handleUpdateQuantity} 
                    onCheckout={handleOpenPaymentModal} 
                    ingredients={ingredients}
                  />
                </PosTerminalUI>

                {/* MODIFIED COMPOSABLE MODAL DIALOG CONTAINER */}
                {isPaymentModalOpen && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: '#FFFFFF', padding: 32, borderRadius: 16, width: 420, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontFamily: "'Inter', sans-serif" }}>
                      
                      {!showFinalConfirm ? (
                        <>
                          {/* STAGE A: SELECT PAYMENT METHOD VIEW (Matching Screenshot 2026-06-24 at 5.02.26 PM.jpg) */}
                          <h2 style={{ margin: 0, color: '#D1915F', fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: -0.5 }}>SELECT PAYMENT METHOD</h2>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <button onClick={() => handleSelectPaymentMethod('Cash')} style={{ padding: '20px 16px', background: '#faebe0', border: '2px solid #f2d8c3', borderRadius: 12, color: '#D1915F', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}><span>💵 CASH</span></button>
                            <button onClick={() => handleSelectPaymentMethod('Card/E-Wallet')} style={{ padding: '20px 16px', background: '#faebe0', border: '2px solid #f2d8c3', borderRadius: 12, color: '#D1915F', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}><span>💳 CARD</span></button>
                          </div>
                          <button onClick={handleResetModalLayout} style={{ padding: '12px 16px', background: '#FFFFFF', border: '2px solid #f2d8c3', color: '#D1915F', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: 14 }}>Cancel Transaction</button>
                        </>
                      ) : (
                        <>
                          {/* STAGE B: INTERMEDIATE FINAL CONFIRMATION DIALOG VIEW */}
                          <h2 style={{ margin: 0, color: '#FF4A4A', fontSize: 18, fontWeight: 800, textAlign: 'center', letterSpacing: -0.5 }}>CONFIRM TRANSACTION</h2>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#F9F8F6', padding: 16, borderRadius: 12, border: '1px solid #f2d8c3' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#8A7E72' }}>
                              <span>Selected Method:</span>
                              <strong style={{ color: '#D1915F', textTransform: 'uppercase' }}>{pendingPaymentMethod}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#8A7E72' }}>
                              <span>Total Cart Items:</span>
                              <strong style={{ color: '#1E1E1E' }}>{orderItems.reduce((acc, i) => acc + i.quantity, 0)} items</strong>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid #f2d8c3', margin: '4px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
                              <span style={{ color: '#1E1E1E' }}>Grand Total Due:</span>
                              <span style={{ color: '#09AA29' }}>₱ {grandTotalAmount.toFixed(2)}</span>
                            </div>
                          </div>

                          <p style={{ margin: 0, fontSize: 12, color: '#8A7E72', textAlign: 'center', lineHeight: 1.4 }}>
                            Proceeding will commit this billing entry packet to database records and deduct recipe stocks.
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button 
                              onClick={handleConfirmPaymentExecution}
                              disabled={isProcessingPayment}
                              style={{ width: '100%', padding: '14px 0', background: isProcessingPayment ? '#B0A89E' : '#09AA29', color: '#FFFFFF', fontWeight: 800, fontSize: 14, border: 'none', borderRadius: 10, cursor: isProcessingPayment ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(9,170,41,0.15)' }}
                            >
                              {isProcessingPayment ? 'PROCESSING ORDER...' : 'CONFIRM AND PROCESS'}
                            </button>
                            <button 
                              onClick={() => setShowFinalConfirm(false)}
                              disabled={isProcessingPayment}
                              style={{ width: '100%', padding: '10px 0', background: 'transparent', color: '#8A7E72', fontWeight: 600, fontSize: 13, border: 'none', cursor: isProcessingPayment ? 'not-allowed' : 'pointer' }}
                            >
                              ← Go Back
                            </button>
                          </div>
                        </>
                      )}

                    </div>
                  </div>
                )}
              </>
            );
          }}
        </EditProductForm>
      )}
    </AddProductForm>
  );
}