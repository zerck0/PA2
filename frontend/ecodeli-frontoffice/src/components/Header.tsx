import { useState } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
  const [expanded, setExpanded] = useState(false);
  const isLoggedIn = false; // À remplacer avec un vrai système d'authentification

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      sticky="top" 
      expanded={expanded}
      onToggle={setExpanded}
      className="shadow-sm py-3"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
          <div className="d-flex align-items-center">
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#2D8A3E',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Yeseva One, serif',
                fontWeight: 'bold'
              }}
            >
              ED
            </div>
            <span className="ms-2 brand-text" style={{ 
              fontFamily: 'Yeseva One, serif', 
              fontSize: '1.5rem', 
              color: '#2D8A3E' 
            }}>EcoDeli</span>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/annonces" onClick={() => setExpanded(false)} className="mx-2">
              Annonces
            </Nav.Link>
            <Nav.Link as={Link} to="/services" onClick={() => setExpanded(false)} className="mx-2">
              Services
            </Nav.Link>
            <NavDropdown title="À propos" id="about-dropdown" className="mx-2">
              <NavDropdown.Item as={Link} to="/about" onClick={() => setExpanded(false)}>
                Notre histoire
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/how-it-works" onClick={() => setExpanded(false)}>
                Comment ça marche
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contact" onClick={() => setExpanded(false)}>
                Contact
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          
          <Nav>
            {isLoggedIn ? (
              <NavDropdown 
                title={<><i className="bi bi-person-circle me-1"></i> Mon compte</>} 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/dashboard" onClick={() => setExpanded(false)}>
                  <i className="bi bi-speedometer2 me-2"></i>
                  Tableau de bord
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                  <i className="bi bi-person me-2"></i>
                  Mon profil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/" onClick={() => setExpanded(false)}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Déconnexion
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Button 
                  as={Link}
                  to="/login"
                  variant="outline-primary" 
                  onClick={() => setExpanded(false)}
                  className="me-2"
                >
                  Connexion
                </Button>
                <Button 
                  as={Link}
                  to="/register"
                  variant="primary" 
                  onClick={() => setExpanded(false)}
                >
                  Inscription
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;