import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../services/ProductService'; 
import { useActivityLogs, ActivityService } from '../services/ActivityService'; // 🌟 Imported ActivityService for logging
import PosTerminalUI from '../components/PosTerminalUI';
import OrderSummary, { type OrderItem } from '../features/OrderSummary';
import type { Product } from '../types/Product';

export default function PosTerminal() {
  const { user } = useAuth();
  
  const { products, isLoading, error } = useProducts(); 
  const { logs, refetch: refetchLogs } = useActivityLogs(); // 🌟 Extracted the refetch function here
  
  const [activeTab, setActiveTab] = useState<string>('POINT OF SALES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // 🌟 NEW: Controlled state for displaying the intermediate payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  const handleProductClick = (product: Product) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.product_id === product.product_id);
      if (existingItem) {
        return prevItems.map((item) => 
          item.product.product_id === product.product_id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
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

  // 🌟 MODIFIED: Intercept checkout to open modal first instead of writing directly to DB
  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  // 🌟 NEW: Handles true confirmation from inside the modal, logging to DB and updating state instantly
  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!user || orderItems.length === 0) return;

    const totalBill = orderItems.reduce((sum, item) => sum + (Number(item.product.product_price) * item.quantity) * 1.12, 0);
    
    // 1. Commit action log to Supabase
    await ActivityService.logAction(
      user.id, 
      `Processed Order via ${paymentMethod} (Total: Php ${totalBill.toFixed(2)})`, 
      'Transactions'
    );

    // 2. Local State Management: reset checkout state and dismiss modal
    setOrderItems([]);
    setIsPaymentModalOpen(false);

    // 3. Re-validate Stale Data: instantly pull the newest audit log row without page reloading!
    refetchLogs();
    
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
    <>
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
        {user?.role !== 'admin' && (
          <OrderSummary 
            orderItems={orderItems} 
            onUpdateQuantity={handleUpdateQuantity} 
            onCheckout={handleOpenPaymentModal} // <-- Redirected handler to trigger the overlay modal setup
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
}