import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Ingredient } from '../types/InventoryItem';
import { InventoryService, type NewIngredient } from '../services/InventoryService';


interface InventoryContextType {
  ingredients: Ingredient[];
  fetchIngredients: () => Promise<void>;
  addIngredient: (ingredient: NewIngredient) => Promise<boolean>;
  updateIngredient: (ingredientId: number, ingredient: Partial<Ingredient>) => Promise<boolean>;
  deleteIngredient: (ingredientId: number) => Promise<boolean>;
  refreshInventory: () => Promise<void>; 
}

// Initializes the empty context bucket that React will use to hold the data.
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// This is a wrapper component. Any components placed inside it (children) will have access to the inventory data.
export function InventoryProvider({ children }: { children: ReactNode }) {

  // Creates the active state variable that holds the list of ingredients currently loaded in the app.
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);


  useEffect(() => {
    fetchIngredients();
  }, []);

  async function fetchIngredients() {
    const { data, error } = await InventoryService.getAllIngredients();

    if (error) {
      console.error(error);
      return;
    }

    setIngredients(data || []);
  }

  async function addIngredient(ingredient: NewIngredient) {
    const { error } = await InventoryService.addIngredient(ingredient);

    if (error) {
      console.error(error);
      return false;
    }

    await fetchIngredients();
    return true;
  }

  async function updateIngredient(ingredientId: number, ingredient: Partial<Ingredient>) {
    const { error } = await InventoryService.updateIngredient(ingredientId, ingredient);

    if (error) {
      console.error(error);
      return false;
    }

    await fetchIngredients();
    return true;
  }

  async function deleteIngredient(ingredientId: number) {
    const { error } = await InventoryService.deleteIngredient(ingredientId);

    if (error) {
      console.error(error);
      return false;
    }

    await fetchIngredients();
    return true;
  }

  // This actually "broadcasts" the state variables and functions to the rest of the app.
  return (
    <InventoryContext.Provider
      value={{
        ingredients,
        fetchIngredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        refreshInventory: fetchIngredients 
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }

  return context;
}