import React from 'react';

// TODO: Move this type to ../types/Analytics.ts once the forecast schema is finalized in Supabase.
export interface PredictedIngredientDetail {
  id: number;
  name: string;
  currentStock: number;
  predictedNeed: number;
  unit: string;
  actionNeeded: 'ENOUGH STOCK' | 'ORDER NOW';
}

interface PredictedIngredientNeedsProps {
  items: PredictedIngredientDetail[];
  isLoading: boolean;
}

export default function PredictedIngredientNeeds({ items, isLoading }: PredictedIngredientNeedsProps) {
  const getActionStyles = (action: string) => {
    switch (action) {
      case 'ORDER NOW':
        return { color: '#EF4444', dot: '#EF4444' };
      default: // ENOUGH STOCK
        return { color: '#10B981', dot: '#10B981' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: "'Inter', sans-serif" }}>

      {/* Table Header — always visible, even before data is wired in */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr', padding: '12px 16px', background: '#FFFFFF', borderBottom: '2px solid #f2d8c3', fontSize: 10, fontWeight: 700, color: '#D1915F', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <span>Ingredient ↓↑</span>
        <span style={{ textAlign: 'center' }}>Current Stock ↓↑</span>
        <span style={{ textAlign: 'center' }}>Predicted Need ↓↑</span>
        <span style={{ textAlign: 'center' }}>Action Needed ↓↑</span>
      </div>

      {/* Table Body */}
      <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(90vh - 300px)' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8A7E72', fontStyle: 'italic' }}>Loading forecast data...</div>
        ) : items.length === 0 ? (
          // Empty state: either no ingredients/recipes exist yet in the
          // database, or current stock already covers all predicted need.
          <div style={{ padding: 40, textAlign: 'center', color: '#8A7E72', fontStyle: 'italic' }}>No predicted ingredient needs found.</div>
        ) : (
          items.map((item) => {
            const style = getActionStyles(item.actionNeeded);

            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr', padding: '16px', borderBottom: '1px solid #F1F1F1', alignItems: 'center', fontSize: 13, color: '#8A7E72' }}>

                <span style={{ fontWeight: 800 }}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>

                <span style={{ textAlign: 'center', fontWeight: 700 }}>{item.currentStock}{item.unit}</span>
                <span style={{ textAlign: 'center', fontWeight: 700 }}>{item.predictedNeed}{item.unit}</span>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, border: '2px solid #f2d8c3', color: style.color, fontWeight: 800, fontSize: 11, backgroundColor: '#FFFFFF' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: style.dot }}></div>
                    {item.actionNeeded}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}