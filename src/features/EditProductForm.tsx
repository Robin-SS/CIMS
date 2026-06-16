import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { ProductService, type SelectedIngredientRecipe } from '../services/ProductService';
import { supabase } from '../supabaseClient'; // Make sure this import matches your project path

interface EditProductFormProps {
  productId: number;
  onClose: () => void;
  onRefreshCatalog: () => void;
  children: (props: {
    productName: string;
    setProductName: (v: string) => void;
    productCategory: string;
    setProductCategory: (v: string) => void;
    productPrice: string;
    setProductPrice: (v: string) => void;
    formError: string;
    isLoadingDetails: boolean;
    isSubmitting: boolean;
    selectedRecipes: SelectedIngredientRecipe[];
    handleAddIngredientRow: () => void;
    handleUpdateRecipeRow: (index: number, fields: Partial<SelectedIngredientRecipe>) => void;
    handleRemoveRecipeRow: (index: number) => void;
    handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  }) => React.ReactNode;
}

export default function EditProductForm({ productId, onClose, onRefreshCatalog, children }: EditProductFormProps) {
  const { ingredients } = useInventory();
  const { user } = useAuth();

  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Classics'); 
  const [productPrice, setProductPrice] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedIngredientRecipe[]>([]);

  // Fetch product data and its associated ingredient records from Supabase
  useEffect(() => {
    async function loadProductDetails() {
      try {
        setIsLoadingDetails(true);
        setFormError('');

        // 1. Fetch primary product details row info
        const { data: product, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('product_id', productId)
          .single();

        if (prodError) throw prodError;

        if (product) {
          setProductName(product.product_name);
          setProductCategory(product.product_category || 'Classics');
          setProductPrice(String(product.product_price));
        }

        // 2. Fetch all linked map recipe ingredients rows
        const { data: recipeRows, error: recipeError } = await supabase
          .from('prod_ingredient')
          .select('*')
          .eq('product_id', productId);

        if (recipeError) throw recipeError;

        if (recipeRows) {
          const formattedRecipes: SelectedIngredientRecipe[] = recipeRows.map((row) => {
            // Re-match back to inventory tracking references to maintain unit definitions consistency
            const matchedInv = ingredients.find(i => i.ingredient_id === row.ingredient_id);
            return {
              ingredient_id: row.ingredient_id,
              standard_quantity: row.standard_quantity,
              standard_measurement_unit: row.standard_measurement_unit || matchedInv?.measurement_unit || 'g'
            };
          });
          setSelectedRecipes(formattedRecipes);
        }
      } catch (err: any) {
        setFormError(err.message || 'Failed to retrieve product metadata specifications.');
      } finally {
        setIsLoadingDetails(false);
      }
    }

    if (productId) {
      loadProductDetails();
    }
  }, [productId, ingredients]);

  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    const firstItem = ingredients[0];
    setSelectedRecipes([
      ...selectedRecipes,
      {
        ingredient_id: firstItem.ingredient_id,
        standard_quantity: 1,
        standard_measurement_unit: firstItem.measurement_unit || 'g'
      }
    ]);
  };

  const handleUpdateRecipeRow = (index: number, fields: Partial<SelectedIngredientRecipe>) => {
    const nextList = [...selectedRecipes];
    nextList[index] = { ...nextList[index], ...fields };
    if (fields.ingredient_id) {
      const match = ingredients.find(i => i.ingredient_id === fields.ingredient_id);
      if (match) {
        nextList[index].standard_measurement_unit = match.measurement_unit;
      }
    }
    setSelectedRecipes(nextList);
  };

  const handleRemoveRecipeRow = (index: number) => {
    setSelectedRecipes(selectedRecipes.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!productName.trim() || !productCategory || !productPrice) {
      setFormError('Validation Error: All product fields are strictly required.');
      return;
    }

    const priceNum = parseFloat(productPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Validation Error: Price specification must be a positive number structure.');
      return;
    }

    for (const rec of selectedRecipes) {
      if (Number.isNaN(rec.standard_quantity) || rec.standard_quantity <= 0) {
        setFormError('Validation Error: Ingredient breakdown weights cannot be empty or zero.');
        return;
      }
    }

    setIsSubmitting(true);
    
    // We will leverage a dedicated service updater routine we'll add to ProductService next
    const { success, error } = await ProductService.updateProductWithIngredients(
      productId,
      productName.trim(),
      productCategory,
      priceNum,
      selectedRecipes,
      user?.user_id
    );
    
    setIsSubmitting(false);

    if (!success) {
      setFormError(error?.message || 'Database update failure encounter. Please check configuration privileges.');
    } else {
      onRefreshCatalog();
      onClose();
    }
  };

  return <>{children({
    productName, setProductName, productCategory, setProductCategory,
    productPrice, setProductPrice, formError, isLoadingDetails, isSubmitting, selectedRecipes,
    handleAddIngredientRow, handleUpdateRecipeRow, handleRemoveRecipeRow, handleFormSubmit
  })}</>;
}