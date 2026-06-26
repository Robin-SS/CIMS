import React from 'react';

interface PredictedNeedsData {
  forecastPeriodStr: string;
  predictedOrdersCount: number;
  ingredientsToOrderCount: number;
  dailyOrderRate: number;
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
    border: '2px solid #f2d8c3',
    display: 'grid',
    gridTemplateColumns: '130px 1fr',
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

  if (isLoading) return (
    <div style={{ width: 240, color: '#D1915F', fontStyle: 'italic', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
      Calculating Predictions...
    </div>
  );

  // Format "6/26/2026 - 7/3/2026" → "Jun 26 - Jul 3" + "7 days"
  const [startStr, endStr] = data.forecastPeriodStr.split(' - ');
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const formatShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div style={cardContainerStyle}>

      {/* CARD 1: FORECAST PERIOD */}
      <div style={cardBaseStyle}>
        <div style={{ ...metricSideStyle, gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#8A7E72' }}>
            {formatShort(startDate)} - {formatShort(endDate)}
          </span>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#D1915F', lineHeight: 1.1 }}>
            {diffDays} days
          </span>
        </div>
        <div style={titleSideStyle}><span>Forecast</span><span>Period</span></div>
      </div>

      {/* CARD 2: PREDICTED ORDERS */}
      <div style={cardBaseStyle}>
        <div style={metricSideStyle}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#8A7E72' }}>
            {data.dailyOrderRate} per day
          </span>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#D1915F', letterSpacing: -1, lineHeight: 1.1 }}>
            {data.predictedOrdersCount.toLocaleString('en-US')}
          </span>
        </div>
        <div style={titleSideStyle}><span>Predicted</span><span>Orders</span></div>
      </div>

      {/* CARD 3: INGREDIENTS TO ORDER */}
      <div style={cardBaseStyle}>
        <div style={metricSideStyle}>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#D1915F', lineHeight: 1.1 }}>
            {data.ingredientsToOrderCount}
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#8A7E72', marginTop: 2, whiteSpace: 'nowrap' }}>
            before the stock runs out
          </span>
        </div>
        <div style={titleSideStyle}><span>Ingredients</span><span>To Order</span></div>
      </div>

    </div>
  );
}