import React from 'react';
import { Link } from 'react-router-dom';

function Accueil() {
  return (
    <div className="text-center">
      <h1 className="mb-4">Tableau de bord - EcoDeli</h1>
      <p className="mb-5">Bienvenue sur l'interface d'administration d'EcoDeli.</p>

      <div className="row justify-content-center">
        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <i className="bi bi-people-fill fs-1 text-primary mb-3"></i>
              <h5 className="card-title">Utilisateurs</h5>
              <p className="card-text">Gérer tous les utilisateurs.</p>
              <Link to="/utilisateurs" className="btn btn-primary">Accéder</Link>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <i className="bi bi-truck fs-1 text-success mb-3"></i>
              <h5 className="card-title">Livreurs</h5>
              <p className="card-text">Ajouter ou supprimer des livreurs.</p>
              <Link to="/livreurs" className="btn btn-success">Gérer</Link>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <i className="bi bi-megaphone fs-1 text-secondary mb-3"></i>
              <h5 className="card-title">Annonces (à venir)</h5>
              <p className="card-text">Module de gestion des annonces.</p>
              <button className="btn btn-secondary" disabled>Prochainement</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accueil;
