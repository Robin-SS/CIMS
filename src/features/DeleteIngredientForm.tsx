import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

interface DeleteIngredientFormProps {
  selectedIds: Set<number>;
  ingredients: Ingredient[];
  onSuccess: () => void;
  children: (props: {
    deleteError: string;
    handleDeleteIngredients: () => Promise<boolean>;
  }) => React.ReactNode;
}

export default function DeleteIngredientForm({
  selectedIds,
  ingredients,
  onSuccess,
  children,
}: DeleteIngredientFormProps) {
  const { deleteIngredient } = useInventory();
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteIngredients = async (): Promise<boolean> => {
    setDeleteError('');

    if (!selectedIds || selectedIds.size === 0) {
      setDeleteError('Selection Error: Please select at least one ingredient to delete.');
      return false;
    }

    // Convert Set IDs directly back into reference models
    const targets = ingredients.filter(item => selectedIds.has(item.ingredient_id));

    // Delete all selected assets sequentially down the stream
    for (const asset of targets) {
      const success = await deleteIngredient(asset.ingredient_id);
      if (!success) {
        setDeleteError(`Database Alert: Failed to delete "${asset.ingredient_name}".`);
        return false;
      }
    }

    onSuccess();
    return true;
  };

  return <>{children({ deleteError, handleDeleteIngredients })}</>;
}