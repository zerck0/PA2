import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="container">
          <h1>EcoDeli</h1>
          <p className="lead">
            La plateforme qui révolutionne vos livraisons<br />
            avec une approche écologique et solidaire
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              <i className="bi bi-arrow-right me-2"></i>
              Rejoindre EcoDeli
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="row g-4">
            {/* Client */}
            <div className="col-lg-3 col-md-6">
              <div className="card service-card h-100 text-center p-4">
                <div className="card-body">
                  <i className="bi bi-box-seam service-icon"></i>
                  <h5 className="card-title">Clients</h5>
                  <p className="card-text">
                    Expédiez vos colis de manière éco-responsable et économique
                  </p>
                  <Link to="/annonces" className="btn btn-outline-primary">
                    Voir les annonces
                  </Link>
                </div>
              </div>
            </div>

            {/* Livreur */}
            <div className="col-lg-3 col-md-6">
              <div className="card service-card h-100 text-center p-4">
                <div className="card-body">
                  <i className="bi bi-bicycle service-icon"></i>
                  <h5 className="card-title">Livreurs</h5>
                  <p className="card-text">
                    Proposez vos services de livraison et gagnez de l'argent
                  </p>
                  <Link to="/register" className="btn btn-outline-primary">
                    Devenir livreur
                  </Link>
                </div>
              </div>
            </div>

            {/* Prestataire */}
            <div className="col-lg-3 col-md-6">
              <div className="card service-card h-100 text-center p-4">
                <div className="card-body">
                  <i className="bi bi-tools service-icon"></i>
                  <h5 className="card-title">Prestataires</h5>
                  <p className="card-text">
                    Offrez vos services spécialisés dans l'écosystème EcoDeli
                  </p>
                  <Link to="/register" className="btn btn-outline-primary">
                    Proposer mes services
                  </Link>
                </div>
              </div>
            </div>

            {/* Commerçant */}
            <div className="col-lg-3 col-md-6">
              <div className="card service-card h-100 text-center p-4">
                <div className="card-body">
                  <i className="bi bi-shop service-icon"></i>
                  <h5 className="card-title">Commerçants</h5>
                  <p className="card-text">
                    Optimisez vos livraisons avec notre réseau de partenaires
                  </p>
                  <Link to="/register" className="btn btn-outline-primary">
                    Rejoindre le réseau
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Avantages */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4">
              <i className="bi bi-leaf text-success" style={{fontSize: '2.5rem'}}></i>
              <h5 className="mt-3">Écologique</h5>
              <p className="text-muted">Réduisez votre empreinte carbone avec nos solutions durables</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-people text-primary" style={{fontSize: '2.5rem'}}></i>
              <h5 className="mt-3">Solidaire</h5>
              <p className="text-muted">Soutenez l'économie locale et l'emploi de proximité</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-lightning text-warning" style={{fontSize: '2.5rem'}}></i>
              <h5 className="mt-3">Efficace</h5>
              <p className="text-muted">Livraisons rapides et fiables grâce à notre réseau optimisé</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
