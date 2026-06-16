import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { ProductService, type SelectedIngredientRecipe } from '../services/ProductService';

interface AddProductFormProps {
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
    isSubmitting: boolean;
    selectedRecipes: SelectedIngredientRecipe[];
    handleAddIngredientRow: () => void;
    handleUpdateRecipeRow: (index: number, fields: Partial<SelectedIngredientRecipe>) => void;
    handleRemoveRecipeRow: (index: number) => void;
    handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  }) => React.ReactNode;
}

export default function AddProductForm({ onClose, onRefreshCatalog, children }: AddProductFormProps) {
  const { ingredients } = useInventory();
  const { user } = useAuth();

  const [productName, setProductName] = useState('');
  // ALIGNED: Initialized with the exact database enum case matching criteria 'Classics'
  const [productCategory, setProductCategory] = useState('Classics'); 
  const [productPrice, setProductPrice] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<SelectedIngredientRecipe[]>([]);

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
      setFormError('Validation Error: All product details are explicitly required.');
      return;
    }

    const priceNum = parseFloat(productPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Validation Error: Price must be a positive number structure.');
      return;
    }

    for (const rec of selectedRecipes) {
      if (rec.standard_quantity <= 0) {
        setFormError('Validation Error: Mapped Ingredient quantities cannot be zero or negative.');
        return;
      }
    }

    setIsSubmitting(true);
    
    // ALIGNED: Passing productCategory directly without modification because it now matches the DB enum perfectly
    const { success, error } = await ProductService.addProductWithIngredients(
      productName.trim(),
      productCategory, 
      priceNum,
      selectedRecipes,
      user?.user_id
    );
    
    setIsSubmitting(false);

    if (!success) {
      setFormError(error?.message || 'Database Transaction Error. Please recheck parameters.');
    } else {
      onRefreshCatalog();
      onClose();
    }
  };

  return <>{children({
    productName, setProductName, productCategory, setProductCategory,
    productPrice, setProductPrice, formError, isSubmitting, selectedRecipes,
    handleAddIngredientRow, handleUpdateRecipeRow, handleRemoveRecipeRow, handleFormSubmit
  })}</>;
}