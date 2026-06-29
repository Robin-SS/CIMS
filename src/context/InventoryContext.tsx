import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Ingredient } from '../types/InventoryItem';

interface InventoryContextType {
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  deleteIngredient: (ingredientId: number) => Promise<boolean>;
  addIngredient: (ingredientData: any) => Promise<boolean>;
  updateIngredient: (ingredientId: number, updatedData: any) => Promise<boolean>;
  // ✅ Exposed to allow form components to fetch the full list of ingredients
  getAllIngredientsIncludingDeleted: () => Promise<Ingredient[]>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

/**
 * Helper to check if an item's expiration date has been reached.
 * If expired, it overrides the stock quantity to 0.
 */
function enforceExpirationRules<T extends { expiry_date?: string | null; stock_quantity: number }>(item: T): T {
  if (!item.expiry_date) return item;

  const expiration = new Date(item.expiry_date);
  const today = new Date();

  // Reset hours to compare purely by calendar dates
  expiration.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // If today has reached or passed the expiration date, force stock to 0
  if (today >= expiration) {
    return {
      ...item,
      stock_quantity: 0,
    };
  }

  return item;
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInventory = async () => {
    setIsLoading(true);
    try {
      // Fetch only active records to hide soft-deleted rows from the Inventory dashboard
      const { data, error: fetchError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_deleted', false)
        .order('ingredient_name', { ascending: true });

      if (fetchError) throw fetchError;

      // Map over items to dynamically evaluate expiration dates on load
      const processedData = (data || []).map(item => enforceExpirationRules(item));
      
      setIngredients(processedData);
      setError(null);
    } catch (err: any) {
      console.error("Failed to sync inventory snapshot data packet:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FETCH HELPER: Pulls down every row regardless of deletion status for forms
  const getAllIngredientsIncludingDeleted = async (): Promise<Ingredient[]> => {
    try {
      const { data, error: err } = await supabase
        .from('ingredients')
        .select('*')
        .order('ingredient_name', { ascending: true });
      if (err) throw err;
      
      return (data || []).map(item => enforceExpirationRules(item));
    } catch (e) {
      console.error("Error fetching absolute inventory backup bounds:", e);
      return [];
    }
  };

  // FIXED INSERTION ENGINE: Automatically wakes up and overwrites soft-deleted unique duplicates
  const addIngredient = async (ingredientData: any): Promise<boolean> => {
    try {
      const nameClean = (ingredientData.ingredient_name || '').trim();

      // Run payload properties through expiration evaluation rules
      const validatedData = enforceExpirationRules({
        ...ingredientData,
        stock_quantity: Number(ingredientData.stock_quantity)
      });

      const { data: existingArchived, error: lookupError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('ingredient_name', nameClean)
        .eq('is_deleted', true)
        .maybeSingle(); 

      if (lookupError) throw lookupError;

      if (existingArchived) {
        console.log(`ℹ️ Reactivating archived inventory entry matching name: "${nameClean}"`);
        
        const { error: reactivateError } = await supabase
          .from('ingredients')
          .update({
            ingredient_category: validatedData.ingredient_category,
            stock_quantity: validatedData.stock_quantity, // Applied 0 check rule
            measurement_unit: validatedData.measurement_unit,
            threshold: Number(validatedData.threshold),
            stock_date: validatedData.stock_date || new Date().toISOString().split('T')[0],
            expiry_date: validatedData.expiry_date || null,
            is_deleted: false 
          })
          .eq('ingredient_id', existingArchived.ingredient_id);

        if (reactivateError) throw reactivateError;
      } else {
        const { error: insertError } = await supabase
          .from('ingredients')
          .insert([
            {
              ...validatedData,
              ingredient_name: nameClean,
              is_deleted: false 
            }
          ]);

        if (insertError) throw insertError;
      }

      await refreshInventory();
      return true;
    } catch (err: any) {
      console.error("Error adding/reactivating ingredient asset:", err);
      return false;
    }
  };

  // STANDARD RECORD UPDATES
  const updateIngredient = async (ingredientId: number, updatedData: any): Promise<boolean> => {
    try {
      // Validate incoming data payloads against expiration milestones
      const validatedData = enforceExpirationRules({
        ...updatedData,
        stock_quantity: Number(updatedData.stock_quantity ?? 0)
      });

      const { error: updateError } = await supabase
        .from('ingredients')
        .update(validatedData)
        .eq('ingredient_id', ingredientId);

      if (updateError) throw updateError;
      await refreshInventory();
      return true;
    } catch (err) {
      console.error(`Error updating ingredient ID #${ingredientId}:`, err);
      return false;
    }
  };

  // SOFT DELETION TRANSACTION HANDLER
  const deleteIngredient = async (ingredientId: number): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({
          stock_quantity: 0,
          is_deleted: true
        })
        .eq('ingredient_id', ingredientId);

      if (updateError) {
        console.error(`Database Alert: Soft delete aborted for ID #${ingredientId}:`, updateError.message);
        return false;
      }

      await refreshInventory();
      return true;
    } catch (err) {
      console.error("Unexpected error during soft deletion transaction execution:", err);
      return false;
    }
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  return (
    <InventoryContext.Provider value={{ 
      ingredients, 
      isLoading, 
      error, 
      refreshInventory, 
      deleteIngredient,
      addIngredient,     
      updateIngredient,
      getAllIngredientsIncludingDeleted // ✅ Provided safely to context hook
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be wrapped securely within an active InventoryProvider context hierarchy.');
  }
  return context;
}