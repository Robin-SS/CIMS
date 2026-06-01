import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function PosTerminal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/home')} 
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500 hover:text-stone-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-orange-600 text-white p-2 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 text-lg">POS Register Terminal</h1>
            <p className="text-xs text-stone-500">Operator: {user?.display_name} ({user?.role})</p>
          </div>
        </div>
      </header>

      {/* Placeholder Grid */}
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">🛒 POS Grid Area</h2>
          <p className="text-stone-500 text-sm">
            Menu grid listings, pricing matrices, and order card computational items will go here.
          </p>
        </div>
      </main>
    </div>
  );
}