import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../services/ProductService'; 
import { useActivityLogs } from '../services/ActivityService';
import PosTerminalUI from '../components/PosTerminalUI';
import OrderSummary, { type OrderItem } from '../features/OrderSummary';
import type { Product } from '../types/Product';
import { ActivityService } from '../services/ActivityService';

export default function PosTerminal() {
  const { user } = useAuth();
  
  const { products, isLoading, error } = useProducts(); 
  const { logs } = useActivityLogs();
  
  const [activeTab, setActiveTab] = useState<string>('POINT OF SALES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // 2. State to hold the current items in the cart
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // 3. Logic to add a product (or increment if it already exists)
  const handleProductClick = (product: Product) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.product_id === product.product_id);
      
      if (existingItem) {
        // If it exists, map through and increase the quantity by 1
        return prevItems.map((item) => 
          item.product.product_id === product.product_id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      // If it doesn't exist, add it as a new order item
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  // 4. Logic to handle the + and - buttons inside the Order Summary
  const handleUpdateQuantity = (productId: number, delta: number) => {
    setOrderItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product.product_id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter((item) => item.quantity > 0); // Automatically remove item if quantity hits 0
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

  // checkout process

  const handleCheckout = async () => {
    if (!user || orderItems.length === 0) return;

    // 1. (Future Step) Here is where you would normally save the order to your Supabase 'transactions' table...
    
    // 2. Log the activity!
    await ActivityService.logAction(
      user.id, 
      `Processed Order (Total: Php ${orderItems.reduce((sum, item) => sum + (Number(item.product.product_price) * item.quantity) * 1.12, 0).toFixed(2)})`, 
      'Transactions'
    );

    // 3. Clear the cart to get ready for the next customer
    setOrderItems([]);
    alert("Order processed successfully!"); // Quick feedback for the employee
  };

  return (
    <PosTerminalUI
      userRole={user?.role}
      products={products}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      onProductClick={handleProductClick}
      activityLogs={logs}
    >
      {/* 5. Render the fully functional Order Summary for non-admin users */}
      {user?.role !== 'admin' && (
        <OrderSummary 
          orderItems={orderItems} 
          onUpdateQuantity={handleUpdateQuantity} 
          onCheckout={handleCheckout}
        />
      )}
    </PosTerminalUI>
  );
}