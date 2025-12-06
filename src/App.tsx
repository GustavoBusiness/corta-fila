import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientBooking from "./pages/ClientBooking";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAgenda from "./pages/admin/Agenda";
import AdminClientes from "./pages/admin/Clientes";
import AdminServicos from "./pages/admin/Servicos";
import AdminProfissionais from "./pages/admin/Profissionais";
import AdminProdutos from "./pages/admin/Produtos";
import AdminFinanceiro from "./pages/admin/Financeiro";
import AdminConfiguracoes from "./pages/admin/Configuracoes";
import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeAgenda from "./pages/employee/Agenda";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/agendar" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route path="/agendar" element={<ClientBooking />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="agenda" element={<AdminAgenda />} />
                  <Route path="clientes" element={<AdminClientes />} />
                  <Route path="servicos" element={<AdminServicos />} />
                  <Route path="profissionais" element={<AdminProfissionais />} />
                  <Route path="produtos" element={<AdminProdutos />} />
                  <Route path="financeiro" element={<AdminFinanceiro />} />
                  <Route path="configuracoes" element={<AdminConfiguracoes />} />
                </Route>

                {/* Employee Routes */}
                <Route path="/funcionario" element={<EmployeeLayout />}>
                  <Route index element={<EmployeeDashboard />} />
                  <Route path="agenda" element={<EmployeeAgenda />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
