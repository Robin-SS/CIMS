import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient'; 
import { ActivityService } from '../services/ActivityService';

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  standard_measurement_unit?: string;
}

interface IngredientAdjustmentFormProps {
  ingredients: Ingredient[];
  userId?: string | number; 
  onSuccess?: (insertedRequest: any) => void; 
  onCancel?: () => void; 
}

export default function IngredientAdjustmentForm({ ingredients, userId, onSuccess, onCancel }: IngredientAdjustmentFormProps) {
  const [formData, setFormData] = useState({
    ingredient_id: '',
    quantity: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [showConfirmation, setShowConfirmation] = useState(false);

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#D1915F', marginBottom: 4 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 12, border: '1px solid #D1915F', fontSize: 13, outline: 'none', color: '#1E1E1E', backgroundColor: '#FFFFFF', boxSizing: 'border-box' };

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreSubmitValidation = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.ingredient_id || !formData.quantity || !formData.reason.trim()) {
      alert("Please populate all required fields.");
      return;
    }
    setShowConfirmation(true); 
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setStatus('idle');
    setShowConfirmation(false); 

    const qty = parseInt(formData.quantity, 10);
    const ingredientId = parseInt(formData.ingredient_id, 10);
    const cleanUserId = userId ? (typeof userId === 'number' ? userId : parseInt(String(userId), 10)) : null;

    // Find ingredient name beforehand for the activity description log
    const ingredientName = ingredients.find(i => i.ingredient_id === ingredientId)?.ingredient_name || `Ingredient #${ingredientId}`;

    try {
      const { data, error } = await supabase
        .from('inventory_adjustment_requests') 
        .insert([
          {
            ingredient_id: ingredientId,
            quantity: qty,
            reason: formData.reason,
            requested_by: cleanUserId, 
            request_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // 🌟 1. INSERTED TRIGGER FOR AUDIT LOGGING HERE 🌟
      if (cleanUserId) {
        await ActivityService.logAction(
          cleanUserId,
          `Requested stock adjustment for ${qty > 0 ? `+${qty}` : qty} ${ingredientName}`,
          'Inventory'
        );
      }

      setStatus('success');
      setFormData({ ingredient_id: '', quantity: '', reason: '' });

      if (onSuccess) onSuccess(data);

    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData({ ingredient_id: '', quantity: '', reason: '' });
    setStatus('idle');
    if (onCancel) onCancel(); 
  };

  const selectedIngredientName = ingredients.find(
    i => i.ingredient_id === parseInt(formData.ingredient_id, 10)
  )?.ingredient_name || 'Selected Item';

  return (
    <div style={{ position: 'relative', background: '#FFFFFF', border: '1px solid #D3C9BE', borderRadius: 16, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', fontFamily: "'Inter', sans-serif" }}>
      
      {/* VALIDATION CONFIRMATION DIALOG MODAL */}
      {showConfirmation && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, zIndex: 10, backdropFilter: 'blur(1px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D1915F', marginBottom: 12 }}>
            <AlertTriangle size={20} />
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>CONFIRM ADJUSTMENT REQUEST</h4>
          </div>
          
          <p style={{ margin: '0 0 16px 0', fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
            Are you sure you want to log a request for <strong style={{ color: '#1E1E1E' }}>{formData.quantity}x {selectedIngredientName}</strong>? This action will await management approval.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button 
              type="button" 
              onClick={handleFinalSubmit}
              style={{ width: '100%', padding: '12px 0', background: '#D1915F', color: '#FFF', fontWeight: 700, fontSize: 13, borderRadius: 12, border: 'none', cursor: 'pointer' }}
            >
              Confirm & Submit
            </button>
            <button 
              type="button" 
              onClick={() => setShowConfirmation(false)}
              style={{ width: '100%', padding: '10px 0', background: 'transparent', color: '#8A7E72', fontWeight: 600, fontSize: 12, borderRadius: 12, border: '1px solid #D3C9BE', cursor: 'pointer' }}
            >
              Go Back / Edit
            </button>
          </div>
        </div>
      )}

      {/* STANDARD ENTRY HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <ClipboardList style={{ color: '#D1915F' }} size={20} />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1E1E1E', letterSpacing: 0.5 }}>
          STOCK ADJUSTMENT REQUEST
        </h2>
      </div>

      <form onSubmit={handlePreSubmitValidation} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Select Ingredient <span style={{ color: '#FF2C2C' }}>*</span></label>
          <select name="ingredient_id" required value={formData.ingredient_id} onChange={handleChange} style={inputStyle}>
            <option value="">-- Choose Item From Grid --</option>
            {ingredients.map((item) => (
              <option key={item.ingredient_id} value={item.ingredient_id}>
                {item.ingredient_name} {item.standard_measurement_unit ? `(${item.standard_measurement_unit})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Quantity Offset Delta <span style={{ color: '#FF2C2C' }}>*</span></label>
          <input type="number" name="quantity" required value={formData.quantity} onChange={handleChange} placeholder="e.g., -5 for spoilage, 10 for restock" style={inputStyle} />
          <span style={{ fontSize: 10, color: '#8A7E72', display: 'block', marginTop: 4 }}>
            Use a negative number to subtract inventory stock, positive to request incremental additions.
          </span>
        </div>

        <div>
          <label style={labelStyle}>Reason / Justification <span style={{ color: '#FF2C2C' }}>*</span></label>
          <textarea name="reason" required rows={3} value={formData.reason} onChange={handleChange} placeholder="Provide context regarding this entry (e.g., Spoilage, unexpected peak demand)" style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit', lineHeight: 1.4 }} />
        </div>

        {status === 'success' && (
          <div style={{ padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
            ✓ Request filed successfully! Added to database.
          </div>
        )}
        {status === 'error' && (
          <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
            ⚠️ Database Error: Failed to publish transaction packet to Supabase.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button 
            type="button" 
            disabled={isSubmitting} 
            onClick={handleClearForm}
            style={{ flex: 1, padding: '12px 0', background: '#FFFFFF', color: '#8A7E72', fontWeight: 700, fontSize: 13, borderRadius: 12, border: '1px solid #D3C9BE', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            style={{ flex: 2, padding: '12px 0', background: isSubmitting ? '#E5E7EB' : '#D1915F', color: isSubmitting ? '#A39BA6' : '#FFFFFF', fontWeight: 700, fontSize: 13, borderRadius: 12, border: 'none', cursor: isSubmitting ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(209,145,95,0.15)' }}
          >
            {isSubmitting ? 'Publishing...' : 'Request Adjustment'}
          </button>
        </div>
      </form>
    </div>
  );
}