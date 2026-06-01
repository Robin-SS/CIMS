import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-amber-800">☕ Admin Dashboard</h1>
        <p className="text-stone-600 mt-2">Welcome back, {user?.display_name}! (Role: {user?.role})</p>
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800 font-medium">✨ Inventory Management Module & Sales Analytics will live here.</p>
        </div>
        <button onClick={logout} className="mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
}