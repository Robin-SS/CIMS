import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';
import NotificationPanel from '../features/NotificationPanel';

type ActionView = 'menu' | 'add' | 'edit' | 'delete';

export default function InventoryPage() {
  const { user } = useAuth();
  const { ingredients } = useInventory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [actionView, setActionView] = useState<ActionView>('menu');

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
              
              // Shared State Control
              actionView={actionView}
              setActionView={setActionView}
              selectedIngredient={selectedIngredient}
              onSelectIngredient={setSelectedIngredient}

              // Add Form Bindings
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
              
              // Fallback placeholders for Edit/Delete to prevent layout breaks
              editError=""
              editName=""
              setEditName={() => {}}
              editCategory=""
              setEditCategory={() => {}}
              editQuantity=""
              setEditQuantity={() => {}}
              editUnit=""
              setEditUnit={() => {}}
              editThreshold=""
              setEditThreshold={() => {}}
              editStockDate=""
              setEditStockDate={() => {}}
              editExpiryDate=""
              setEditExpiryDate={() => {}}
              onEditSubmit={async () => true}
              deleteError=""
              onDeleteSubmit={async () => true}
            >
              {/* Passed down correctly to the right-side layout stream */}
              <NotificationPanel />
            </InventoryPageUI>
          )}
        </AddIngredientForm>
      )}
    </IngredientsTable>
  );
}