import React, { useEffect, useState } from 'react';

interface Annonce {
  id: number;
  description: string;
  type: string;
  dateCreation: string;
  statut: string;
  utilisateurId: number;
}

function Annonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/annonces');
      if (!response.ok) throw new Error('Erreur lors de la récupération des annonces');
      const data = await response.json();
      setAnnonces(data);
    } catch (err) {
      setError('Erreur lors du chargement des annonces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Annonces</h2>
        <button className="btn btn-primary">
          Ajouter une annonce
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Date de création</th>
                  <th>Statut</th>
                  <th>Utilisateur</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {annonces.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">Aucune annonce disponible</td>
                  </tr>
                ) : (
                  annonces.map(annonce => (
                    <tr key={annonce.id}>
                      <td>{annonce.description}</td>
                      <td>{annonce.type}</td>
                      <td>{new Date(annonce.dateCreation).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeColor(annonce.statut)}`}>
                          {annonce.statut}
                        </span>
                      </td>
                      <td>{annonce.utilisateurId}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-outline-danger btn-sm">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const getStatusBadgeColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'EN_ATTENTE': return 'warning';
    case 'VALIDEE': return 'success';
    case 'REFUSEE': return 'danger';
    case 'EN_COURS': return 'info';
    case 'TERMINEE': return 'secondary';
    default: return 'secondary';
  }
};

export default Annonces;