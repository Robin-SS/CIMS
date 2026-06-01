import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <button onClick={() => navigate('/home')} className="flex items-center space-x-1.5 text-stone-500 hover:text-stone-800 font-medium text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Home</span>
        </button>

        <div className="flex justify-between items-center border-b border-stone-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-stone-800">📋 Café Stock Inventory</h1>

          {/* Action Control Button - Only enabled for Admin */}
          {isAdmin ? (
            <button className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + Add New Ingredient
            </button>
          ) : (
            <span className="text-xs bg-stone-100 text-stone-400 border border-stone-200 px-3 py-1.5 rounded-full font-medium">
              👁️ Read-Only Mode
            </span>
          )}
        </div>

        <p className="text-stone-600">
          Current Active Role: <strong className="text-amber-800 uppercase">{user?.role}</strong>
        </p>

        <div className="mt-6 border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-6 text-center text-stone-400">
          [Inventory list database query table outputs populate here]
        </div>
      </div>
    </div>
  );
}