import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';
import EditIngredientForm from '../features/EditIngredientForm';

type ActionView = 'menu' | 'add' | 'edit' | 'delete';

export default function InventoryPage() {
  const { user } = useAuth();
  const { ingredients } = useInventory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [actionView, setActionView] = useState<ActionView>('menu'); // 1. Local state managed here

  return (
    <IngredientsTable ingredients={ingredients}>
      {({ sortedIngredients, sortColumn, sortDirection, handleSort }) => (
        <EditIngredientForm 
          selectedIngredient={selectedIngredient} 
          onSuccess={() => setSelectedIngredient(null)}
        >
          {(editProps) => (
            <AddIngredientForm onSuccess={() => setIsModalOpen(false)}>
              {(addProps) => (
                <InventoryPageUI
                  userRole={user?.role}
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  sortedIngredients={sortedIngredients}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  
                  // 2. Shared State Control passed down
                  actionView={actionView}
                  setActionView={setActionView}
                  selectedIngredient={selectedIngredient}
                  onSelectIngredient={setSelectedIngredient}

                  // Add Form State Properties
                  formError={addProps.formError}
                  formName={addProps.formName}
                  setFormName={addProps.setFormName}
                  formCategory={addProps.formCategory}
                  setFormCategory={addProps.setFormCategory}
                  formQuantity={addProps.formQuantity}
                  setFormQuantity={addProps.setFormQuantity}
                  formUnit={addProps.formUnit}
                  setFormUnit={addProps.setFormUnit}
                  formThreshold={addProps.formThreshold}
                  setFormThreshold={addProps.setFormThreshold}
                  formStockDate={addProps.formStockDate}
                  setFormStockDate={addProps.setFormStockDate}
                  formExpiryDate={addProps.formExpiryDate}
                  setFormExpiryDate={addProps.setFormExpiryDate}
                  onFormSubmit={addProps.handleAddIngredient}
                  
                  // Edit Form State Properties
                  editError={editProps.editError}
                  editName={editProps.editName}
                  setEditName={editProps.setEditName}
                  editCategory={editProps.editCategory}
                  setEditCategory={editProps.setEditCategory}
                  editQuantity={editProps.editQuantity}
                  setEditQuantity={editProps.setEditQuantity}
                  editUnit={editProps.editUnit}
                  setEditUnit={editProps.setEditUnit}
                  editThreshold={editProps.editThreshold}
                  setEditThreshold={editProps.setEditThreshold}
                  editStockDate={editProps.editStockDate}
                  setEditStockDate={editProps.setEditStockDate}
                  editExpiryDate={editProps.editExpiryDate}
                  setEditExpiryDate={editProps.setEditExpiryDate}
                  onEditSubmit={editProps.handleEditIngredient}

                  // 3. Fallback placeholders for Delete feature to satisfy TS types
                  deleteError=""
                  onDeleteSubmit={async () => true}
                />
              )}
            </AddIngredientForm>
          )}
        </EditIngredientForm>
      )}
    </IngredientsTable>
  );
}