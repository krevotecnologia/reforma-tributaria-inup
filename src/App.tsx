import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminClientDetail from "./pages/admin/AdminClientDetail";
import AdminProjectDetail from "./pages/admin/AdminProjectDetail";
import AdminSimulator from "./pages/admin/AdminSimulator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clientes"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><AdminClients /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clientes/:clientId"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><AdminClientDetail /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clientes/:clientId/projetos/:projectId"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><AdminProjectDetail /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/simulador"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><AdminSimulator /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
