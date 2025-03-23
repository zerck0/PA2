import React, { useState } from 'react';

function AddLivreur({ onLivreurAdded }) {
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [disponible, setDisponible] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch('http://localhost:8080/api/livreurs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, telephone, email, disponible })
        })
            .then(res => res.json())
            .then(() => {
                onLivreurAdded(); // recharger la liste
                // reset form
                setNom('');
                setTelephone('');
                setEmail('');
                setDisponible(true);
            })
            .catch(err => console.error('Erreur:', err));
    };

    return (
        <div className="card p-4 mb-4">
            <h4>Ajouter un livreur</h4>
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <input type="text" className="form-control" placeholder="Nom"
                           value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div className="mb-2">
                    <input type="text" className="form-control" placeholder="Téléphone"
                           value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
                </div>
                <div className="mb-2">
                    <input type="email" className="form-control" placeholder="Email"
                           value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="dispoCheck"
                           checked={disponible} onChange={(e) => setDisponible(e.target.checked)} />
                    <label className="form-check-label" htmlFor="dispoCheck">Disponible</label>
                </div>
                <button className="btn btn-success" type="submit">Ajouter</button>
            </form>
        </div>
    );
}

export default AddLivreur;
