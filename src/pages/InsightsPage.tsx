import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import InsightsPageUI from '../components/InsightsPageUI';
import AnalyticsKpiCards from '../features/AnalyticsKpiCards';
import { AnalyticsService } from '../services/AnalyticsService';
import type { KPIAnalytics } from '../types/Analytics';

export default function InsightsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('REPORTS & ANALYTICS');
  
  // 🌟 NEW: State for the KPI metrics
  const [metrics, setMetrics] = useState<KPIAnalytics>({
    totalWeightKg: 0,
    mostConsumedItem: 'Calculating...',
    lowStockCount: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🌟 NEW: Fetching logic on mount
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

  return (
    <InsightsPageUI
      userRole={user?.role}
      currentTab={activeTab}
      onTabChange={setActiveTab}
      
      leftCardsSlot={
        activeTab === 'REPORTS & ANALYTICS' ? (
          // 🌟 INJECTED THE NEW KPI FEATURE COMPONENT HERE
          <AnalyticsKpiCards 
            data={{
              totalIngredientsKg: metrics.totalWeightKg,
              mostConsumedText: metrics.mostConsumedItem,
              lowStockItemsCount: metrics.lowStockCount
            }}
            isLoading={isLoading}
          />
        ) : (
          <>
            <div style={{ padding: 16, background: '#FDFBF7', border: '1px solid #f2d8c3', borderRadius: 12 }}>
              <span style={{ fontSize: 11, color: '#8A7E72', fontWeight: 600 }}>FORECAST PERIOD</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#D1915F', marginTop: 4 }}></div>
            </div>

            <div style={{ padding: 16, background: '#FDFBF7', border: '1px solid #f2d8c3', borderRadius: 12 }}>
              <span style={{ fontSize: 11, color: '#8A7E72', fontWeight: 600 }}>PREDICTED ORDERS</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#D1915F', marginTop: 4 }}></div>
            </div>

            <div style={{ padding: 16, background: '#FDFBF7', border: '1px solid #f2d8c3', borderRadius: 12 }}>
              <span style={{ fontSize: 11, color: '#8A7E72', fontWeight: 600 }}>INGREDIENTS TO ORDER</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#D1915F', marginTop: 4 }}></div>
            </div>
          </>
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

            <div style={{ flexGrow: 1, border: '2px dashed #E5E5E5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A7E72', fontStyle: 'italic', backgroundColor: '#FAFAFA' }}>
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
            </div>
          </div>
        )
      }
    />
  );
}