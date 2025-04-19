import React, { useEffect, useState } from 'react';
import { BaseUser, FormData } from '../types/common';
import UserFormModal from '../components/UserFormModal';

function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<BaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    role: 'CLIENT',
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: ''
  });

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/utilisateurs');
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      const data = await response.json();
      setUtilisateurs(data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création');
      
      fetchUtilisateurs();
      setShowModal(false);
      setFormData({
        role: 'CLIENT',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: ''
      });
    } catch (err) {
      setError('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement; // Type assertion pour accéder à checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/utilisateurs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      fetchUtilisateurs();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Utilisateurs</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          Ajouter un utilisateur
        </button>
      </div>

      <UserFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
      />

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Téléphone</th>
                  <th>Date de création</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map(user => (
                  <tr key={user.id}>
                    <td>{user.nom} {user.prenom}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.telephone || '-'}</td>
                    <td>{user.dateCreation ? new Date(user.dateCreation).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setFormData({
                              role: user.role || 'CLIENT',
                              nom: user.nom,
                              prenom: user.prenom || '',
                              email: user.email,
                              password: '', // Laissé vide pour la modification
                              telephone: user.telephone || ''
                            });
                            setShowModal(true);
                          }}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const getRoleBadgeColor = (role: string | null | undefined): string => {
  if (!role) return 'secondary';
  
  switch (role.toUpperCase()) {
    case 'LIVREUR': return 'success';
    case 'CLIENT': return 'primary';
    case 'COMMERCANT': return 'warning';
    case 'PRESTATAIRE': return 'info';
    default: return 'secondary';
  }
};

export default Utilisateurs;
