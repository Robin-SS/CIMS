import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import HomeHub from './pages/HomeHub';
import PosTerminal from './pages/PosTerminal';
import InventoryPage from './pages/InventoryPage';
import InsightsPage from './pages/InsightsPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/home" replace />} 
        />

        {/* Home Hub Menu Portal */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'employee']}>
              <HomeHub />
            </ProtectedRoute>
          } 
        />

        {/* Module Pages - Both can visit, permissions handled inside components */}
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'employee']}>
              <PosTerminal />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'employee']}>
              <InventoryPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/insights" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'employee']}>
              <InsightsPage />
            </ProtectedRoute>
          } 
        />

        {/* Automatic Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;