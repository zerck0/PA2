import React from 'react';

const AnnoncesPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Gestion des annonces</h1>
          <p className="text-muted mb-0">Modération et administration des annonces</p>
        </div>
      </div>

      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        Page en cours de développement - Gestion des annonces clients et commerçants
      </div>
    </div>
  );
};

export default AnnoncesPage;
