import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import PowerBI from "./pages/PowerBI";
import Calculator from "./pages/Calculator";
import Repository from "./pages/Repository";
import Prabumulih from "./pages/Prabumulih";
import PrabumulihProjectDetail from "./pages/PrabumulihProjectDetail";
import Limau from "./pages/Limau";
import LimauProjectDetail from "./pages/LimauProjectDetail";
import OkRt from "./pages/OkRt";
import OkRtProjectDetail from "./pages/OkRtProjectDetail";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <SidebarTrigger className="hover:bg-muted/50 transition-colors ml-3 md:ml-6" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Backward-compatible redirects (old /monitoring URLs) */}
            <Route path="/monitoring/ok-rt" element={<Navigate to="/ok-rt" replace />} />
            <Route path="/monitoring/limau" element={<Navigate to="/limau" replace />} />
            <Route path="/monitoring/prabumulih" element={<Navigate to="/prabumulih" replace />} />
            <Route path="/monitoring" element={<Navigate to="/dashboard" replace />} />
            <Route path="/monitoring/*" element={<Navigate to="/dashboard" replace />} />

            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/powerbi"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PowerBI />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calculator"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Calculator />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/repository"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Repository />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prabumulih"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Prabumulih />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prabumulih/:projectId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PrabumulihProjectDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/limau"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Limau />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/limau/:projectId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LimauProjectDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ok-rt"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <OkRt />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ok-rt/:projectId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <OkRtProjectDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UserManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
