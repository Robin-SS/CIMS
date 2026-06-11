import React, { useState, useEffect } from 'react'; 
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
    hasExpiry: boolean;              // Exposed parameter to UI
    setHasExpiry: (v: boolean) => void; // Exposed parameter to UI
    handleAddIngredient: (e: React.FormEvent) => Promise<boolean>;
  }) => React.ReactNode;
}

export default function AddIngredientForm({ onSuccess, children }: AddIngredientFormProps) {
  const { ingredients, addIngredient } = useInventory();  

  const [formError, setFormError] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('INGREDIENTS'); 
  const [formQuantity, setFormQuantity] = useState('');
  const [formUnit, setFormUnit] = useState('pcs');
  const [formThreshold, setFormThreshold] = useState('');
  const [formStockDate, setFormStockDate] = useState(new Date().toISOString().split('T')[0]);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [hasExpiry, setHasExpiry] = useState(true); // Control checkbox state

  // Reset expiry rules dynamically when changing product groups
  useEffect(() => {
    if (formCategory === 'PACKAGING') {
      setHasExpiry(false);
      setFormExpiryDate('');
    } else {
      setHasExpiry(true);
      setFormExpiryDate('');
    }
  }, [formCategory]);

  const handleAddIngredient = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    setFormError('');

    const isDuplicate = ingredients.some(
      (item) => item.ingredient_name.trim().toLowerCase() === formName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setFormError('Validation Error: An ingredient matching this exact name already exists.');
      return false; 
    }

    // Expiration date field is required ONLY if hasExpiry is checked true
    const isExpiryMissing = hasExpiry && !formExpiryDate;

    if (!formName.trim() || !formQuantity || !formUnit || !formThreshold || !formStockDate || isExpiryMissing) {
      setFormError('Validation Error: All fields are explicitly required.');
      return false;
    }

    const parsedQty = parseFloat(formQuantity);
    const parsedThreshold = parseInt(formThreshold);

    if (parsedQty < 0 || parsedThreshold < 0) {
      setFormError('Validation Error: Quantity and Threshold values cannot be negative.');
      return false;
    }

    if (hasExpiry && new Date(formExpiryDate) <= new Date(formStockDate)) {
      setFormError('Validation Error: Expiration Date must be scheduled after the inbound Stock Date.');
      return false;
    }

    const success = await addIngredient({
      ingredient_name: formName.trim(),
      ingredient_category: formCategory,
      stock_quantity: parsedQty,
      measurement_unit: formUnit,
      threshold: parsedThreshold,
      stock_date: formStockDate,
      // If unchecked, send the dummy value to satisfy your Supabase constraint
      expiry_date: hasExpiry ? formExpiryDate : '9999-12-31', 
    });

    if (!success) {
      setFormError('Database Alert: Could not save item. Ensure parameters conform to constraints.');
      return false;
    } else {
      setFormName('');
      setFormQuantity('');
      setFormThreshold('');
      setFormExpiryDate('');
      setHasExpiry(true);
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