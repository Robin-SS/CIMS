import { useState } from 'react';
import { supabase } from '../supabaseClient';
import AddIngredientFormUI from '../components/AddIngredientFormUI';

interface AddIngredientFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddIngredientForm({ onClose, onSuccess }: AddIngredientFormProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Ingredients');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [threshold, setThreshold] = useState('');
  const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !quantity || !unit || !threshold || !stockDate || !expiryDate) {
      setErrorMessage('Validation Error: All fields are explicitly required.');
      return;
    }

    const parsedQty = parseFloat(quantity);
    const parsedThreshold = parseInt(threshold);

    if (parsedQty < 0 || parsedThreshold < 0) {
      setErrorMessage('Validation Error: Quantity and Threshold values cannot be negative.');
      return;
    }

    if (new Date(expiryDate) <= new Date(stockDate)) {
      setErrorMessage('Validation Error: Expiration Date must be scheduled after the inbound Stock Date.');
      return;
    }

    const { error } = await supabase.from('ingredients').insert([
      {
        ingredient_name: name.trim(),
        ingredient_category: category,
        stock_quantity: parsedQty,
        measurement_unit: unit,
        threshold: parsedThreshold,
        stock_date: stockDate,
        expiry_date: expiryDate,
      },
    ]);

    if (error) {
      if (error.code === '23505') {
        setErrorMessage('Database Alert: An ingredient matching this exact name already exists.');
      } else {
        setErrorMessage(`Execution Error: ${error.message}`);
      }
    } else {
      setName('');
      setQuantity('');
      setThreshold('');
      setExpiryDate('');
      onSuccess();
    }
  };

  return (
    <AddIngredientFormUI
      onClose={onClose}
      onSubmit={handleAddIngredient}
      errorMessage={errorMessage}
      name={name}
      setName={setName}
      category={category}
      setCategory={setCategory}
      quantity={quantity}
      setQuantity={setQuantity}
      unit={unit}
      setUnit={setUnit}
      threshold={threshold}
      setThreshold={setThreshold}
      stockDate={stockDate}
      setStockDate={setStockDate}
      expiryDate={expiryDate}
      setExpiryDate={setExpiryDate}
    />
  );
}