import { supabase } from '../supabaseClient';
import type { KPIAnalytics } from '../types/Analytics';

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

      const lowStockCount = (ingredients || []).filter(
        ing => Number(ing.stock_quantity) <= Number(ing.threshold)
      ).length;

      return {
        data: {
          totalWeightKg: totalUsageInGramsOrMl, 
          mostConsumedItem: maxAmount > 0 ? mostConsumedStr : 'None - 0/week', 
          lowStockCount
        },
        error: null
      };
    } catch (err: any) {
      console.error('Failed to aggregate usage analytics:', err);
      return { data: null, error: err.message };
    }
  }
};