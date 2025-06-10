import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header simplifié */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/logoEco.png" alt="EcoDeli" height="40" />
          </Link>
          
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/">Accueil</Link>
            <Link className="nav-link" to="/annonces">Annonces</Link>
            
            {currentUser ? (
              <>
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Connexion</Link>
                <Link className="nav-link" to="/register">Inscription</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="flex-grow-1">
        <div className="container my-4">
          {children}
        </div>
      </main>

      {/* Footer simplifié */}
      <footer className="bg-light py-3 mt-auto">
        <div className="container text-center">
          <p className="mb-0">&copy; 2024 EcoDeli - Livraisons écologiques</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
