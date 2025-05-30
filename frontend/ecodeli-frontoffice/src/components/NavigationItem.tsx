import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MenuItem } from '../config/menuConfig';
import { useAuthGuard } from '../hooks/useAuthGuard';

// Type personnalisé pour résoudre les problèmes de compatibilité entre React Bootstrap et React Router
type LinkComponentProps = any;
const LinkComponent = Link as unknown as React.ComponentType<LinkComponentProps>;

interface NavigationItemProps {
  item: MenuItem;
  className?: string;
  onClick?: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ item, className = "navbar-link", onClick }) => {
  const { requireAuthForPath, isAuthenticated } = useAuthGuard();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }

    // Si l'item nécessite une authentification et l'utilisateur n'est pas connecté
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      requireAuthForPath(item.path);
    }
  };

  return (
    <Nav.Link 
      as={LinkComponent} 
      to={item.path} 
      className={className}
      onClick={handleClick}
    >
      {item.icon && <i className={`bi ${item.icon} me-1`}></i>}
      {item.label}
    </Nav.Link>
  );
};

export default NavigationItem;
