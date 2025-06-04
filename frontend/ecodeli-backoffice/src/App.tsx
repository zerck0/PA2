// Structure de projet Vite + React + TypeScript
// Ce fichier est le point d'entrée App.tsx avec une base de back-office pour EcoDeli

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Accueil from './pages/Accueil.tsx';
import Utilisateurs from './pages/Utilisateurs.tsx';
import Livreurs from './pages/Livreurs.tsx';
import Annonces from './pages/Annonces.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/utilisateurs" element={<Utilisateurs />} />
          <Route path="/livreurs" element={<Livreurs />} />
          <Route path="/annonces" element={<Annonces />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
