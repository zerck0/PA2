import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Livreur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  vehicule: string;
  permisVerif: boolean;
}

function Livreurs() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);

  const fetchLivreurs = () => {
    fetch('http://localhost:8080/api/livreurs')
      .then(res => res.json())
      .then(data => setLivreurs(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const handleDelete = (id: number) => {
    fetch(`http://localhost:8080/api/livreurs/${id}`, { method: 'DELETE' })
      .then(() => fetchLivreurs());
  };

  return (
    <div>
      <h2>Livreurs</h2>
      <Link to="/livreurs/ajouter" className="btn btn-primary mb-3">Ajouter un livreur</Link>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Véhicule</th>
            <th>Permis</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {livreurs.map(livreur => (
            <tr key={livreur.id}>
              <td>{livreur.nom}</td>
              <td>{livreur.prenom}</td>
              <td>{livreur.email}</td>
              <td>{livreur.vehicule}</td>
              <td>{livreur.permisVerif ? '✅' : '❌'}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(livreur.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Livreurs;
