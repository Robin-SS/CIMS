import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';
import EditIngredientForm from '../features/EditIngredientForm';
import DeleteIngredientForm from '../features/DeleteIngredientForm';
import NotificationPanel from '../features/NotificationPanel';

type ActionView = 'menu' | 'add' | 'edit' | 'delete';

export default function InventoryPage() {
  const { user } = useAuth();
  const { ingredients } = useInventory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionView, setActionView] = useState<ActionView>('menu');
  
  // Selection States
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleToggleSelect = (item: Ingredient) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.ingredient_id)) next.delete(item.ingredient_id);
      else next.add(item.ingredient_id);
      return next;
    });
  };

  const handleClearSelection = () => setSelectedIds(new Set());

  return (
    <IngredientsTable ingredients={ingredients}>
      {({ sortedIngredients, sortColumn, sortDirection, handleSort }) => (
        <EditIngredientForm 
          selectedIngredient={selectedIngredient} 
          onSuccess={() => setSelectedIngredient(null)}
        >
          {(editProps) => (
            <DeleteIngredientForm
              selectedIds={selectedIds}
              ingredients={ingredients}
              onSuccess={handleClearSelection}
            >
              {(deleteProps) => (
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
                      
                      actionView={actionView}
                      setActionView={setActionView}
                      selectedIngredient={selectedIngredient}
                      onSelectIngredient={setSelectedIngredient}
                      selectedIds={selectedIds}
                      onToggleSelect={handleToggleSelect}
                      onClearSelection={handleClearSelection}

                      // Form Bindings
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
                      setFormExpiryDate={addProps.setFormExpiryDate} // <--- Make sure this line exists
                      onFormSubmit={addProps.handleAddIngredient}
                      
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
                      
                      deleteError={deleteProps.deleteError}
                      onDeleteSubmit={deleteProps.handleDeleteIngredients}
                    >
                      <NotificationPanel />
                    </InventoryPageUI>
                  )}
                </AddIngredientForm>
              )}
            </DeleteIngredientForm>
          )}
        </EditIngredientForm>
      )}
    </IngredientsTable>
  );
}