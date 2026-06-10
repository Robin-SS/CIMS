import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';

export default function InventoryPage() {
  const { user } = useAuth();
  
  // Cleanly consume the global state and data-fetching layer
  const { ingredients } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <IngredientsTable ingredients={ingredients}>
      {({ sortedIngredients, sortColumn, sortDirection, handleSort }) => (
        <AddIngredientForm onSuccess={() => setIsModalOpen(false)}>
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