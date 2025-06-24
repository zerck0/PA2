import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // État pour contrôler l'affichage du menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMenu(false); // Fermer le menu après déconnexion
  };

  // Fonction pour générer les initiales de l'utilisateur
  const getUserInitials = (authResponse: any) => {
    if (!authResponse || !authResponse.user || !authResponse.user.nom || !authResponse.user.prenom) return 'U';
    return `${authResponse.user.prenom.charAt(0)}${authResponse.user.nom.charAt(0)}`.toUpperCase();
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Style simple pour masquer la flèche Bootstrap */}
      <style>{`
        .dropdown-toggle::after {
          display: none !important;
        }
        .user-avatar:hover {
          background-color: #0056b3 !important;
          transform: scale(1.05);
          transition: all 0.3s ease;
        }
      `}</style>
      
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
                
                {/* Avatar utilisateur avec menu React */}
                <div className="position-relative ms-3" ref={menuRef}>
                  <div 
                    className="user-avatar d-flex align-items-center justify-content-center"
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#007bff',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {getUserInitials(currentUser)}
                  </div>
                  
                  {/* Menu déroulant contrôlé par React */}
                  {showMenu && (
                    <ul 
                      className="dropdown-menu dropdown-menu-end show position-absolute"
                      style={{
                        top: '100%',
                        right: '0',
                        marginTop: '8px',
                        zIndex: 1000
                      }}
                    >
                      <li>
                        <Link 
                          to="/profile" 
                          className="dropdown-item"
                          onClick={() => setShowMenu(false)}
                        >
                          <span className="me-2">👤</span>
                          Mon profil
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/dashboard" 
                          className="dropdown-item"
                          onClick={() => setShowMenu(false)}
                        >
                          <span className="me-2">📊</span>
                          Dashboard
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          onClick={handleLogout}
                          className="dropdown-item text-danger"
                        >
                          <span className="me-2">🚪</span>
                          Déconnexion
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
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
