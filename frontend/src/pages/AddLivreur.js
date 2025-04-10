import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddLivreur() {
    const [livreur, setLivreur] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        vehicule: '',
        permisVerif: false,
        role: 'LIVREUR',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLivreur(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:8080/api/livreurs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livreur)
        })
            .then(() => navigate('/livreurs'))
            .catch(err => console.error(err));
    };

    return (
        <div>
            <h2>Ajouter un livreur</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <input className="form-control" placeholder="Nom" name="nom" onChange={handleChange} />
                </div>
                <div className="mb-2">
                    <input className="form-control" placeholder="Prénom" name="prenom" onChange={handleChange} />
                </div>
                <div className="mb-2">
                    <input className="form-control" placeholder="Email" name="email" onChange={handleChange} />
                </div>
                <div className="mb-2">
                    <input className="form-control" placeholder="Téléphone" name="telephone" onChange={handleChange} />
                </div>
                <div className="mb-2">
                    <input className="form-control" placeholder="Véhicule" name="vehicule" onChange={handleChange} />
                </div>
                <div className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" name="permisVerif" onChange={handleChange} />
                    <label className="form-check-label">Permis verifié</label>
                </div>
                <button type="submit" className="btn btn-primary">Créer</button>
            </form>
        </div>
    );
}

export default AddLivreur;
