import React from 'react';

const LivraisonsPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Suivi des livraisons</h1>
          <p className="text-muted mb-0">Administration et suivi des livraisons en cours</p>
        </div>
      </div>

      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        Page en cours de développement - Suivi et gestion des livraisons
      </div>
    </div>
  );
};

export default LivraisonsPage;
