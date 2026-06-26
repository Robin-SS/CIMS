import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import InsightsPageUI from '../components/InsightsPageUI';
import AnalyticsKpiCards from '../features/AnalyticsKpiCards';
import { AnalyticsService } from '../services/AnalyticsService';
import RestockList from '../features/RestockList';
import type { KPIAnalytics } from '../types/Analytics';

export default function InsightsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('REPORTS & ANALYTICS');
  const [searchQuery, setSearchQuery] = useState<string>(''); // ✅ NEW: Inline search query modifier state

  // State for the KPI metrics
  const [metrics, setMetrics] = useState<KPIAnalytics>({
    totalWeightKg: 0,
    mostConsumedItem: 'Calculating...',
    lowStockCount: 0,
    details: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetching logic on mount
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

  // Native CSV Export Handler including Top KPI Aggregations
  const handleExportCSV = () => {
    if (user?.role !== 'admin') return;

    // ✅ MODIFIED: Exports the currently searched/filtered collection state instead of the raw global array
    const dataToExport = filteredDetails;

    if (!dataToExport || dataToExport.length === 0) {
      alert("No data matches your criteria to export at this moment.");
      return;
    }

    // 1. Build a clean metadata dashboard block at the top of the file
    const kpiSummaryBlock = [
      'TITA\'S CAFE - BUSINESS INSIGHTS SUMMARY REPORT',
      `Exported On,${new Date().toLocaleDateString('en-CA')} ${new Date().toLocaleTimeString('en-CA', { hour12: false })}`,
      `Total Ingredients Used,${metrics.totalWeightKg.toLocaleString('en-US', { maximumFractionDigits: 2 })} kg`,
      `Most Consumed Item,"${metrics.mostConsumedItem.replace(/"/g, '""')}"`,
      `Low Stock Alert Items Count,${metrics.lowStockCount} item(s)`,
      searchQuery ? `Active Grid Search Filter,"${searchQuery}"` : 'Active Grid Search Filter,NONE',
      '', // Blank line spacer
      'DETAILED INGREDIENT RESTOCK METRICS GRID',
    ].join('\n');

    // 2. Define standard table column headers
    const headers = ['Ingredient ID', 'Ingredient Name', 'In Stock Level', 'Reorder Threshold', 'Used This Month', 'Measurement Unit', 'Stock Status'];
    
    // 3. Map rows data array lines
    const csvRows = dataToExport.map(item => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.inStock,
      item.threshold,
      item.usedThisMonth.toFixed(2),
      item.unit,
      item.status
    ].join(','));

    // 4. Combine metadata block, headers, and rows using standard newline delimiters
    const csvContent = [kpiSummaryBlock, headers.join(','), ...csvRows].join('\n');

    // 5. Build raw file buffer object vector
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 6. Trigger a fast simulation programmatic link anchor download hook down
    const link = document.createElement('a');
    link.href = url;
    
    const dateStamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Titas_Cafe_Insights_Report_${dateStamp}.csv`);
    
    document.body.appendChild(link);
    link.click();
    
    // De-allocate memory addresses securely
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ✅ NEW: Dynamic Client-Side Filtering Mechanism
  const filteredDetails = (metrics.details || []).filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.id.toString().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
  });

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
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#D1915F' }}>RESTOCK LIST</h3>
              
              {/* ✅ UPDATED: Added an inline search control element row container block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input 
                  type="text" 
                  placeholder="Search ingredients..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '2px solid #f2d8c3',
                    fontSize: 13,
                    outline: 'none',
                    color: '#8A7E72',
                    backgroundColor: '#FFFFFF',
                    width: '200px',
                    fontFamily: 'inherit'
                  }}
                />

                {user?.role === 'admin' && (
                  <button 
                    onClick={handleExportCSV}
                    disabled={isLoading}
                    style={{ 
                      padding: '6px 12px', 
                      background: '#FFFFFF', 
                      border: '2px solid #f2d8c3', 
                      color: '#D1915F', 
                      borderRadius: 8, 
                      fontSize: 12, 
                      fontWeight: 700, 
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    EXPORT REPORT
                  </button>
                )}
              </div>
            </div>

            <div style={{ flexGrow: 1, border: '2px solid #f2d8c3', borderRadius: 12, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
              {/* ✅ MODIFIED: RestockList component now displays the dynamically targeted filtered details state snapshot */}
              <RestockList items={filteredDetails} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#D1915F' }}>PREDICTED NEEDS</h3>
            </div>
            <div style={{ flexGrow: 1, border: '2px solid #f2d8c3', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A7E72', fontStyle: 'italic', backgroundColor: '#FAFAFA' }}>
            </div>
          </div>
        )
      }
    />
  );
}