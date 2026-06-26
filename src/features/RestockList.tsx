import React from 'react';
import type { IngredientUsageDetail } from '../types/Analytics';

interface RestockListProps {
  items: IngredientUsageDetail[];
  isLoading: boolean;
}

export default function RestockList({ items, isLoading }: RestockListProps) {
  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8A7E72', fontStyle: 'italic' }}>Loading inventory data...</div>;
  }

  if (items.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8A7E72', fontStyle: 'italic' }}>No ingredients found in database.</div>;
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'NO STOCK':
        return { color: '#EF4444', border: '2px solid #EF4444', dot: '#EF4444' };
      case 'LOW STOCK':
        return { color: '#F59E0B', border: '2px solid #FDE68A', dot: '#F59E0B' };
      default: // IN STOCK
        return { color: '#10B981', border: '2px solid #A7F3D0', dot: '#10B981' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Table Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1.5fr', padding: '12px 16px', background: '#FFFFFF', borderBottom: '2px solid #f2d8c3', fontSize: 10, fontWeight: 700, color: '#D1915F', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <span>Ingredient ↓↑</span>
        <span style={{ textAlign: 'center' }}>In Stock ↓↑</span>
        <span style={{ textAlign: 'center' }}>Reorder At ↓↑</span>
        <span style={{ textAlign: 'center' }}>Used This Month ↓↑</span>
        <span style={{ textAlign: 'center' }}>Status ↓↑</span>
      </div>

      {/* Table Body */}
      <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(90vh - 300px)' }}>
        {items.map((item, idx) => {
          const style = getStatusStyles(item.status);
          
          return (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1.5fr', padding: '15px', borderBottom: '2px solid #f2d8c3', alignItems: 'center', fontSize: 13, color: '#8A7E72', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FFFFFF' }}>
              
              <span style={{ fontWeight: 800 }}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>
              
              <span style={{ textAlign: 'center', fontWeight: 700 }}>{item.inStock}{item.unit}</span>
              <span style={{ textAlign: 'center', fontWeight: 700 }}>{item.threshold}{item.unit}</span>
              <span style={{ textAlign: 'center', fontWeight: 700 }}>{item.usedThisMonth.toFixed(0)}{item.unit}</span>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, border: '2px solid #f2d8c3', color: style.color, fontWeight: 800, fontSize: 11, backgroundColor: '#FFFFFF' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: style.dot }}></div>
                  {item.status}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}