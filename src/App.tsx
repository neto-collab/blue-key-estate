import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { BrokerLayout } from "@/components/broker/BrokerLayout";
import { ProtectedRoute } from "@/components/broker/ProtectedRoute";
import { AdminRoute } from "@/components/broker/AdminRoute";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Contact from "./pages/Contact";
import BrokerLogin from "./pages/broker/BrokerLogin";
import Dashboard from "./pages/broker/Dashboard";
import MyProperties from "./pages/broker/MyProperties";
import PropertyForm from "./pages/broker/PropertyForm";
import AdminBrokers from "./pages/admin/AdminBrokers";
import AdminProperties from "./pages/admin/AdminProperties";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Público */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/imoveis" element={<Properties />} />
              <Route path="/imoveis/:id" element={<PropertyDetail />} />
              <Route path="/contato" element={<Contact />} />
            </Route>

            {/* Login do corretor (oculto, sem layout público) */}
            <Route path="/corretor/login" element={<BrokerLogin />} />

            {/* Painel do corretor (protegido) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<BrokerLayout />}>
                <Route path="/corretor" element={<Dashboard />} />
                <Route path="/corretor/imoveis" element={<MyProperties />} />
                <Route path="/corretor/imoveis/novo" element={<PropertyForm />} />
                <Route path="/corretor/imoveis/:id/editar" element={<PropertyForm />} />
                <Route element={<AdminRoute />}>
                  <Route path="/corretor/admin/corretores" element={<AdminBrokers />} />
                  <Route path="/corretor/admin/imoveis" element={<AdminProperties />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
