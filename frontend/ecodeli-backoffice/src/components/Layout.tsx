import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import type { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      exact: true,
    },
    {
      path: '/admin/users',
      icon: 'bi-people',
      label: 'Utilisateurs',
    },
    {
      path: '/admin/documents',
      icon: 'bi-file-earmark-check',
      label: 'Documents',
    },
    {
      path: '/admin/annonces',
      icon: 'bi-megaphone',
      label: 'Annonces',
    },
    {
      path: '/admin/livraisons',
      icon: 'bi-truck',
      label: 'Livraisons',
    },
  ];

  const isActiveRoute = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <nav className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`}>
        {/* Logo et titre */}
        <div className="p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center text-white">
            <i className="bi bi-shield-check fs-4 text-ecodeli me-2"></i>
            <div>
              <div className="fw-bold">EcoDéli</div>
              <small className="text-muted">Administration</small>
            </div>
          </div>
        </div>

        {/* Menu de navigation */}
        <ul className="nav nav-pills flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActiveRoute(item.path, item.exact) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Utilisateur connecté */}
        <div className="mt-auto p-3 border-top border-secondary">
          <div className="text-light mb-2">
            <small>Connecté en tant que</small>
            <div className="fw-bold">
              {currentUser?.prenom} {currentUser?.nom}
            </div>
            <small className="text-muted">{currentUser?.email}</small>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-light btn-sm w-100"
          >
            <i className="bi bi-box-arrow-right me-1"></i>
            Déconnexion
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="admin-main">
        {/* Header mobile */}
        <div className="d-md-none bg-white border-bottom p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-ecodeli">
              <i className="bi bi-shield-check me-2"></i>
              EcoDéli Admin
            </h5>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>

        {/* Contenu des pages */}
        {children}
      </main>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="d-md-none position-fixed w-100 h-100"
          style={{
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
