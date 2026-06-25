import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Vehicles from './pages/Vehicles';
import Diagnostics from './pages/Diagnostics';
import ServiceOrders from './pages/ServiceOrders';
import Integrations from './pages/Integrations';
import DiagnosticoIA from './pages/DiagnosticoIA';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="clients"        element={<Clients />} />
            <Route path="vehicles"       element={<Vehicles />} />
            <Route path="diagnostics"    element={<Diagnostics />} />
            <Route path="diagnostico-ia" element={<DiagnosticoIA />} />
            <Route path="service-orders" element={<ServiceOrders />} />
            <Route path="integrations"   element={<Integrations />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
