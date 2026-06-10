import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';
import EditIngredientForm from '../features/EditIngredientForm'; // Import your new feature file

export default function InventoryPage() {
  const { user } = useAuth();
  const { ingredients } = useInventory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

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
                  
                  // Selection Props
                  selectedIngredient={selectedIngredient}
                  onSelectIngredient={setSelectedIngredient}

                  // Add Form Props
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

                  // Edit Form Props
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
                />
              )}
            </AddIngredientForm>
          )}
        </EditIngredientForm>
      )}
    </IngredientsTable>
  );
}