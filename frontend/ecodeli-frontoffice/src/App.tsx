import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Livraison from './pages/Livraison';
import Stockage from './pages/Stockage';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Annonces from './pages/Annonces';
import CreateAnnonce from './pages/CreateAnnonce';
import Messages from './pages/Messages';
import LivreurAnnonces from './pages/LivreurAnnonces';
import LivreurMissions from './pages/LivreurMissions';
import CommercantContrats from './pages/CommercantContrats';
import TestNavigation from './pages/TestNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/services" element={<Services />} />
              <Route path="/livraison" element={<Livraison />} />
              <Route path="/stockage" element={<Stockage />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/test-navigation" element={<TestNavigation />} />
              <Route path="/annonces" element={<Annonces />} />
              
              {/* Routes protégées - utilisateur connecté */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/annonces/creer" element={<CreateAnnonce />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Dashboard />} />
                <Route path="/settings" element={<Dashboard />} />
              </Route>
              
              {/* Routes protégées - LIVREUR */}
              <Route element={<ProtectedRoute requiredRoles={['LIVREUR']} />}>
                <Route path="/livreur/annonces" element={<LivreurAnnonces />} />
                <Route path="/livreur/missions" element={<LivreurMissions />} />
              </Route>
              
              {/* Routes protégées - COMMERCANT */}
              <Route element={<ProtectedRoute requiredRoles={['COMMERCANT']} />}>
                <Route path="/commercant/contrats" element={<CommercantContrats />} />
                <Route path="/commercant/annonces" element={<Annonces />} />
              </Route>
              
              {/* Routes protégées - CLIENT */}
              <Route element={<ProtectedRoute requiredRoles={['CLIENT']} />}>
                <Route path="/client/annonces" element={<Annonces />} />
              </Route>
              
              {/* Routes protégées - PRESTATAIRE */}
              <Route element={<ProtectedRoute requiredRoles={['PRESTATAIRE']} />}>
                <Route path="/prestataire/prestations" element={<Dashboard />} />
                <Route path="/prestataire/calendrier" element={<Dashboard />} />
              </Route>
              
              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
