// Structure de projet Vite + React + TypeScript
// Ce fichier est le point d’entrée App.tsx avec une base de back-office pour EcoDeli

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Accueil from './pages/Accueil.tsx';
import Utilisateurs from './pages/Utilisateurs.tsx';
import Livreurs from './pages/Livreurs.tsx';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/utilisateurs" element={<Utilisateurs />} />
          <Route path="/livreurs" element={<Livreurs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
