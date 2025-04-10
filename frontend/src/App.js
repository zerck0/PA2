import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Livreurs from './pages/Livreurs';
import AddLivreur from './pages/AddLivreur';
import Utilisateurs from './pages/Utilisateurs';
import Inscription from './pages/Inscription';

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/livreurs" element={<Livreurs />} />
                    <Route path="/ajouter-livreur" element={<AddLivreur />} />
                    <Route path="/utilisateurs" element={<Utilisateurs />} />
                    <Route path="/inscription" element={<Inscription />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
