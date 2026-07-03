import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Splash from './components/Splash';
import { Toaster } from '@/components/ui/sonner';

/* Code splitting — cada página vira um chunk próprio, carregado sob demanda.
   Mantém o bundle inicial enxuto (login + layout), adiando páginas pesadas
   (Integrações, Diagnóstico IA + jsPDF) até o primeiro acesso. */
const Login         = lazy(() => import('./pages/Login'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Clients       = lazy(() => import('./pages/Clients'));
const Vehicles      = lazy(() => import('./pages/Vehicles'));
const Diagnostics   = lazy(() => import('./pages/Diagnostics'));
const ServiceOrders = lazy(() => import('./pages/ServiceOrders'));
const Integrations  = lazy(() => import('./pages/Integrations'));
const DiagnosticoIA = lazy(() => import('./pages/DiagnosticoIA'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Splash />}>
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
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
