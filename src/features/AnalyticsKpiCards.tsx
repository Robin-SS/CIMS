import React from 'react';

interface KpiData {
  totalIngredientsKg: number;
  mostConsumedText: string;
  lowStockItemsCount: number;
}

interface AnalyticsKpiCardsProps {
  data: KpiData;
  isLoading: boolean;
}

export default function AnalyticsKpiCards({ data, isLoading }: AnalyticsKpiCardsProps) {
  const cardContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 20, width: 240, minWidth: 240, fontFamily: "'Inter', sans-serif" };
  const cardBaseStyle: React.CSSProperties = { background: '#FFFFFF', borderRadius: 14, border: '2px solid #f2d8c3', display: 'grid', gridTemplateColumns: '95px 1fr', overflow: 'hidden', height: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' };
  const metricSideStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center' };
  const titleSideStyle: React.CSSProperties = { background: '#D1915F', color: '#FFFFFF', padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: 11, fontWeight: 800, lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: 0.3 };

  if (isLoading) return <div style={{ width: 240, color: '#D1915F', fontStyle: 'italic', fontSize: 13, textAlign: 'center', marginTop: 40 }}>Recalculating KPIs...</div>;

  return (
    <div style={cardContainerStyle}>
      <div style={cardBaseStyle}>
        <div style={metricSideStyle}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#D1915F', letterSpacing: -0.5 }}>
            {data.totalIngredientsKg.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#8A7E72', marginTop: 2 }}>kg</span>
        </div>
        <div style={titleSideStyle}><span>Total</span><span>Ingredients</span><span>Used</span></div>
      </div>

      <div style={cardBaseStyle}>
        <div style={{ ...metricSideStyle, padding: '4px 12px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#8A7E72', marginBottom: 2 }}>{data.mostConsumedText.split(' - ')[1] || '40L/week'}</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#D1915F', textAlign: 'center', lineHeight: 1.1 }}>{data.mostConsumedText.split(' - ')[0]}</span>
        </div>
        <div style={titleSideStyle}><span>Most</span><span>Consumed</span></div>
      </div>

      <div style={cardBaseStyle}>
        <div style={metricSideStyle}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#D1915F' }}>{data.lowStockItemsCount}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#8A7E72', marginTop: 1, whiteSpace: 'nowrap' }}>need reordering</span>
        </div>
        <div style={titleSideStyle}><span>Low</span><span>Stock</span><span>Items</span></div>
      </div>
    </div>
  );
}