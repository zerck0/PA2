import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import DocumentsPage from './pages/DocumentsPage';
import AnnoncesPage from './pages/AnnoncesPage';
import LivraisonsPage from './pages/LivraisonsPage';
import Layout from './components/Layout';
import { authService } from './services/api';
import type { User } from './types';

// Composant de route protégée
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.verifyToken();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        setIsAuthenticated(false);
        authService.logout();
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // État de chargement
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout currentUser={currentUser}>
      {children}
    </Layout>
  );
};

// Composant principal de l'application
function App() {
  return (
    <Router>
      <Routes>
        {/* Route publique - Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Routes protégées */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/documents" element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/annonces" element={
          <ProtectedRoute>
            <AnnoncesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/livraisons" element={
          <ProtectedRoute>
            <LivraisonsPage />
          </ProtectedRoute>
        } />
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
