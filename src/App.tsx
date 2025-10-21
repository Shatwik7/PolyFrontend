import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import AssetDetail from "./pages/AssetDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import MyAssets from "./pages/MyAssets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            <Route path="/explore" element={
              <Layout>
                <Explore />
              </Layout>
            } />
            <Route path="/asset/:id" element={
              <Layout>
                <AssetDetail />
              </Layout>
            } />
            <Route path="/profile/:id" element={
              <Layout>
                <Profile />
              </Layout>
            } />
            <Route path="/upload" element={
              <Layout>
                <Upload />
              </Layout>
            } />
            <Route path="/my-assets" element={
              <Layout>
                <MyAssets />
              </Layout>
            } />
            
            {/* Auth routes - no header/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Catch-all route */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
