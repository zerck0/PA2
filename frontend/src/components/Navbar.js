import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
            <Link className="navbar-brand" to="/">EcoDeli</Link>

            <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Accueil</Link>
                    </li>

                    {/* Onglet Utilisateur avec dropdown séparé */}
                    <li className="nav-item dropdown d-flex align-items-center">
                        <Link className="nav-link" to="/utilisateurs">Utilisateur</Link>

                        <button
                            className="btn btn-sm btn-secondary dropdown-toggle ms-1"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                        </button>

                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/livreurs">Livreurs</Link></li>
                            <li><Link className="dropdown-item" to="/clients">Clients</Link></li>
                            <li><Link className="dropdown-item" to="/commercants">Commerçants</Link></li>
                            <li><Link className="dropdown-item" to="/prestataires">Prestataires</Link></li>
                        </ul>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/inscription">Inscription</Link>
                    </li>

                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
