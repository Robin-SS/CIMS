import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
<<<<<<< Updated upstream
import type { Ingredient } from '../types/InventoryItem';
import { InventoryService, type NewIngredient } from '../services/InventoryService';


interface InventoryContextType {
  ingredients: Ingredient[];
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);


=======
import type { Ingredient} from '../types/InventoryItem';
import { InventoryService, type NewIngredient } from '../services/InventoryService';


/**
 * Defines the blueprint for your global state, outlining the variables (ingredients) 
 * and functions (addIngredient, etc.) that will be accessible to your app.
 */
interface InventoryContextType {

  ingredients: Ingredient[];

  fetchIngredients: () => Promise<void>;

  addIngredient: (
    ingredient: NewIngredient
  ) => Promise<boolean>;

  updateIngredient: (
    ingredientId: number,
    ingredient: Partial<Ingredient>
  ) => Promise<boolean>;

  deleteIngredient: (
    ingredientId: number
  ) => Promise<boolean>;
}

//Initializes the empty context bucket that React will use to hold the data.
const InventoryContext =
  createContext<
    InventoryContextType | undefined
  >(undefined);

  // This is a wrapper component. Any components placed inside it (children) will have access to the inventory data.
export function InventoryProvider({
  children
}: {
  children: ReactNode;
}) {

  // Creates the active state variable that holds the list of ingredients currently loaded in the app.
  const [ingredients, setIngredients] =
    useState<Ingredient[]>([]);

  /**
   * React hook that automatically tells the app to fetch the ingredient list from the
   * database the very first time this provider loads.
   */
>>>>>>> Stashed changes
  useEffect(() => {
    fetchIngredients();
  }, []);

  async function fetchIngredients() {
<<<<<<< Updated upstream
    setIsLoading(true); 
    const { data, error } = await InventoryService.getAllIngredients();

    if (error) {
      console.error(error);
      setIsLoading(false);
=======

    const {data, error } = await InventoryService.getAllIngredients();

    if (error) {
      console.error(error);
>>>>>>> Stashed changes
      return;
    }

    setIngredients(data || []);
<<<<<<< Updated upstream
    setIsLoading(false);
  }

  async function addIngredient(ingredient: NewIngredient) {
=======
  }

  async function addIngredient(
    ingredient: NewIngredient
  ) {

>>>>>>> Stashed changes
    const { error } = await InventoryService.addIngredient(ingredient);

    if (error) {
      console.error(error);
      return false;
    }

    await fetchIngredients();
<<<<<<< Updated upstream
    return true;
  }

  async function updateIngredient(ingredientId: number, ingredient: Partial<Ingredient>) {
    const { error } = await InventoryService.updateIngredient(ingredientId, ingredient);
=======

    return true;
  }

  async function updateIngredient(
    ingredientId: number,
    ingredient: Partial<Ingredient>
  ) {

    const { error } =
      await InventoryService
        .updateIngredient(
          ingredientId,
          ingredient
        );
>>>>>>> Stashed changes

    if (error) {
      console.error(error);
      return false;
    }

    await fetchIngredients();
<<<<<<< Updated upstream
    return true;
  }

  async function deleteIngredient(ingredientId: number) {
    const { error } = await InventoryService.deleteIngredient(ingredientId);
=======

    return true;
  }

  async function deleteIngredient(
    ingredientId: number
  ) {

    const { error } =
      await InventoryService
        .deleteIngredient(
          ingredientId
        );
>>>>>>> Stashed changes

    if (error) {
      console.error(error);
      return false;
    }

    await fetchIngredients();
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    return true;
  }

  // This actually "broadcasts" the state variables and functions to the rest of the app.
  return (
    <InventoryContext.Provider
      value={{
        ingredients,
<<<<<<< Updated upstream
        isLoading,
        fetchIngredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        refreshInventory: fetchIngredients 
=======

        fetchIngredients,

        addIngredient,

        updateIngredient,

        deleteIngredient
>>>>>>> Stashed changes
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
<<<<<<< Updated upstream
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
=======

  const context =
    useContext(InventoryContext);

  if (!context) {
    throw new Error(
      'useInventory must be used within InventoryProvider'
    );
>>>>>>> Stashed changes
  }

  return context;
}