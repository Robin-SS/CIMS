import { supabase } from '../supabaseClient';
import type { PredictedIngredientDetail } from '../features/PredictedIngredientNeeds';

export async function calculatePredictedNeeds(startDateInput: Date, endDateInput: Date) {
  try {
    // --- CARD 1: TIMELINE BOUNDARIES ---
    const startDate = new Date(startDateInput);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999);

    const timeDiff = endDate.getTime() - startDate.getTime();
    const lookAheadDays = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24))); 

    const forecastPeriodStr = `${startDate.toLocaleDateString('en-US')} - ${endDate.toLocaleDateString('en-US')}`;
    
    // --- CARD 2: PREDICTED VOLUME (28-DAY VELOCITY WINDOW) ---
    const pastWindowDays = 28;
    const historyStartDate = new Date();
    historyStartDate.setDate(historyStartDate.getDate() - pastWindowDays);

    // STEP 1: Get all transaction IDs from the last 28 days
    const { data: recentTransactions, error: txnError } = await supabase
      .from('transactions')
      .select('transaction_id, transaction_date')
      .gte('transaction_date', historyStartDate.toISOString());

    if (txnError) throw txnError;

    if (!recentTransactions || recentTransactions.length === 0) {
      return {
        data: {
          forecastPeriodStr,
          predictedOrdersCount: 0,
          ingredientsToOrderCount: 0,
          dailyOrderRate: 0,
          predictedIngredientDetails: [] as PredictedIngredientDetail[]
        },
        error: null
      };
    }

    const validTransactionIds = recentTransactions.map((t: any) => t.transaction_id);

    const { data: pastSales, error: salesError } = await supabase
      .from('order_item')
      .select('product_id, order_quantity, transaction_id')
      .in('transaction_id', validTransactionIds);

    if (salesError) throw salesError;

    if (!pastSales || pastSales.length === 0) {
      return {
        data: {
          forecastPeriodStr,
          predictedOrdersCount: 0,
          ingredientsToOrderCount: 0,
          dailyOrderRate: 0,
          predictedIngredientDetails: [] as PredictedIngredientDetail[]
        },
        error: null
      };
    }

    const productTotals: Record<number, number> = {};
    pastSales.forEach((item: any) => {
      if (!item.product_id) return;
      const quantitySold = Number(item.order_quantity || 1);
      productTotals[item.product_id] = (productTotals[item.product_id] || 0) + quantitySold;
    });

    let totalPredictedOrdersCount = 0;
    const productPredictedDemand: Record<number, number> = {};

    Object.keys(productTotals).forEach(pIdStr => {
      const productId = Number(pIdStr);
      const dailyRate = productTotals[productId] / pastWindowDays;
      const projectedNeeds = Math.ceil(dailyRate * lookAheadDays);

      productPredictedDemand[productId] = projectedNeeds;
      totalPredictedOrdersCount += projectedNeeds;
    });


    const totalSoldInWindow = Object.values(productTotals).reduce((sum, v) => sum + v, 0);
    const overallDailyRate = Math.round(totalSoldInWindow / pastWindowDays);

    // --- CARD 3: RECIPE EXPLOSION & LIVE DEFICIT ANALYSIS ---
    const productIdsWithDemand = Object.keys(productPredictedDemand).map(Number);

    const { data: recipes, error: recipeError } = await supabase
      .from('prod_ingredient')
      .select(`
        product_id,
        ingredient_id,
        standard_quantity,
        ingredients!prod_ingredient_ingredient_id_fkey (
          ingredient_name,
          stock_quantity,
          threshold,
          measurement_unit
        )
      `)
      .in('product_id', productIdsWithDemand);

    if (recipeError) throw recipeError;

    const cumulativeIngredientDemand: Record<number, {
      required: number;
      stockQuantity: number;
      threshold: number;
      name: string;
      unit: string;
    }> = {};

    if (recipes) {
      recipes.forEach((recipe: any) => {
        const predictedItemSales = productPredictedDemand[recipe.product_id] || 0;
        const totalIngredientNeeded = Number(recipe.standard_quantity || 0) * predictedItemSales;

        const ingredientData = Array.isArray(recipe.ingredients)
          ? recipe.ingredients[0]
          : recipe.ingredients;

        if (!cumulativeIngredientDemand[recipe.ingredient_id]) {
          cumulativeIngredientDemand[recipe.ingredient_id] = {
            required: 0,
            stockQuantity: Number(ingredientData?.stock_quantity || 0),
            threshold: Number(ingredientData?.threshold || 0),
            name: ingredientData?.ingredient_name || `Ingredient #${recipe.ingredient_id}`,
            unit: ingredientData?.measurement_unit || 'L',
          };
        }
        cumulativeIngredientDemand[recipe.ingredient_id].required += totalIngredientNeeded;
      });
    }

    let ingredientsToOrderCount = 0;
    const predictedIngredientDetails: PredictedIngredientDetail[] = [];

    for (const ingId in cumulativeIngredientDemand) {
      const ing = cumulativeIngredientDemand[ingId];
      const targetBuffer = ing.required + ing.threshold;
      const needsOrder = targetBuffer > ing.stockQuantity;

      if (needsOrder) {
        ingredientsToOrderCount++;
      }

      predictedIngredientDetails.push({
        id: Number(ingId),
        name: ing.name,
        currentStock: ing.stockQuantity,
        predictedNeed: Math.round(ing.required * 100) / 100,
        unit: ing.unit,
        actionNeeded: needsOrder ? 'ORDER NOW' : 'ENOUGH STOCK'
      });
    }


   // TRACK B: Simple stock check for CONSUMABLES and PACKAGING
    const { data: nonFoodItems, error: nonFoodError } = await supabase
      .from('ingredients')
      .select('ingredient_id, ingredient_name, stock_quantity, threshold, measurement_unit, ingredient_category')
      .in('ingredient_category', ['CONSUMABLES', 'PACKAGING']);
 
    if (nonFoodError) throw nonFoodError;
 
    if (nonFoodItems) {
      nonFoodItems.forEach((item: any) => {
        const itemId = Number(item.ingredient_id);

        if (cumulativeIngredientDemand[itemId]) {
          return; 
        }

        // Flag if current stock is already below or equal to the safety threshold
        const needsOrder = Number(item.stock_quantity) <= Number(item.threshold);
        if (needsOrder) {
          ingredientsToOrderCount++;
        }

        predictedIngredientDetails.push({
          id: itemId,
          name: item.ingredient_name,
          currentStock: Number(item.stock_quantity),
          predictedNeed: Number(item.threshold), 
          unit: item.measurement_unit || '',
          actionNeeded: needsOrder ? 'ORDER NOW' : 'ENOUGH STOCK'
        });
      });
    }

    predictedIngredientDetails.sort((a, b) => {
      const rank = { 'ORDER NOW': 1, 'ENOUGH STOCK': 0 };
      return rank[b.actionNeeded] - rank[a.actionNeeded];
    });

    return {
      data: {
        forecastPeriodStr,
        predictedOrdersCount: totalPredictedOrdersCount,
        ingredientsToOrderCount,
        dailyOrderRate: overallDailyRate,
        predictedIngredientDetails
      },
      error: null
    };

  } catch (err: any) {
    console.error("Error calculating predictive metrics directly:", err);
    return { data: null, error: err.message || 'Error processing forecast data' };
  }
}