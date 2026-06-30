import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

type SortKey = 'name' | 'currentStock' | 'predictedNeed' | 'actionNeeded';

export default function PredictedIngredientNeeds({ items, isLoading }: PredictedIngredientNeedsProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  // --- Sorting Logic ---
  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle numeric values directly (currentStock, predictedNeed)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle string values (name, actionNeeded)
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  // --- Helper to Render Arrows ---
  const renderSortIcon = (columnKey: SortKey) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.4 }} />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp style={{ width: 12, height: 12, marginLeft: 4 }} />
      : <ArrowDown style={{ width: 12, height: 12, marginLeft: 4 }} />;
  };

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
        
        <div onClick={() => handleSort('name')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
          Ingredient {renderSortIcon('name')}
        </div>
        
        <div onClick={() => handleSort('currentStock')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}>
          Current Stock {renderSortIcon('currentStock')}
        </div>
        
        <div onClick={() => handleSort('predictedNeed')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}>
          Predicted Need {renderSortIcon('predictedNeed')}
        </div>
        
        <div onClick={() => handleSort('actionNeeded')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}>
          Action Needed {renderSortIcon('actionNeeded')}
        </div>

      </div>

      {/* Table Body */}
      <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(90vh - 300px)' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8A7E72', fontStyle: 'italic' }}>Loading forecast data...</div>
        ) : sortedItems.length === 0 ? (
          // Empty state: either no ingredients/recipes exist yet in the
          // database, or current stock already covers all predicted need.
          <div style={{ padding: 40, textAlign: 'center', color: '#8A7E72', fontStyle: 'italic' }}>No predicted ingredient needs found.</div>
        ) : (
          sortedItems.map((item) => {
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