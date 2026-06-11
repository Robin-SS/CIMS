import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';
import DeleteIngredientForm from '../features/DeleteIngredientForm';

type ActionView = 'menu' | 'add' | 'edit' | 'delete';

export default function InventoryPage() {
  const { user } = useAuth();
  const { ingredients } = useInventory();

  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [actionView, setActionView]           = useState<ActionView>('menu');

  // Multi-select: track selected ingredient IDs in a Set
  const [selectedIds, setSelectedIds]         = useState<Set<number>>(new Set());

  // Derive full Ingredient objects for DeleteIngredientForm
  const selectedIngredients = ingredients.filter(i => selectedIds.has(i.ingredient_id));

  const handleToggleSelect = (ingredient: Ingredient) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(ingredient.ingredient_id)) {
        next.delete(ingredient.ingredient_id);
      } else {
        next.add(ingredient.ingredient_id);
      }
      return next;
    });
  };

  const handleClearSelection = () => setSelectedIds(new Set());

  return (
    <IngredientsTable ingredients={ingredients}>
      {({ sortedIngredients, sortColumn, sortDirection, handleSort }) => (
        <AddIngredientForm onSuccess={() => setIsModalOpen(false)}>
          {(addProps) => (
            <DeleteIngredientForm
              selectedIngredients={selectedIngredients}
              onSuccess={handleClearSelection}
            >
              {(deleteProps) => (
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
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onClearSelection={handleClearSelection}

                  // Add props
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

                  // Delete props
                  deleteError={deleteProps.deleteError}
                  onDeleteSubmit={deleteProps.handleDeleteIngredients}
                />
              )}
            </DeleteIngredientForm>
          )}
        </AddIngredientForm>
      )}
    </IngredientsTable>
  );
}