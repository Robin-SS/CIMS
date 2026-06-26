import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import InsightsPageUI from '../components/InsightsPageUI';
import AnalyticsKpiCards from '../features/AnalyticsKpiCards';
import PredictedNeedsCards from '../features/PredictedNeedsCards'; // 🌟 IMPORT YOUR NEW FILE HERE
import { AnalyticsService } from '../services/AnalyticsService';
import RestockList from '../features/RestockList';
import type { KPIAnalytics } from '../types/Analytics';

// 🌟 NEW: Add an interface for your prediction state metrics
interface PredictionMetrics {
  forecastPeriodStr: string;
  predictedOrdersCount: number;
  ingredientsToOrderCount: number;
}

export default function InsightsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('REPORTS & ANALYTICS');
  
  // Existing state for historical metrics
  const [metrics, setMetrics] = useState<KPIAnalytics>({
    totalWeightKg: 0,
    mostConsumedItem: 'Calculating...',
    lowStockCount: 0,
    details: [] 
  });

  // 🌟 NEW: State to hold your predictive needs data
  const [predictiveMetrics, setPredictiveMetrics] = useState<PredictionMetrics>({
    forecastPeriodStr: 'Calculating...',
    predictedOrdersCount: 0,
    ingredientsToOrderCount: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPredictiveLoading, setIsPredictiveLoading] = useState<boolean>(true);

  // Fetching logic for historical dashboard
  useEffect(() => {
    async function loadDashboardKPIs() {
      setIsLoading(true);
      const { data, error } = await AnalyticsService.getUsageMetrics();
      if (!error && data) {
        setMetrics(data);
      }
      setIsLoading(false);
    }
    loadDashboardKPIs();
  }, []);

  // 🌟 NEW: Fetching logic for predictive data
  useEffect(() => {
    async function loadPredictiveKPIs() {
      setIsPredictiveLoading(true);
      
      // Replace this line with your actual API endpoint call when ready
      // const { data, error } = await AnalyticsService.getPredictiveNeeds();
      
      // Mocking the backend response format based on what we engineered earlier:
      const mockData = {
        forecastPeriodStr: "06/25/2026 - 07/02/2026",
        predictedOrdersCount: 1245,
        ingredientsToOrderCount: 14
      };
      
      setPredictiveMetrics(mockData);
      setIsPredictiveLoading(false);
    }
    
    if (activeTab !== 'REPORTS & ANALYTICS') {
      loadPredictiveKPIs();
    }
  }, [activeTab]);

  return (
    <InsightsPageUI
      userRole={user?.role}
      currentTab={activeTab}
      onTabChange={setActiveTab}
      
      leftCardsSlot={
        activeTab === 'REPORTS & ANALYTICS' ? (
          <AnalyticsKpiCards 
            data={{
              totalIngredientsKg: metrics.totalWeightKg,
              mostConsumedText: metrics.mostConsumedItem,
              lowStockItemsCount: metrics.lowStockCount
            }}
            isLoading={isLoading}
          />
        ) : (
          // 🌟 FIXED: Swapped out the raw divs for your newly engineered predictive card layout!
          <PredictedNeedsCards 
            data={predictiveMetrics}
            isLoading={isPredictiveLoading}
          />
        )
      }

      mainContentSlot={
        activeTab === 'REPORTS & ANALYTICS' ? (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1E1E1E' }}>RESTOCK LIST</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {user?.role === 'admin' && (
                  <div style={{ display: 'flex', alignItems: 'center' }}></div>
                )}
                
                <button style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #f2d8c3', color: '#D1915F', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  🖨️ EXPORT REPORT
                </button>
              </div>
            </div>

            <div style={{ flexGrow: 1, border: '2px solid #E5E5E5', borderRadius: 12, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
              <RestockList items={metrics.details} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1E1E1E' }}>PREDICTED NEEDS</h3>
              
              <button style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #f2d8c3', color: '#D1915F', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                🖨️ EXPORT FORECAST
              </button>
            </div>

            <div style={{ flexGrow: 1, border: '2px dashed #E5E5E5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A7E72', fontStyle: 'italic', backgroundColor: '#FAFAFA' }}>
              {/* Future forecast detail table/view can go here */}
              Forecast visualizations pending...
            </div>
          </div>
        )
      }
    />
  );
}