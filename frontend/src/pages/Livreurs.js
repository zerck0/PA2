import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';

function Livreurs() {
    const [livreurs, setLivreurs] = useState([]);
    const navigate = useNavigate();

    const fetchLivreurs = () => {
        fetch('http://localhost:8080/api/livreurs')
            .then(res => res.json())
            .then(data => setLivreurs(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchLivreurs();
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Supprimer ce livreur ?")) {
            fetch(`http://localhost:8080/api/livreurs/${id}`, {
                method: 'DELETE',
            })
                .then(() => fetchLivreurs()) // recharge la liste
                .catch(err => console.error(err));
        }
    };

    const handleEdit = (id) => {
        navigate(`/modifier-livreur/${id}`);
    };

    return (
        <div className="container mt-4">
            <Link className="btn btn-outline-primary mb-2" to="/ajouter-livreur">Ajouter Livreur</Link>
            <h2>Liste des livreurs</h2>
            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Véhicule</th>
                    <th>Disponible</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {livreurs.map(l => (
                    <tr key={l.id}>
                        <td>{l.nom}</td>
                        <td>{l.prenom}</td>
                        <td>{l.email}</td>
                        <td>{l.telephone}</td>
                        <td>{l.vehicule}</td>
                        <td>{l.permisVerif ? "✅" : "❌"}</td>
                        <td>
                            <i
                                className="bi bi-pencil-fill text-primary me-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleEdit(l.id)}
                            ></i>
                            <i
                                className="bi bi-trash-fill text-danger"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleDelete(l.id)}
                            ></i>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Livreurs;
