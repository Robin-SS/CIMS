import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

import IngredientsTable from '../features/IngredientsTable';
import AddIngredientForm from '../features/AddIngredientForm';

interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  ingredient_category: string;
  stock_quantity: number;
  measurement_unit: string;
  threshold: number;
  stock_status: string;
  stock_date: string;
  expiry_date: string;
}

export default function InventoryPage() {
  const { user } = useAuth();
  
  // Type definition added here to prevent the 'never[]' compiler error!
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIngredients = async () => {
    const { data, error } = await supabase.from('ingredients').select('*');
    
    // This line will now compile perfectly with zero errors!
    if (!error && data) setIngredients(data);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      {/* Upper Header Container */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h1 className="text-2xl font-bold text-stone-800">Cafe Inventory Management</h1>
        <p className="text-sm text-stone-500">Manage real-time raw materials stock ledger values.</p>
      </div>

      {/* SIDE-BY-SIDE VERTICAL SECTIONS SPLIT WRAPPER */}
      <div className="flex flex-row gap-8 items-start w-full">
        
        {/* LEFT COMPONENT: Data Table */}
        <IngredientsTable ingredients={ingredients} />

        {/* RIGHT COMPONENT: Sidebar Controls */}
        <div className="w-96 shrink-0 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-base font-bold text-stone-800 mb-2">Operations Panel</h2>
            {user?.role === 'admin' ? (
              <div>
                {!isModalOpen ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-medium p-3 rounded-xl shadow-sm transition"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Ingredient</span>
                  </button>
                ) : (
                  <div className="text-stone-400 text-xs text-center font-medium py-3 bg-stone-50 border border-stone-200 border-dashed rounded-xl">
                    Registration form active below
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-500 font-medium text-xs text-center">
                👁️ Dashboard locked in Read-Only Mode
              </div>
            )}
          </div>

          {/* Render Add Form Sidebar Panel */}
          {isModalOpen && user?.role === 'admin' && (
            <AddIngredientForm 
              onClose={() => setIsModalOpen(false)} 
              onSuccess={() => {
                setIsModalOpen(false);
                fetchIngredients();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}