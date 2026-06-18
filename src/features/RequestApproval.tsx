import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ActivityService } from '../services/ActivityService';

interface AdjustmentRequest {
  id: number;
  username: string;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  reason?: string;
  status: string;
}

interface AdjustmentRequestReviewPanelProps {
  requests: AdjustmentRequest[];
  userId?: string | number;
  onReviewed?: () => void;
}

export default function AdjustmentRequestReviewPanel({ requests, userId, onReviewed }: AdjustmentRequestReviewPanelProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const pendingRequests = requests.filter((r) => (r.status || 'pending').toLowerCase() === 'pending');

  const handleDecision = async (request: AdjustmentRequest, decision: 'approve' | 'reject') => {
    setProcessingId(request.id);
    const statusValue = decision === 'approve' ? 'Complete' : 'Rejected';
    try {
      // Approving actually applies the quantity change to the ingredient's
      // stock. Rejecting leaves stock untouched — nothing was approved.
      if (decision === 'approve') {
        const { data: ingredientRow, error: stockFetchError } = await supabase
          .from('ingredients')
          .select('stock_quantity')
          .eq('ingredient_id', request.ingredient_id)
          .single();

        if (stockFetchError) throw stockFetchError;

        const currentStock = Number(ingredientRow?.stock_quantity) || 0;
        const newStock = currentStock + request.quantity;

        const { error: stockUpdateError } = await supabase
          .from('ingredients')
          .update({ stock_quantity: newStock })
          .eq('ingredient_id', request.ingredient_id);

        if (stockUpdateError) throw stockUpdateError;
      }

      const adminId = userId ? (typeof userId === 'number' ? userId : parseInt(String(userId), 10)) : null;

      const { error } = await supabase
        .from('inventory_adjustment_requests')
        .update({ approved_by: adminId, approval_status: statusValue, approval_date:new Date().toISOString() })
        .eq('request_id', request.id);

      if (error) throw error;

      const reviewerId = userId && !Number.isNaN(parseInt(String(userId), 10))
        ? parseInt(String(userId), 10)
        : 0;

      await ActivityService.logAction(
        reviewerId,
        `${decision === 'approve' ? 'Approved' : 'Rejected'} request #${request.id} for ${request.ingredient_name} (${request.quantity > 0 ? '+' : ''}${request.quantity})`,
        'Inventory Adjustment Review'
      );

      if (onReviewed) onReviewed();
    } catch (error) {
      console.error('Failed to update adjustment request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: '#FFFFFF', border: '1px solid #D3C9BE', borderRadius: 16, padding: '20px', boxShadow: '0 10px 30px rgba(209, 145, 95, 0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <ClipboardCheck style={{ color: '#D1915F', width: 22, height: 22 }} />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1E1E1E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Review Requests
        </h2>
      </div>
      <p style={{ margin: '0 0 20px 0', fontSize: 12, color: '#8A7E72', lineHeight: 1.4 }}>
        Approve or reject pending inventory adjustment requests.
      </p>

      {pendingRequests.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#A39BA6', fontStyle: 'italic', fontSize: 13 }}>
          No pending requests to review.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingRequests.map((req) => {
            const isProcessing = processingId === req.id;
            return (
              <div key={req.id} style={{ border: '1px solid #F1F1F1', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1E1E1E' }}>{req.ingredient_name}</span>
                  <span style={{ fontSize: 11, color: '#8A7E72' }}>#{req.id}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8A7E72', marginBottom: 10 }}>
                  Requested by <strong style={{ textTransform: 'capitalize' }}>{req.username}</strong>
                  {' · '}
                  <span style={{ color: req.quantity < 0 ? '#FF2C2C' : '#09AA29', fontWeight: 700 }}>
                    {req.quantity > 0 ? `+${req.quantity}` : req.quantity}
                  </span>
                </div>
                {req.reason && (
                  <div style={{ fontSize: 12, color: '#8A7E72', marginBottom: 10 }}>
                    Reason: <strong>{req.reason}</strong>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecision(req, 'approve')}
                    style={{ padding: '8px 0', borderRadius: 8, border: '1px solid #15803D', background: isProcessing ? '#E5E7EB' : '#F0FDF4', color: '#15803D', fontWeight: 700, fontSize: 12, cursor: isProcessing ? 'default' : 'pointer' }}
                  >
                    {isProcessing ? '...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecision(req, 'reject')}
                    style={{ padding: '8px 0', borderRadius: 8, border: '1px solid #FF2C2C', background: isProcessing ? '#E5E7EB' : '#FEF2F2', color: '#FF2C2C', fontWeight: 700, fontSize: 12, cursor: isProcessing ? 'default' : 'pointer' }}
                  >
                    {isProcessing ? '...' : 'Reject'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}