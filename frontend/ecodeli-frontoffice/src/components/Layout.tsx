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
      {/* Styles modernes pour la navbar verte */}
      <style>{`
        .dropdown-toggle::after {
          display: none !important;
        }
        
        .modern-navbar {
          background: linear-gradient(135deg, #2D8A3E 0%, #3aa853 100%);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 20px rgba(45, 138, 62, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem 0;
          transition: all 0.3s ease;
        }
        
        .modern-navbar.scrolled {
          box-shadow: 0 4px 30px rgba(45, 138, 62, 0.2);
        }
        
        .navbar-brand-modern {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.5rem;
          color: white !important;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .navbar-brand-modern:hover {
          transform: scale(1.05);
          color: #f8f9fa !important;
        }
        
        .navbar-brand-modern img {
          margin-right: 12px;
          filter: brightness(1.1);
          transition: all 0.3s ease;
        }
        
        .nav-link-modern {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500;
          padding: 0.6rem 1.2rem !important;
          border-radius: 25px;
          margin: 0 0.25rem;
          position: relative;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .nav-link-modern:hover {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .nav-link-modern.active {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .user-avatar-modern {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
          color: white;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .user-avatar-modern:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%);
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .dropdown-menu-modern {
          background: white;
          border: none;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          padding: 0.5rem 0;
          min-width: 200px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .dropdown-item-modern {
          padding: 0.75rem 1.5rem;
          transition: all 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          color: #333;
          font-weight: 500;
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        
        .dropdown-item-modern:hover {
          background-color: #f8f9fa;
          color: #2D8A3E;
          transform: translateX(5px);
        }
        
        .dropdown-item-modern.text-danger:hover {
          background-color: #f8d7da;
          color: #dc3545;
        }
        
        .dropdown-item-modern .emoji {
          font-size: 16px;
          margin-right: 12px;
          width: 20px;
          text-align: center;
        }
      `}</style>
      
      {/* Header modernisé */}
      <nav className="navbar navbar-expand-lg modern-navbar">
        <div className="container">
          <Link className="navbar-brand-modern" to="/">
            <img src="/logoEco.png" alt="EcoDeli" height="40" />
            EcoDéli
          </Link>
          
          <div className="navbar-nav ms-auto d-flex align-items-center">
            <Link className="nav-link-modern" to="/">
              <i className="bi bi-house-door me-1"></i>
              Accueil
            </Link>
            <Link className="nav-link-modern" to="/annonces">
              <i className="bi bi-megaphone me-1"></i>
              Annonces
            </Link>
            
            {currentUser ? (
              <>
                <Link className="nav-link-modern" to="/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Link>
                
                {/* Avatar utilisateur modernisé */}
                <div className="position-relative ms-3" ref={menuRef}>
                  <div 
                    className="user-avatar-modern"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    {getUserInitials(currentUser)}
                  </div>
                  
                  {/* Menu déroulant modernisé */}
                  {showMenu && (
                    <div 
                      className="dropdown-menu-modern position-absolute"
                      style={{
                        top: '100%',
                        right: '0',
                        marginTop: '12px',
                        zIndex: 1000
                      }}
                    >
                      <Link 
                        to="/profile" 
                        className="dropdown-item-modern"
                        onClick={() => setShowMenu(false)}
                      >
                        <span className="emoji">👤</span>
                        Mon profil
                      </Link>
                      <Link 
                        to="/dashboard" 
                        className="dropdown-item-modern"
                        onClick={() => setShowMenu(false)}
                      >
                        <span className="emoji">📊</span>
                        Dashboard
                      </Link>
                      <hr className="dropdown-divider" style={{margin: '0.5rem 0'}} />
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item-modern text-danger"
                      >
                        <span className="emoji">🚪</span>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link className="nav-link-modern" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Connexion
                </Link>
                <Link className="nav-link-modern" to="/register">
                  <i className="bi bi-person-plus me-1"></i>
                  Inscription
                </Link>
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

      {/* Footer modernisé */}
      <footer className="mt-auto" style={{
        background: 'linear-gradient(135deg, #1e5f2a 0%, #2D8A3E 100%)',
        color: 'white',
        padding: '2rem 0 1rem'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-3">
                <img src="/logoEco.png" alt="EcoDeli" height="30" className="me-3" style={{filter: 'brightness(1.1)'}} />
                <h5 className="mb-0 fw-bold">EcoDéli</h5>
              </div>
              <p className="text-light mb-0">
                <i className="bi bi-leaf me-2"></i>
                Livraisons écologiques et responsables
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0 text-light">
                &copy; 2025 EcoDéli - Tous droits réservés
              </p>
              <small className="text-light opacity-75">
                <i className="bi bi-heart-fill me-1" style={{color: '#ff6b6b'}}></i>
                Fait avec amour pour la planète
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
