import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">EcoDeli</h1>
        <p className="lead">Livraisons écologiques et durables</p>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <Card title="Clients">
            <p>Faites livrer vos colis de manière écologique</p>
            <Link to="/annonces">
              <Button variant="primary">Voir les annonces</Button>
            </Link>
          </Card>
        </div>
        
        <div className="col-md-4 mb-4">
          <Card title="Livreurs">
            <p>Proposez vos services de livraison</p>
            <Link to="/register">
              <Button variant="success">Devenir livreur</Button>
            </Link>
          </Card>
        </div>
        
        <div className="col-md-4 mb-4">
          <Card title="Commerçants">
            <p>Optimisez vos livraisons</p>
            <Link to="/register">
              <Button variant="secondary">S'inscrire</Button>
            </Link>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
