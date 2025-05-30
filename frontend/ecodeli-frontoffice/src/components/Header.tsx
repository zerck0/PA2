import { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getNavigationMenus } from '../config/menuConfig';
import NavigationItem from './NavigationItem';
import UserProfileMenu from './UserProfileMenu';
import logoEco from '../assets/logoEco.png';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Obtenir les menus de navigation publics
  const navigationMenus = getNavigationMenus();
  
  return (
    <Navbar 
      expand="lg" 
      className="shadow-sm sticky-top navbar-ecodeli"
      style={{ backgroundColor: 'var(--primary-color)' }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img 
            src={logoEco} 
            alt="EcoDeli" 
            height="45" 
            className="d-inline-block align-top"
            style={{ maxWidth: '200px' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          {/* Navigation principale - Menus publics uniquement */}
          <Nav className="me-auto">
            {navigationMenus.map((menu, index) => (
              <NavigationItem key={index} item={menu} />
            ))}
          </Nav>
          
          {/* Section droite - Profil utilisateur ou boutons d'auth */}
          <Nav>
            {currentUser ? (
              /* Menu profil pour utilisateur connecté */
              <UserProfileMenu 
                user={currentUser.user} 
                onLogout={handleLogout}
              />
            ) : (
              /* Boutons pour utilisateur non connecté */
              <>
                <Link to="/login" className="nav-link me-2 navbar-link">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-success btn-navbar">
                  <i className="bi bi-person-plus me-1"></i>
                  S'inscrire
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
