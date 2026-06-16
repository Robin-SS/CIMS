import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts, ProductService } from '../services/ProductService'; 
import PosTerminalUI from '../components/PosTerminalUI';
import OrderSummary, { type OrderItem } from '../features/OrderSummary';
import AddProductForm from '../features/AddProductForm'; 
import EditProductForm from '../features/EditProductForm'; 
import type { Product } from '../types/Product';

export default function PosTerminal() {
  const { user } = useAuth();
  const { products, isLoading, error, refetch: refetchProducts } = useProducts(); 
  
  const [activeTab, setActiveTab] = useState<string>('POINT OF SALES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionView, setActionView] = useState<string>('menu'); // 'menu' | 'add' | 'edit' | 'delete'
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // State tracking array to manage multi-select batch deletion lines
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  // Enhanced conditional click handler supporting checkout, details loading, and multi-selection
  const handleProductClick = (product: Product) => {
    // A. Intercept click if in Delete Mode to manage bulk selection queue
    if (actionView === 'delete') {
      setSelectedDeleteIds((prev) => 
        prev.includes(product.product_id)
          ? prev.filter(id => id !== product.product_id) // Deselect if already queued
          : [...prev, product.product_id]                // Append to queue
      );
      return;
    }

    // B. Intercept click if in Edit Mode to load form details
    if (actionView === 'edit') {
      setSelectedProductId(product.product_id);
      return;
    }

    // C. Default Point-of-Sale behavior: add items to cart
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

  // ✅ FIXED: Added event signature context mappings to handle standard event triggers cleanly
  const handleConfirmBatchDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Prevent native form refresh side-effects
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
      refetchProducts(); // Instantly refresh the grid catalog
    }
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
              <PosTerminalUI
                userRole={user?.role}
                products={products}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onProductClick={handleProductClick}
                actionView={actionView}
                setActionView={setActionView}
                
                // Form Fields state selections
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
                
                // Override submit function to handle batch deletion when in delete mode
                handleFormSubmit={actionView === 'delete' ? handleConfirmBatchDelete : (isEditingItem ? editProps.handleFormSubmit : addProps.handleFormSubmit)}
                
                // Pass deletion queue tracking arrays down to the presentation layer
                selectedDeleteIds={selectedDeleteIds}
                setSelectedDeleteIds={setSelectedDeleteIds}
              >
                {user?.role !== 'admin' && (
                  <OrderSummary 
                    orderItems={orderItems} 
                    onUpdateQuantity={handleUpdateQuantity} 
                  />
                )}
              </PosTerminalUI>
            );
          }}
        </EditProductForm>
      )}
    </AddProductForm>
  );
}