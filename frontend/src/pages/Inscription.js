import React, { useState } from 'react';

function Inscription() {
    const [formData, setFormData] = useState({
        role: '',
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: '',
        vehicule: '',
        permisVerif: false,
        siret: '',
        typeService: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:8080/api/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(res => {
                if (res.ok) {
                    alert('Utilisateur inscrit avec succès !');
                } else {
                    alert('Erreur lors de l’inscription');
                }
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="container mt-5">
            <h2>Inscription</h2>
            <form onSubmit={handleSubmit}>
                {/* Sélecteur de rôle */}
                <div className="mb-3">
                    <label>Rôle</label>
                    <select className="form-select" name="role" onChange={handleChange} required>
                        <option value="">Sélectionner un rôle</option>
                        <option value="LIVREUR">Livreur</option>
                        <option value="CLIENT">Client</option>
                        <option value="COMMERCANT">Commerçant</option>
                        <option value="PRESTATAIRE">Prestataire</option>
                    </select>
                </div>

                {/* Champs communs */}
                <input className="form-control mb-2" name="nom" placeholder="Nom" onChange={handleChange} />
                <input className="form-control mb-2" name="prenom" placeholder="Prénom" onChange={handleChange} />
                <input className="form-control mb-2" name="email" placeholder="Email" onChange={handleChange} />
                <input className="form-control mb-2" name="password" placeholder="Mot de passe" onChange={handleChange} />
                <input className="form-control mb-2" name="telephone" placeholder="Téléphone" onChange={handleChange} />

                {/* Champs spécifiques selon le rôle */}
                {formData.role === 'LIVREUR' && (
                    <>
                        <input className="form-control mb-2" name="vehicule" placeholder="Véhicule" onChange={handleChange} />
                        <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" name="permisVerif" onChange={handleChange} />
                            <label className="form-check-label">Permis vérifié</label>
                        </div>
                    </>
                )}

                {formData.role === 'COMMERCANT' && (
                    <input className="form-control mb-2" name="siret" placeholder="SIRET" onChange={handleChange} />
                )}

                {formData.role === 'PRESTATAIRE' && (
                    <input className="form-control mb-2" name="typeService" placeholder="Type de prestation" onChange={handleChange} />
                )}

                <button type="submit" className="btn btn-primary mt-3">S'inscrire</button>
            </form>
        </div>
    );
}

export default Inscription;
