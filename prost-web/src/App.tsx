import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PageContainer from './components/layout/PageContainer';
import Splash from './components/Splash';
import { Toaster } from '@/components/ui/sonner';

/* Code splitting — cada página vira um chunk próprio, carregado sob demanda.
   Mantém o bundle inicial enxuto (login + layout), adiando páginas pesadas
   (Integrações, Diagnóstico IA + jsPDF) até o primeiro acesso. */
const Login         = lazy(() => import('./pages/Login'));
const Home          = lazy(() => import('./pages/Home'));
const DeliveryDash  = lazy(() => import('./pages/DeliveryDashboard'));
const Overview      = lazy(() => import('./pages/Dashboard'));
const NewChecklist  = lazy(() => import('./pages/NewChecklist'));
const Clients       = lazy(() => import('./pages/Clients'));
const ClientProfile = lazy(() => import('./pages/ClientProfile'));
const Vehicles      = lazy(() => import('./pages/Vehicles'));
const Diagnostics   = lazy(() => import('./pages/Diagnostics'));
const ServiceOrders = lazy(() => import('./pages/ServiceOrders'));
const Integrations  = lazy(() => import('./pages/Integrations'));
const DiagnosticoIA = lazy(() => import('./pages/DiagnosticoIA'));
const ChecklistPrint = lazy(() => import('./pages/ChecklistPrint'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Splash />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Impressão A4 — fora do Layout escuro, em página própria */}
            <Route
              path="/print/checklist/:id"
              element={
                <ProtectedRoute>
                  <ChecklistPrint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Réplica do app antigo: "/" é o hub, "/dashboard" é o quadro
                  de entregas. A visão administrativa completa vive em
                  "/overview" (rota preservada, sem equivalente no original). */}
              <Route index element={<Home />} />
              <Route path="dashboard"     element={<DeliveryDash />} />
              <Route path="checklist/new" element={<NewChecklist />} />

              {/* Páginas herdadas — mesmo design system, container próprio. */}
              <Route element={<PageContainer />}>
                <Route path="overview"       element={<Overview />} />
                <Route path="clients"        element={<Clients />} />
                {/* Cadastro de cliente foi absorvido pelo Novo Check-list.
                    Rota preservada para não quebrar links salvos. */}
                <Route path="clients/new"    element={<Navigate to="/checklist/new" replace />} />
                <Route path="clients/:id"    element={<ClientProfile />} />
                <Route path="vehicles"       element={<Vehicles />} />
                <Route path="diagnostics"    element={<Diagnostics />} />
                <Route path="diagnostico-ia" element={<DiagnosticoIA />} />
                <Route path="service-orders" element={<ServiceOrders />} />
                <Route path="integrations"   element={<Integrations />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
