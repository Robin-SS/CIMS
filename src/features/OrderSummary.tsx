import type { Product } from '../types/Product';

export interface OrderItem {
  product: Product;
  quantity: number;
}

interface OrderSummaryProps {
  orderItems: OrderItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onCheckout: () => void;
}

export default function OrderSummary({ orderItems, onUpdateQuantity, onCheckout }: OrderSummaryProps) {
  // Calculations
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = orderItems.reduce((sum, item) => sum + (Number(item.product.product_price) * item.quantity), 0);
  const tax = totalAmount * 0.12; // 12% Tax
  const grandTotal = totalAmount + tax;

    return (
      <div style={{
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1,          
        height: '100%',        
        background: '#FFFFFF', 
        borderRadius: 12, 
        border: '2px solid #f2d8c3',
        overflow: 'hidden', 
        fontFamily: "'Inter', sans-serif"
      }}>
      
      {/* 🌟 Custom Scrollbar Styling for this component 🌟 */}
      <style>{`
        .order-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .order-scroll::-webkit-scrollbar-track {
          background: #F9F8F6;
          border-radius: 8px;
        }
        .order-scroll::-webkit-scrollbar-thumb {
          background-color: #D3C9BE;
          border-radius: 8px;
        }
        .order-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #D1915F;
        }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '2px solid #f2d8c3' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#D1915F' }}>ORDER SUMMARY</h2>
      </div>

      {/* TABLE HEADERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '10px 20px', background: '#FFFFFF', borderBottom: '2px solid #f2d8c3', fontSize: 11, fontWeight: 600, color: '#D1915F' }}>
        <span>Menu Item</span>
        <span style={{ textAlign: 'right' }}>Amount</span>
        <span style={{ textAlign: 'center' }}>Qty</span>
      </div>

      {/* ORDER ITEMS LIST (With Scrollbar Fix) */}
      <div className="order-scroll" style={{ 
        flex: 1, /* 🌟 flex: 1 forces it to perfectly fill empty space without pushing the footer away */
        overflowY: 'auto', 
        padding: '16px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 10,
        minHeight: 0 
      }}>
        {orderItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#A39BA6', fontSize: 13, fontStyle: 'italic', marginTop: 40 }}>
            No items in the order yet.<br/>Click a product to add it.
          </div>
        ) : (
          orderItems.map((item) => (
            <div key={item.product.product_id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 8, border: '1px solid #F5E6D3', background: '#FFFFFF'
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1E1E1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.product.product_name}
              </span>
              
              <span style={{ fontSize: 13, fontWeight: 800, color: '#1E1E1E', textAlign: 'right' }}>
                Php {Number(item.product.product_price).toFixed(2)}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9F8F6', padding: '4px', borderRadius: 20 }}>
                <button 
                  onClick={() => onUpdateQuantity(item.product.product_id, -1)}
                  style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: '#D1915F', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                >−</button>
                <span style={{ fontSize: 13, fontWeight: 700, width: 16, textAlign: 'center', color: '#1E1E1E' }}>
                  {item.quantity}
                </span>
                <button 
                  onClick={() => onUpdateQuantity(item.product.product_id, 1)}
                  style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: '#D1915F', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                >+</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CALCULATIONS TOTALS */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F1F1', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#8A7E72' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Quantity</span>
          <span style={{ fontWeight: 600, color: '#1E1E1E' }}>{totalQuantity}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Amount</span>
          <span style={{ fontWeight: 600, color: '#1E1E1E' }}>Php {totalAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Tax (12%)</span>
          <span style={{ fontWeight: 600, color: '#1E1E1E' }}>Php {tax.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Discount</span>
          <span style={{ fontWeight: 600, color: '#1E1E1E' }}>Php 0.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 8, borderTop: '2px solid #f2d8c3', fontSize: 14, fontWeight: 800, color: '#1E1E1E' }}>
          <span>Grand Total Amount</span>
          <span>Php {grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#F9F8F6', padding: '12px', borderTop: '2px solid #f2d8c3' }}>
        <button 
         onClick={onCheckout} 
          disabled={orderItems.length === 0} 
          style={{
            background: orderItems.length === 0 ? '#A39BA6' : '#09AA29', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: 8,
            padding: '14px 62.5px', 
            fontSize: 12, 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            cursor: orderItems.length === 0 ? 'not-allowed' : 'pointer', // Change cursor
            boxShadow: orderItems.length === 0 ? 'none' : '0 4px 12px rgba(9, 170, 41, 0.2)' 
        }}>
          Choose Payment Method
        </button>
      </div>

    </div>
  );
}