import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';
import { ActivityService } from '../services/ActivityService';

import InventoryPageUI from '../components/InventoryPageUI';
import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';
import EditIngredientForm from '../features/EditIngredientForm';
import DeleteIngredientForm from '../features/DeleteIngredientForm';
import NotificationPanel from '../features/NotificationPanel';


type ActionView = 'menu' | 'add' | 'edit' | 'delete';

export default function InventoryPage() {
  const { user } = useAuth();
  const { ingredients, isLoading, refreshInventory } = useInventory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionView, setActionView] = useState<ActionView>('menu');
  
  // Selection States
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    refreshInventory();
  }, []);

  const handleToggleSelect = (item: Ingredient) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.ingredient_id)) {
        next.delete(item.ingredient_id);
      } else {
        next.add(item.ingredient_id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FFFFFF', color: '#D1915F', fontFamily: "'Inter', sans-serif" }}>
        <h2>Loading Live Inventory...</h2>
      </div>
    );
  }
  
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
                  {(addProps) => {
                    
                    // 🌟 1. Intercept ADD Submission (Target set to 'Inventory')
                    const interceptedFormSubmit = async (e: React.FormEvent) => {
                      const success = await addProps.handleAddIngredient(e);
                      if (success && user?.id) {
                        await ActivityService.logAction(
                          Number(user.id),
                          `ADDED: ${addProps.formName} (${addProps.formQuantity}${addProps.formUnit})`,
                          'Inventory'
                        );
                      }
                      return success;
                    };

                    // 🌟 2. Intercept EDIT Submission (Target set to 'Inventory')
                    const interceptedEditSubmit = async (e: React.FormEvent) => {
                      const success = await editProps.handleEditIngredient(e);
                      if (success && user?.id) {
                        await ActivityService.logAction(
                          Number(user.id),
                          `EDITED: ${editProps.editName} (Updated to ${editProps.editQuantity}${editProps.editUnit})`,
                          'Inventory'
                        );
                      }
                      return success;
                    };

                    // 🌟 3. Intercept DELETE Submission (Target set to 'Inventory')
                    const interceptedDeleteSubmit = async () => {
                      const targetedNames = ingredients
                        .filter(i => selectedIds.has(i.ingredient_id))
                        .map(i => i.ingredient_name)
                        .join(', ');

                      const success = await deleteProps.handleDeleteIngredients();
                      if (success && user?.id) {
                        await ActivityService.logAction(
                          Number(user.id),
                          `DELETED: ID(s) [${Array.from(selectedIds).join(', ')}] : ${targetedNames || 'Ingredients'}`,
                          'Inventory'
                        );
                      }
                      return success;
                    };

                    return (
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

                        // Selection Properties
                        selectedIngredient={selectedIngredient}
                        onSelectIngredient={setSelectedIngredient}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onClearSelection={handleClearSelection}

                        // Add Form Properties
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
                        hasExpiry={addProps.hasExpiry}
                        setHasExpiry={addProps.setHasExpiry}
                        onFormSubmit={interceptedFormSubmit}
                        
                        // Edit Form Properties
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
                        onEditSubmit={interceptedEditSubmit}
                        
                        // Delete Form Properties
                        deleteError={deleteProps.deleteError}
                        onDeleteSubmit={interceptedDeleteSubmit}
                      >
                        <NotificationPanel ingredients={ingredients} />
                      </InventoryPageUI>
                    );
                  }}
                </AddIngredientForm>
              )}
            </DeleteIngredientForm>
          )}
        </EditIngredientForm>
      )}
    </IngredientsTable>
  );
}