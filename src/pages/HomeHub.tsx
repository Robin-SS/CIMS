import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Coffee, ShoppingCart, Package, BarChart3, LogOut, Shield } from 'lucide-react';

export default function HomeHub() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const modules = [
    {
      title: 'POS Register',
      description: 'Open active cashier terminal to take orders and process bills.',
      path: '/pos',
      icon: ShoppingCart,
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      title: 'Inventory Control',
      description: 'View café material stocks, ingredients, and supplier lists.',
      path: '/inventory',
      icon: Package,
      color: 'bg-amber-700 hover:bg-amber-800',
    },
    {
      title: 'Business Insights',
      description: 'Track operational metrics, item performance, and sales curves.',
      path: '/insights',
      icon: BarChart3,
      color: 'bg-emerald-700 hover:bg-emerald-800',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Banner Bar */}
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-800 text-white p-2.5 rounded-xl">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 text-xl tracking-tight">Café Central System</h1>
            <p className="text-xs text-stone-500">Welcome back, {user?.display_name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-stone-100 border border-stone-300 text-stone-600 px-3 py-1.5 rounded-full">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>{user?.role} Access</span>
          </span>
          <button 
            onClick={logout}
            className="text-stone-400 hover:text-red-600 p-2 rounded-xl transition-colors"
            title="Log out of app"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Grid Hub Panel Options */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 flex flex-col justify-center">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-stone-800">Operational Modules</h2>
          <p className="text-stone-500 mt-1">Select an item below to enter the terminal interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div 
                key={mod.path}
                className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ${mod.color.split(' ')[0]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">{mod.title}</h3>
                  <p className="text-stone-500 text-sm mt-2 leading-relaxed">{mod.description}</p>
                </div>
                
                <button
                  onClick={() => navigate(mod.path)}
                  className={`w-full mt-6 text-white font-medium py-2.5 rounded-xl transition-colors shadow-sm ${mod.color}`}
                >
                  Enter Module
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}