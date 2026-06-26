import React, { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import type { Ingredient } from '../types/InventoryItem';

interface DeleteIngredientFormProps {
  selectedIds: Set<number>;
  ingredients: Ingredient[];
  onSuccess: () => void;
  children: (props: {
    deleteError: string;
    handleDeleteIngredients: () => Promise<boolean>;
  }) => React.ReactNode;
}

export default function DeleteIngredientForm({
  selectedIds,
  ingredients,
  onSuccess,
  children,
}: DeleteIngredientFormProps) {
  const { deleteIngredient } = useInventory();
  const [deleteError, setDeleteError] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Use references to hold onto the resolve function across modal confirmation cycles
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const selectedTargets = ingredients.filter(item => selectedIds.has(item.ingredient_id));

  // Triggers when the user clicks the red "Confirm & Archive" button inside the popup dialog box
  const handleConfirmModalAction = async () => {
    setDeleteError('');

    for (const asset of selectedTargets) {
      const success = await deleteIngredient(asset.ingredient_id);
      if (!success) {
        setDeleteError(`Database Alert: Failed to process soft-delete archive for "${asset.ingredient_name}".`);
        setShowWarningModal(false);
        if (resolveRef.current) resolveRef.current(false);
        return;
      }
    }

    setShowWarningModal(false);
    onSuccess();
    if (resolveRef.current) resolveRef.current(true); // Tells parent component deletion was a success!
  };

  // Triggers when the user clicks the "Cancel" button inside the popup dialog box
  const handleCancelModalAction = () => {
    setShowWarningModal(false);
    if (resolveRef.current) resolveRef.current(false); // Tells parent component transaction aborted safely
  };

  // Intercepts the original parent execution and halts until the modal triggers a resolution resolution state
  const handleDeleteIngredients = async (): Promise<boolean> => {
    setDeleteError('');

    if (!selectedIds || selectedIds.size === 0) {
      setDeleteError('Selection Error: Please select at least one ingredient to delete.');
      return false;
    }

    // Opens the popup modal dialog card
    setShowWarningModal(true);

    // Creates a pending promise context that stays open until a button inside the modal is clicked
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  };

  return (
    <>
      {children({ deleteError, handleDeleteIngredients })}

      {/* WARNING POPUP MODAL DIALOG PORTAL */}
      {showWarningModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(30, 30, 30, 0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: '#FFFFFF', padding: 28, borderRadius: 16,
            width: 440, maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '2px solid #f2d8c3'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#D32F2F' }}>
              <span style={{ fontSize: 28 }}></span>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                Confirm Ingredient Deletion
              </h3>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: '#4A4A4A', lineHeight: 1.5 }}>
              You are about to remove <strong style={{ color: '#1E1E1E' }}>{selectedTargets.length} item(s)</strong> from active inventory tracking:
            </p>

            <div style={{
              background: '#F9F8F6', padding: '10px 14px', borderRadius: 10,
              maxHeight: 100, overflowY: 'auto', border: '1px solid #e2d2c2',
              display: 'flex', flexDirection: 'column', gap: 4
            }}>
              {selectedTargets.map(item => (
                <span key={item.ingredient_id} style={{ fontSize: 12, fontWeight: 700, color: '#8A7E72' }}>
                  • {item.ingredient_name} ({item.ingredient_category})
                </span>
              ))}
            </div>

            <div style={{
              background: '#FFF3F3', border: '1px solid #FFCDD2',
              padding: 12, borderRadius: 10, color: '#C62828', fontSize: 12,
              fontWeight: 600, lineHeight: 1.4
            }}>
             <strong>Operational Impact Note:</strong> These components are linked to active recipe allocations. Removing them will instantly force all corresponding menu products to display as <strong>SOLD OUT</strong> on the Point of Sales (POS) screen.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={handleCancelModalAction}
                style={{
                  padding: '12px 0', borderRadius: 10, border: '2px solid #f2d8c3',
                  background: '#FFFFFF', color: '#8A7E72', fontWeight: 700,
                  fontSize: 13, cursor: 'pointer', outline: 'none'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmModalAction}
                style={{
                  padding: '12px 0', borderRadius: 10, border: 'none',
                  background: '#D32F2F', color: '#FFFFFF', fontWeight: 800,
                  fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}