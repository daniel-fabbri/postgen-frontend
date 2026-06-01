import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useAuth, AuthProvider } from './AuthContext';
import { Moon, Sun, Sparkles, LogOut, User, DollarSign, UserCircle, Settings, Shield, ChevronDown, CreditCard, Layers } from 'lucide-react';
import ChannelsPage from './pages/ChannelsPage';
import CreateChannelPage from './pages/CreateChannelPage';
import ChannelViewPage from './pages/ChannelViewPage';
import GeneratePostPage from './pages/GeneratePostPage';
import GenerateVideoPage from './pages/GenerateVideoPage';
import VideoEditorPage from './pages/VideoEditorPage';
import ChannelDashboardPage from './pages/ChannelDashboardPage';
import CreditsLogPage from './pages/CreditsLogPage';
import BuyCreditsPage from './pages/BuyCreditsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Navigation() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [totalConsumed, setTotalConsumed] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('postgen_token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8004/api'}/credits/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setTotalConsumed(d.total_credits || 0))
      .catch(() => {});
  }, [user, location.pathname]);

  if (!user) return null;

  // Verificar se é admin (daniel.fabbri@avanade.com)
  const isAdmin = user.email === 'daniel.fabbri@avanade.com';

  return (
    <nav className="relative z-10 bg-white dark:bg-gray-800 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/channels" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg transform group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                PostGen
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Botão de créditos */}
            <Link
              to="/credits"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-semibold shadow-md"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">
                {Math.round(totalConsumed)}/{Math.round(user.credits_balance || 0)}
              </span>
            </Link>
            
            {/* Dropdown de Perfil */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <Link
                    to="/channels"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Meus Canais</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </Link>
                  
                  <Link
                    to="/credits"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Créditos</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      toggleDarkMode();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>Modo Claro</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Modo Escuro</span>
                      </>
                    )}
                  </button>
                  
                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>© {new Date().getFullYear()} PostGen. Todos os direitos reservados.</span>
        <div className="flex items-center space-x-5">
          <Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Termos de Uso
          </Link>
          <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />
      <main className={`flex-1 ${user ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/" element={user ? <Navigate to="/channels" replace /> : <LandingPage />} />
          <Route path="/channels" element={<ProtectedRoute><ChannelsPage /></ProtectedRoute>} />
          <Route path="/channels/create" element={<ProtectedRoute><CreateChannelPage /></ProtectedRoute>} />
          <Route path="/channels/:id" element={<ProtectedRoute><ChannelViewPage /></ProtectedRoute>} />
          <Route path="/channels/:id/generate" element={<ProtectedRoute><GeneratePostPage /></ProtectedRoute>} />
          <Route path="/channels/:id/generate-video" element={<ProtectedRoute><GenerateVideoPage /></ProtectedRoute>} />
          <Route path="/video-editor/:projectId" element={<ProtectedRoute><VideoEditorPage /></ProtectedRoute>} />
          <Route path="/channels/:id/dashboard" element={<ProtectedRoute><ChannelDashboardPage /></ProtectedRoute>} />
          <Route path="/credits" element={<ProtectedRoute><CreditsLogPage /></ProtectedRoute>} />
          <Route path="/buy-credits" element={<ProtectedRoute><BuyCreditsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
