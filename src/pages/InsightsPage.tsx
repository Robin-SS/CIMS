import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function InsightsPage() {
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
          <h1 className="text-3xl font-bold text-stone-800">📊 Business Performance Insights</h1>
          {!isAdmin && (
            <span className="text-xs bg-stone-100 text-stone-400 border border-stone-200 px-3 py-1.5 rounded-full font-medium">
              👁️ Read-Only Mode
            </span>
          )}
        </div>

        {/* Secret Admin panel component */}
        {isAdmin ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 text-sm font-medium">
            🔑 Admin control unlocked: You have access to Export PDF Data sheets and clear shift logs.
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-sm">
            ⚠️ Note: Modifications and print distributions are restricted. Contact a manager to execute updates.
          </div>
        )}

        <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-6 text-center text-stone-400">
          [Analytics, charts, and metrics output layouts populate here]
        </div>
      </div>
    </div>
  );
}