import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

interface AddIngredientFormProps {
  onSuccess: () => void;
  children: (props: {
    formError: string;
    formName: string;
    setFormName: (v: string) => void;
    formCategory: string;
    setFormCategory: (v: string) => void;
    formQuantity: string;
    setFormQuantity: (v: string) => void;
    formUnit: string;
    setFormUnit: (v: string) => void;
    formThreshold: string;
    setFormThreshold: (v: string) => void;
    formStockDate: string;
    setFormStockDate: (v: string) => void;
    formExpiryDate: string;
    setFormExpiryDate: (v: string) => void;
    hasExpiry: boolean;
    setHasExpiry: (v: boolean) => void;
    handleAddIngredient: (e: React.FormEvent) => Promise<boolean>; // Returns a boolean status indicator
  }) => React.ReactNode;
}

export default function AddIngredientForm({ onSuccess, children }: AddIngredientFormProps) {
  const { ingredients, addIngredient } = useInventory(); 
  const [formError, setFormError] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('INGREDIENTS'); // Fixed: Casing matches UI category layout filters
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState('pcs');
  const [formThreshold, setFormThreshold] = useState('');
  const [formStockDate, setFormStockDate] = useState(new Date().toISOString().split('T')[0]);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);

  const handleAddIngredient = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    setFormError('');

    // Instant client-side duplicate prevention execution
    const isDuplicate = ingredients.some(
      (item) => item.ingredient_name.trim().toLowerCase() === formName.trim().toLowerCase()
    );

    if (isDuplicate) {
      setFormError('Validation Error: An ingredient matching this exact name already exists.');
      return false; 
    }

    // Missing fields validation check
    if (!formName.trim() || !formQuantity || !formUnit || !formThreshold || !formStockDate || (hasExpiry && !formExpiryDate)) {
      setFormError('Validation Error: All fields are explicitly required.');
      return false;
    }

    const parsedQty = parseFloat(formQuantity);
    const parsedThreshold = parseInt(formThreshold);

    // Negative parameters validation check
    if (parsedQty < 0 || parsedThreshold < 0) {
      setFormError('Validation Error: Quantity and Threshold values cannot be negative.');
      return false;
    }

    // Chronological order validation check
    if (hasExpiry && new Date(formExpiryDate) <= new Date(formStockDate)) {
      setFormError('Validation Error: Expiration Date must be scheduled after the inbound Stock Date.');
      return false;
    }

    // Default to '9999-12-31' if no expiry date is specified
    const finalExpiryDate = hasExpiry ? formExpiryDate : '9999-12-31';

    // Dispatch payload directly to context bucket architecture
    const success = await addIngredient({
      ingredient_name: formName.trim(),
      ingredient_category: formCategory,
      stock_quantity: parsedQty,
      measurement_unit: formUnit,
      threshold: parsedThreshold,
      stock_date: formStockDate,
      expiry_date: finalExpiryDate,
    });

    if (!success) {
      setFormError('Database Alert: Could not save item. Ensure the name is unique.');
      return false;
    } else {
      // Clear form inputs cleanly upon successful persistence sequence
      setFormName('');
      setFormQuantity('');
      setFormThreshold('');
      setFormExpiryDate('');
      setHasExpiry(false);
      onSuccess();
      return true;
    }
  };

  return <>{children({
    formError, formName, setFormName, formCategory, setFormCategory,
    formQuantity, setFormQuantity, formUnit, setFormUnit,
    formThreshold, setFormThreshold, formStockDate, setFormStockDate,
    formExpiryDate, setFormExpiryDate, hasExpiry, setHasExpiry, handleAddIngredient
  })}</>;
}