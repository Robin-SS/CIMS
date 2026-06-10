import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_category: string;
  stock_quantity: number;
  measurement_unit: string;
  threshold: number;
  stock_status: string;
  stock_date: string;
  expiry_date: string;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIngredients = async () => {
    const { data, error } = await supabase.from('ingredients').select('*');
    if (!error && data) setIngredients(data);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <IngredientsTable ingredients={ingredients}>
      {({ sortedIngredients, sortColumn, sortDirection, handleSort }) => (
        <AddIngredientForm onSuccess={() => { setIsModalOpen(false); fetchIngredients(); }}>
          {(formProps) => (
            <InventoryPageUI
              userRole={user?.role}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              sortedIngredients={sortedIngredients}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              formError={formProps.formError}
              formName={formProps.formName}
              setFormName={formProps.setFormName}
              formCategory={formProps.formCategory}
              setFormCategory={formProps.setFormCategory}
              formQuantity={formProps.formQuantity}
              setFormQuantity={formProps.setFormQuantity}
              formUnit={formProps.formUnit}
              setFormUnit={formProps.setFormUnit}
              formThreshold={formProps.formThreshold}
              setFormThreshold={formProps.setFormThreshold}
              formStockDate={formProps.formStockDate}
              setFormStockDate={formProps.setFormStockDate}
              formExpiryDate={formProps.formExpiryDate}
              setFormExpiryDate={formProps.setFormExpiryDate}
              onFormSubmit={formProps.handleAddIngredient}
            />
          )}
        </AddIngredientForm>
      )}
    </IngredientsTable>
  );
}