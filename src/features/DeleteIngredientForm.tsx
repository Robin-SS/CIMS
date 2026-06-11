import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

interface DeleteIngredientFormProps {
  selectedIngredients: Ingredient[];
  onSuccess: () => void;
  children: (props: {
    deleteError: string;
    handleDeleteIngredients: () => Promise<boolean>;
  }) => React.ReactNode;
}

export default function DeleteIngredientForm({
  selectedIngredients,
  onSuccess,
  children,
}: DeleteIngredientFormProps) {
  const { deleteIngredient } = useInventory();
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteIngredients = async (): Promise<boolean> => {
    setDeleteError('');

    if (selectedIngredients.length === 0) {
      setDeleteError('Selection Error: Please select at least one ingredient to delete.');
      return false;
    }

    // Delete all selected sequentially
    for (const ingredient of selectedIngredients) {
      const success = await deleteIngredient(ingredient.ingredient_id);
      if (!success) {
        setDeleteError(`Database Alert: Failed to delete "${ingredient.ingredient_name}".`);
        return false;
      }
    }

    onSuccess();
    return true;
  };

  return <>{children({ deleteError, handleDeleteIngredients })}</>;
}