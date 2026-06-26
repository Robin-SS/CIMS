import React from 'react';

// 1. Update interface to reflect our new fetching logic properties
interface PredictedNeedsData {
  forecastPeriodStr: string;     // e.g., "6/25/2026 - 7/2/2026"
  predictedOrdersCount: number;  // e.g., 1245
  ingredientsToOrderCount: number; // e.g., 14
}

interface PredictedNeedsCardsProps {
  data: PredictedNeedsData;
  isLoading: boolean;
}

export default function PredictedNeedsCards({ data, isLoading }: PredictedNeedsCardsProps) {
  const cardContainerStyle: React.CSSProperties = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 20, 
    width: '100%',
    height: '100%', 
    fontFamily: "'Inter', sans-serif" 
  };

  const cardBaseStyle: React.CSSProperties = { 
    background: '#FFFFFF', 
    borderRadius: 14, 
    border: '2px solid #f2d8c3', // Fits the warm tone in image_401126.png
    display: 'grid', 
    gridTemplateColumns: '110px 1fr', // Widened slightly to fit the dates comfortably
    overflow: 'hidden', 
    flex: 1, 
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
  };

  const metricSideStyle: React.CSSProperties = { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 8, 
    textAlign: 'center' 
  };
  
  const titleSideStyle: React.CSSProperties = { 
    background: '#D1915F', 
    color: '#FFFFFF', 
    padding: '12px 16px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    fontSize: 11, 
    fontWeight: 800, 
    lineHeight: 1.3, 
    textTransform: 'uppercase', 
    letterSpacing: 0.3 
  };

  if (isLoading) return <div style={{ width: 240, color: '#D1915F', fontStyle: 'italic', fontSize: 13, textAlign: 'center', marginTop: 40 }}>Calculating Predictions...</div>;

  return (
    <div style={cardContainerStyle}>
      {/* CARD 1: FORECAST PERIOD */}
      <div style={cardBaseStyle}>
        <div style={{ ...metricSideStyle, padding: '4px 8px' }}>
          {/* Dynamically splits date range string into two lines for cleaner layout */}
          <span style={{ fontSize: 12, fontWeight: 800, color: '#D1915F', lineHeight: 1.2 }}>
            {data.forecastPeriodStr.split(' - ')[0]}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#8A7E72', margin: '2px 0' }}>to</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#D1915F', lineHeight: 1.2 }}>
            {data.forecastPeriodStr.split(' - ')[1]}
          </span>
        </div>
        <div style={titleSideStyle}><span>Forecast</span><span>Period</span></div>
      </div>

      {/* CARD 2: PREDICTED ORDERS */}
      <div style={cardBaseStyle}>
        <div style={metricSideStyle}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#D1915F', letterSpacing: -0.5 }}>
            {data.predictedOrdersCount.toLocaleString('en-US')}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#8A7E72', marginTop: 2 }}>units expected</span>
        </div>
        <div style={titleSideStyle}><span>Predicted</span><span>Orders</span></div>
      </div>

      {/* CARD 3: INGREDIENTS TO ORDER */}
      <div style={cardBaseStyle}>
        <div style={metricSideStyle}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#D1915F' }}>
            {data.ingredientsToOrderCount}
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#8A7E72', marginTop: 1, whiteSpace: 'nowrap' }}>
            items short
          </span>
        </div>
        <div style={titleSideStyle}><span>Ingredients</span><span>To Order</span></div>
      </div>
    </div>
  );
}