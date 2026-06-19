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

export default function PosTerminal() {
  const { user } = useAuth();
  
  const { products, isLoading, error, refetch: refetchProducts } = useProducts(); 
  const { logs, refetch: refetchLogs } = useActivityLogs(); 
  
  const [activeTab, setActiveTab] = useState<string>('POINT OF SALES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionView, setActionView] = useState<string>('menu'); // 'menu' | 'add' | 'edit' | 'delete'
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const { refreshInventory } = useInventory();

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
    
    await ActivityService.logAction(
      user.id, 
      `Processed Order via ${paymentMethod} (Total: Php ${totalBill.toFixed(2)})`, 
      'Transactions'
    );

    setOrderItems([]);
    setIsPaymentModalOpen(false);
    refetchLogs();

    await refreshInventory();

    alert(`Order processed successfully using ${paymentMethod}!`);
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
    <AddProductForm 
      onClose={() => setActionView('menu')} 
      onRefreshCatalog={refetchProducts}
    >
      {(addProps) => (
        <EditProductForm
          productId={selectedProductId || 0}
          onClose={handleCloseEditMode}
          onRefreshCatalog={refetchProducts}
        >
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
                  
                  // Form Fields state selections
                  productName={isEditingItem ? editProps.productName : addProps.productName}
                  setProductName={isEditingItem ? editProps.setProductName : addProps.setProductName}
                  productCategory={isEditingItem ? editProps.productCategory : addProps.productCategory}
                  setProductCategory={isEditingItem ? editProps.setProductCategory : addProps.setProductCategory}
                  productPrice={isEditingItem ? editProps.productPrice : addProps.productPrice}
                  setProductPrice={isEditingItem ? editProps.setProductPrice : addProps.setProductPrice}
                  formError={actionView === 'delete' ? deleteError : (isEditingItem ? editProps.formError : addProps.formError)}
                  isSubmitting={actionView === 'delete' ? isDeleting : (isEditingItem ? editProps.isSubmitting : addProps.isSubmitting)}
                  
                  // ✅ FIX 1: Explicitly pass down the edited collection array
                  selectedRecipes={isEditingItem ? editProps.selectedRecipes : addProps.selectedRecipes}
                  handleAddIngredientRow={isEditingItem ? editProps.handleAddIngredientRow : addProps.handleAddIngredientRow}
                  handleUpdateRecipeRow={isEditingItem ? editProps.handleUpdateRecipeRow : addProps.handleUpdateRecipeRow}
                  
                  // ✅ FIX 2: Explicitly hook the deletion control context down
                  handleRemoveRecipeRow={isEditingItem ? editProps.handleRemoveRecipeRow : addProps.handleRemoveRecipeRow}
                  
                  // ✅ FIX 3: Bound standard form actions directly to editProps.handleFormSubmit when editing
                  handleFormSubmit={
                    actionView === 'delete' 
                      ? handleConfirmBatchDelete 
                      : isEditingItem 
                        ? editProps.handleFormSubmit 
                        : addProps.handleFormSubmit
                  }
                  
                  selectedDeleteIds={selectedDeleteIds}
                  setSelectedDeleteIds={setSelectedDeleteIds}
                >
                  {user?.role !== 'admin' && (
                    <OrderSummary 
                      orderItems={orderItems} 
                      onUpdateQuantity={handleUpdateQuantity} 
                      onCheckout={handleOpenPaymentModal} 
                    />
                  )}
                </PosTerminalUI>

                {/* ====================[ INTERMEDIATE PAYMENT METHOD MODAL ]==================== */}
                {isPaymentModalOpen && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: '#FFFFFF', padding: 32, borderRadius: 16, width: 400, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontFamily: "'Inter', sans-serif" }}>
                      <h2 style={{ margin: 0, color: '#1E1E1E', fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: -0.5 }}>SELECT PAYMENT METHOD</h2>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <button 
                          onClick={() => handleConfirmPayment('Cash')}
                          style={{ padding: '20px 16px', background: '#FFFFFF', border: '1px solid #D3C9BE', borderRadius: 12, color: '#D1915F', fontWeight: 800, cursor: 'pointer', fontSize: 15, transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FFF5EB'; e.currentTarget.style.borderColor = '#D1915F'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D3C9BE'; }}
                        >
                          <span style={{ fontSize: 24 }}>💵</span>
                          <span>CASH</span>
                        </button>
                        <button 
                          onClick={() => handleConfirmPayment('Card/E-Wallet')}
                          style={{ padding: '20px 16px', background: '#FFFFFF', border: '1px solid #D3C9BE', borderRadius: 12, color: '#D1915F', fontWeight: 800, cursor: 'pointer', fontSize: 15, transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FFF5EB'; e.currentTarget.style.borderColor = '#D1915F'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D3C9BE'; }}
                        >
                          <span style={{ fontSize: 24 }}>💳</span>
                          <span>CARD</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => setIsPaymentModalOpen(false)}
                        style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: '#A39BA6', fontWeight: 600, cursor: 'pointer', fontSize: 13, alignSelf: 'center', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1E1E1E'}
                        onMouseLeave={e => e.currentTarget.style.color = '#A39BA6'}
                      >
                        Cancel Transaction
                      </button>
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