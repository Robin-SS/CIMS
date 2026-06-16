import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../services/ProductService'; 
import PosTerminalUI from '../components/PosTerminalUI';
import OrderSummary, { type OrderItem } from '../features/OrderSummary';
import AddProductForm from '../features/AddProductForm'; // Imported logical provider wrapper
import type { Product } from '../types/Product';

export default function PosTerminal() {
  const { user } = useAuth();
  const { products, isLoading, error, refetch: refetchProducts } = useProducts(); 
  
  const [activeTab, setActiveTab] = useState<string>('POINT OF SALES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [actionView, setActionView] = useState<string>('menu');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const handleProductClick = (product: Product) => {
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
    // UNIFIED LOGICAL TUNNEL NESTING IMPLEMENTED SUCCESSFUL ACROSS THE INVENTORY METRIC CONSTRAINTS
    <AddProductForm 
      onClose={() => setActionView('menu')} 
      onRefreshCatalog={refetchProducts}
    >
      {(addProps) => (
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
                    
          // Form Render State Hooks Bindings passed safely down to the physical view layer
          productName={addProps.productName}
          setProductName={addProps.setProductName}
          productCategory={addProps.productCategory}
          setProductCategory={addProps.setProductCategory}
          productPrice={addProps.productPrice}
          setProductPrice={addProps.setProductPrice}
          formError={addProps.formError}
          isSubmitting={addProps.isSubmitting}
          selectedRecipes={addProps.selectedRecipes}
          handleAddIngredientRow={addProps.handleAddIngredientRow}
          handleUpdateRecipeRow={addProps.handleUpdateRecipeRow}
          handleRemoveRecipeRow={addProps.handleRemoveRecipeRow}
          handleFormSubmit={addProps.handleFormSubmit}
        >
          {user?.role !== 'admin' && (
            <OrderSummary 
              orderItems={orderItems} 
              onUpdateQuantity={handleUpdateQuantity} 
            />
          )}
        </PosTerminalUI>
      )}
    </AddProductForm>
  );
}