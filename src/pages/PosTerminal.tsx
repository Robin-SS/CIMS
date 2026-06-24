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
import { supabase } from '../supabaseClient'; // Ensure supabase is imported

export default function PosTerminal() {
  const { user } = useAuth();
  
  const { products, isLoading, error, refetch: refetchProducts } = useProducts(); 
  const { logs, refetch: refetchLogs } = useActivityLogs(); 
  
  const [activeTab, setActiveTab] = useState<string>('POINT OF SALES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionView, setActionView] = useState<string>('menu'); // 'menu' | 'add' | 'edit' | 'delete' | 'order'
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const { ingredients, refreshInventory } = useInventory(); // Destructured ingredients matrix

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

    // Prevent accidental cart additions from the main admin menu
    if (user?.role === 'admin' && actionView === 'menu') return;

    // --- POPUP WARNING SYSTEM LOGIC ---
    // Scan the item's recipe map against the live inventory metrics
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

      // If any matches broke threshold requirements, display the modal report list
      if (lowStockIngredientAlerts.length > 0) {
        alert(
          `⚠️ STOCK WARNING for "${product.product_name}"\n\n` +
          `The following ingredients are below safe levels:\n` +
          `${lowStockIngredientAlerts.join('\n')}\n\n` +
          `Click OK to proceed with adding this item to the order.`
        );
      }
    }
    // ----------------------------------

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
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!user || orderItems.length === 0) return;

    const totalBill = orderItems.reduce((sum, item) => sum + (Number(item.product.product_price) * item.quantity) * 1.12, 0);
    
    const itemsForDb = orderItems.map(item => ({
      product_id: item.product.product_id,
      quantity: item.quantity
    }));

    // Call the Supabase RPC
    const { error: rpcError } = await supabase.rpc('process_order_and_deduct_stock', {
      p_user_id: user.user_id,
      p_items: itemsForDb,
      p_payment_method: paymentMethod,
      p_amount_paid: totalBill
    });

    if (rpcError) {
      alert('Error processing order: ' + rpcError.message);
      return;
    }

    // Log the transaction
    await ActivityService.logAction(
      user.id, 
      `Processed Order via ${paymentMethod} (Total: Php ${totalBill.toFixed(2)})`, 
      'Transactions'
    );

    // Refresh everything
    setOrderItems([]);
    setIsPaymentModalOpen(false);
    refetchLogs();
    await refreshInventory(); // Refreshes inventory table quantity values

    alert(`Order processed successfully using ${paymentMethod}! Inventory updated.`);
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

                {/* Payment Modal remains here */}
                {isPaymentModalOpen && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: '#FFFFFF', padding: 32, borderRadius: 16, width: 400, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontFamily: "'Inter', sans-serif" }}>
                      <h2 style={{ margin: 0, color: '#D1915F', fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: -0.5 }}>SELECT PAYMENT METHOD</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <button onClick={() => handleConfirmPayment('Cash')} style={{ padding: '20px 16px', background: '#faebe0', border: '2px solid #f2d8c3', borderRadius: 12, color: '#D1915F', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}><span>💵 CASH</span></button>
                        <button onClick={() => handleConfirmPayment('Card/E-Wallet')} style={{ padding: '20px 16px', background: '#faebe0', border: '2px solid #f2d8c3', borderRadius: 12, color: '#D1915F', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}><span>💳 CARD</span></button>
                      </div>
                      <button onClick={() => setIsPaymentModalOpen(false)} style={{ padding: '10px 16px', background: '#faebe0', border: '2px solid #f2d8c3', color: '#D1915F', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}>Cancel Transaction</button>
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