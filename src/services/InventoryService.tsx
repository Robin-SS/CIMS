import { supabase } from '../supabaseClient';
import type { Ingredient }  from '../types/InventoryItem';


// Omit the auto-generated fields for the insert payload
export type NewIngredient = Omit<Ingredient, 'ingredient_id' | 'stock_status'>;

export const InventoryService = {
  /**
   * Fetches all ingredients from the database.
   */
  async getAllIngredients(): Promise<{ data: Ingredient[] | null; error: any }> {
    const { data, error } = await supabase.from('ingredients').select('*');
    return { data, error };
  },

  /**
   * Adds a new ingredient to the database.
   */
  async addIngredient(ingredientData: NewIngredient): Promise<{ error: any }> {
    const { error } = await supabase.from('ingredients').insert([ingredientData]);
    return { error };
  },

  async updateIngredient(
    ingredientId: number,
    ingredientData: Partial<Ingredient>
  ): Promise<{
    error: any;
  }> {

    const { error } =
      await supabase
        .from('ingredients')
        .update(ingredientData)
        .eq('ingredient_id', ingredientId);

    return { error };
  },

  async deleteIngredient(
    ingredientId: number
  ): Promise<{
    error: any;
  }> {

    const { error } =
      await supabase
        .from('ingredients')
        .delete()
        .eq('ingredient_id', ingredientId);

    return { error };
  }
};