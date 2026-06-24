export interface IngredientUsageDetail {
  id: number;
  name: string;
  inStock: number;
  threshold: number;
  usedThisMonth: number;
  unit: string;
  status: 'IN STOCK' | 'LOW STOCK' | 'NO STOCK';
}


export interface KPIAnalytics {
  totalWeightKg: number;
  mostConsumedItem: string;
  lowStockCount: number;
  details: IngredientUsageDetail[];
}