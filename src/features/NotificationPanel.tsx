import { AlertTriangle } from 'lucide-react';
import type { Ingredient } from '../types/InventoryItem';

interface NotificationPanelProps {
  ingredients: Ingredient[];
}

export default function NotificationPanel({ ingredients }: NotificationPanelProps) {
  // Filter for low stock or nearing expiry items
  const alertItems = ingredients.filter(item => {
    const status = item.stock_status.toLowerCase();
    return status.includes('low stock') || status.includes('no stock');
  });

    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12, 
          flexGrow: 1,         
          height: '100%',      
          overflowY: 'auto',
          paddingRight: 4 
        }}
      >

      {alertItems.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: '#09AA29', fontWeight: 600, fontSize: 13, background: '#E8F5E9', borderRadius: 10 }}>
          ✅ All stock levels are healthy!
        </div>
      ) : (
        alertItems.map(item => {
          const isOut = item.stock_status.toLowerCase().includes('no');
          return (
          <div 
            key={item.ingredient_id} 
            style={{ 
              display: 'flex', 
              gap: 12, 
              padding: 12, 
              background: isOut? '#FEF2F2': '#fcf7bee7', 
              border: '1px solid #FECACA', 
              borderRadius: 10,
              alignItems: 'center',
              textAlign: 'left'
            }}
          >
            <div style={{ background: isOut? '#EF4444' : '#ffe312', color: '#FFFFFF', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle style={{ width: 16, height: 16 }} />
            </div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E1E1E' }}>
                  {isOut ? '🚨 NO STOCK' : '⚠️ LOW STOCK'}: {item.ingredient_name}
                </div>
                <div style={{ fontSize: 11, color: isOut ? '#B91C1C' : '#92400E', marginTop: 2 }}>
                  {isOut 
                    ? `This item has run out entirely (0 ${item.measurement_unit} remaining).`
                    : `Only ${item.stock_quantity} ${item.measurement_unit} remaining (Threshold: ${item.threshold}).`
                  }
                </div>
            </div>
          </div>
          );
        })
      )}
    </div>
  );
}