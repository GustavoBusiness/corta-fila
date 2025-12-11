// App.tsx
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages públicas
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientBooking from "./pages/ClientBooking";
import EmployeeSetPassword from "./pages/EmployeeSetPassword";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAgenda from "./pages/admin/Agenda";
import AdminClientes from "./pages/admin/Clientes";
import AdminServicos from "./pages/admin/Servicos";
import AdminProfissionais from "./pages/admin/Profissionais";
import AdminProdutos from "./pages/admin/Produtos";
import AdminFinanceiro from "./pages/admin/Financeiro";
import AdminConfiguracoes from "./pages/admin/Configuracoes";

// Funcionário
import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeAgenda from "./pages/employee/Agenda";

// 404
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route path="/agendar" element={<ClientBooking />} />
                <Route path="/definir-senha" element={<EmployeeSetPassword />} />

                {/* ADMIN */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowed={["admin"]}>
                        <AdminLayout />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="agenda" element={<AdminAgenda />} />
                  <Route path="clientes" element={<AdminClientes />} />
                  <Route path="servicos" element={<AdminServicos />} />
                  <Route path="profissionais" element={<AdminProfissionais />} />
                  <Route path="produtos" element={<AdminProdutos />} />
                  <Route path="financeiro" element={<AdminFinanceiro />} />
                  <Route path="configuracoes" element={<AdminConfiguracoes />} />
                </Route>

                {/* FUNCIONÁRIO */}
                <Route
                  path="/funcionario"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowed={["employee"]}>
                        <EmployeeLayout />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<EmployeeDashboard />} />
                  <Route path="agenda" element={<EmployeeAgenda />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>

            </TooltipProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
