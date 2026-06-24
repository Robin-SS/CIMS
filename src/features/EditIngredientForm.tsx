import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

interface EditIngredientFormProps {
  selectedIngredient: Ingredient | null;
  onSuccess: () => void;
  children: (props: {
    editError: string;
    editName: string;
    setEditName: (v: string) => void;
    editCategory: string;
    setEditCategory: (v: string) => void;
    editQuantity: string;
    setEditQuantity: (v: string) => void;
    editUnit: string;
    setEditUnit: (v: string) => void;
    editThreshold: string;
    setEditThreshold: (v: string) => void;
    editStockDate: string;
    setEditStockDate: (v: string) => void;
    editExpiryDate: string;
    setEditExpiryDate: (v: string) => void;
    handleEditIngredient: (e: React.FormEvent) => Promise<boolean>;
  }) => React.ReactNode;
}

export default function EditIngredientForm({ selectedIngredient, onSuccess, children }: EditIngredientFormProps) {
  const { ingredients, updateIngredient } = useInventory();
  
  const [editError, setEditError] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('INGREDIENTS');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('pcs');
  const [editThreshold, setEditThreshold] = useState('');
  const [editStockDate, setEditStockDate] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  // Automatically fill the input fields whenever a user clicks a row in the table
  useEffect(() => {
    if (selectedIngredient) {
      setEditError('');
      setEditName(selectedIngredient.ingredient_name);
      setEditCategory(selectedIngredient.ingredient_category.toUpperCase());
      setEditQuantity(selectedIngredient.stock_quantity.toString());
      setEditUnit(selectedIngredient.measurement_unit);
      setEditThreshold(selectedIngredient.threshold.toString());
      setEditStockDate(selectedIngredient.stock_date);
      setEditExpiryDate(selectedIngredient.expiry_date || '');
    }
  }, [selectedIngredient]);

  const handleEditIngredient = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    setEditError('');

    if (!selectedIngredient) {
      setEditError('Selection Error: Please select an ingredient from the table first.');
      return false;
    }

    // Validation: Duplicate Name Check (Excluding the item's own original name)
    const isDuplicate = ingredients.some(
      (item) => 
        item.ingredient_id !== selectedIngredient.ingredient_id &&
        item.ingredient_name.trim().toLowerCase() === editName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setEditError('Validation Error: Another ingredient matching this exact name already exists.');
      return false;
    }

    if (!editName.trim() || !editQuantity || !editUnit || !editThreshold || !editStockDate || !editExpiryDate) {
      setEditError('Validation Error: All fields are explicitly required.');
      return false;
    }

    const parsedQty = parseFloat(editQuantity);
    const parsedThreshold = parseInt(editThreshold);

    if (parsedQty < 0 || parsedThreshold < 0) {
      setEditError('Validation Error: Quantity and Threshold values cannot be negative.');
      return false;
    }

    if (new Date(editExpiryDate) <= new Date(editStockDate)) {
      setEditError('Validation Error: Expiration Date must be scheduled after the inbound Stock Date.');
      return false;
    }

    const success = await updateIngredient(selectedIngredient.ingredient_id, {
      ingredient_name: editName.trim(),
      ingredient_category: editCategory,
      stock_quantity: parsedQty,
      measurement_unit: editUnit,
      threshold: parsedThreshold,
      stock_date: editStockDate,
      expiry_date: editExpiryDate,
    });

    if (!success) {
      setEditError('Database Alert: Could not update item definitions.');
      return false;
    }

    onSuccess();
    return true;
  };

  return <>{children({
    editError, editName, setEditName, editCategory, setEditCategory,
    editQuantity, setEditQuantity, editUnit, setEditUnit,
    editThreshold, setEditThreshold, editStockDate, setEditStockDate,
    editExpiryDate, setEditExpiryDate, handleEditIngredient
  })}</>;
}