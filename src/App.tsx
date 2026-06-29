import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { Toaster } from 'sonner'; // 1. Import Sonner
import Login from './pages/Login';
import HomeHub from './pages/HomeHub';
import PosTerminal from './pages/PosTerminal';
import InventoryPage from './pages/InventoryPage';
import InsightsPage from './pages/InsightsPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  const { user } = useAuth();

  return (
    <InventoryProvider>
      <BrowserRouter>
        {/* 2. Place Toaster here so it is available to all pages */}
        <Toaster richColors position="top-right" />
        
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/home" replace />} 
          />

          <Route 
            path="/home" 
            element = {
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <HomeHub />
              </ProtectedRoute>
            } 
          />

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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;