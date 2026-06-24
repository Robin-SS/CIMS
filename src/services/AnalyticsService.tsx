import { supabase } from '../supabaseClient';
import type { KPIAnalytics, IngredientUsageDetail  } from '../types/Analytics';

export const AnalyticsService = {
  async getUsageMetrics(): Promise<{ data: KPIAnalytics | null; error: string | null }> {
    try {
      const { data: orderItems, error: orderError } = await supabase
        .from('order_item') 
        .select('product_id, order_quantity');

      if (orderError) throw orderError;

      const { data: ingredients, error: ingError } = await supabase
        .from('ingredients')
        .select('ingredient_id, ingredient_name, stock_quantity, threshold, measurement_unit');

      if (ingError) throw ingError;

      const { data: recipes, error: recipeError } = await supabase
        .from('prod_ingredient') 
        .select('product_id, ingredient_id, standard_quantity');

      if (recipeError) throw recipeError;

     // --- Aggregation Mathematics ---
      let totalUsageInGramsOrMl = 0;
      const ingredientUsageMap: Record<string, { total: number; unit: string }> = {};

      (orderItems || []).forEach(item => {
        const matchingRecipes = (recipes || []).filter(r => 
          Number(r.product_id) === Number(item.product_id)
        );
        
        matchingRecipes.forEach(recipe => {
          const ing = (ingredients || []).find(i => 
            Number(i.ingredient_id) === Number(recipe.ingredient_id)
          );
          
          if (!ing) return;

          const amountUsed = Number(recipe.standard_quantity || 0) * Number(item.order_quantity || 0);
          totalUsageInGramsOrMl += amountUsed;

          if (!ingredientUsageMap[ing.ingredient_name]) {
            ingredientUsageMap[ing.ingredient_name] = { total: 0, unit: ing.measurement_unit || 'L' };
          }
          ingredientUsageMap[ing.ingredient_name].total += amountUsed;
        });
      });

      let mostConsumedStr = 'None - 0/week';
      let maxAmount = 0;
      Object.entries(ingredientUsageMap).forEach(([name, data]) => {
        if (data.total > maxAmount) {
          maxAmount = data.total;
          mostConsumedStr = `${name} - ${data.total.toFixed(0)}${data.unit}/week`;
        }
      });

      const details: IngredientUsageDetail[] = (ingredients || []).map(ing => {
        const used = ingredientUsageMap[ing.ingredient_name]?.total || 0;
        const stock = Number(ing.stock_quantity);
        const thresh = Number(ing.threshold);
        let status: 'IN STOCK' | 'LOW STOCK' | 'NO STOCK' = 'IN STOCK';

        // Conditional Evaluation Engine
        if (stock <= 0) status = 'NO STOCK';
        else if (stock <= thresh) status = 'LOW STOCK';

        return {
          id: ing.ingredient_id,
          name: ing.ingredient_name,
          inStock: stock,
          threshold: thresh,
          usedThisMonth: used,
          unit: ing.measurement_unit || 'L',
          status
        };
      });

      details.sort((a, b) => {
        const rank = { 'NO STOCK': 2, 'LOW STOCK': 1, 'IN STOCK': 0 };
        return rank[b.status] - rank[a.status];
      });

      const lowStockCount = details.filter(d => d.status !== 'IN STOCK').length;

      return {
        data: {
          totalWeightKg: totalUsageInGramsOrMl, 
          mostConsumedItem: maxAmount > 0 ? mostConsumedStr : 'None - 0/week', 
          lowStockCount,
          details
        },
        error: null
      };
    } catch (err: any) {
      console.error('Failed to aggregate usage analytics:', err);
      return { data: null, error: err.message };
    }
  }
};