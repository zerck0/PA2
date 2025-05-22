import { useContext } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Type personnalisé pour résoudre les problèmes de compatibilité entre React Bootstrap et React Router
type LinkComponentProps = any;
const LinkComponent = Link as unknown as React.ComponentType<LinkComponentProps>;

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={LinkComponent} to="/">
          <img src="/logo.svg" alt="EcoDeli" height="40" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={LinkComponent} to="/annonces">Annonces</Nav.Link>
            <Nav.Link as={LinkComponent} to="/livraison">Livraison</Nav.Link>
            <Nav.Link as={LinkComponent} to="/stockage">Stockage</Nav.Link>
            <Nav.Link as={LinkComponent} to="/how-it-works">Comment ça marche</Nav.Link>
          </Nav>
          
          {currentUser ? (
            <Nav>
              {/* Menu différent selon le rôle */}
              {currentUser.user.role === 'LIVREUR' && (
                <Nav.Link as={LinkComponent} to="/livreur/annonces">Mes missions</Nav.Link>
              )}
              
              {currentUser.user.role === 'COMMERCANT' && (
                <Nav.Link as={LinkComponent} to="/commercant/contrats">Mes contrats</Nav.Link>
              )}
              
              <NavDropdown 
                title={`${currentUser.user.prenom} ${currentUser.user.nom}`} 
                id="user-dropdown"
              >
                <NavDropdown.Item as={LinkComponent} to="/dashboard">Tableau de bord</NavDropdown.Item>
                <NavDropdown.Item as={LinkComponent} to="/profile">Mon profil</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Déconnexion</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link as={LinkComponent} to="/login" className="me-2">Connexion</Nav.Link>
              <Button as={LinkComponent} to="/register" variant="primary">S'inscrire</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;