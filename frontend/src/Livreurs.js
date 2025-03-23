import React, { useEffect, useState } from 'react';
import AddLivreur from './AddLivreur';

function Livreurs() {
    const [livreurs, setLivreurs] = useState([]);

    const fetchLivreurs = () => {
        fetch('http://localhost:8080/api/livreurs')
            .then(res => res.json())
            .then(data => setLivreurs(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchLivreurs();
    }, []);

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Liste des livreurs</h2>

            <AddLivreur onLivreurAdded={fetchLivreurs} />

            {livreurs.length === 0 ? (
                <p>Aucun livreur trouvé.</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th>Disponible</th>
                    </tr>
                    </thead>
                    <tbody>
                    {livreurs.map(livreur => (
                        <tr key={livreur.id}>
                            <td>{livreur.nom}</td>
                            <td>{livreur.telephone}</td>
                            <td>{livreur.email}</td>
                            <td>{livreur.disponible ? '✅' : '❌'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Livreurs;
