import React, { useEffect, useState } from 'react';

interface Utilisateur {
  id: number;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
}

function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/utilisateurs')
      .then(res => res.json())
      .then(data => setUtilisateurs(data));
  }, []);

  return (
    <div>
      <h2>Utilisateurs</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
          </tr>
        </thead>
        <tbody>
          {utilisateurs.map(user => (
            <tr key={user.id}>
              <td>{user.nom} {user.prenom}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Utilisateurs;
