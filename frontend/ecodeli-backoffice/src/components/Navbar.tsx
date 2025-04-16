import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">EcoDeli Admin</Link>
      <div className="navbar-nav">
        <Link className="nav-link" to="/">Accueil</Link>
        <Link className="nav-link" to="/utilisateurs">Utilisateurs</Link>
        <Link className="nav-link" to="/livreurs">Livreurs</Link>
        <Link className="nav-link" to="/annonces">Annonces</Link>
      </div>
    </nav>
  );
}

export default Navbar;
