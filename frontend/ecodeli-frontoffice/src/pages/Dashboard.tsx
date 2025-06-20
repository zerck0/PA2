import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import DocumentSection from '../components/DocumentSection';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { annonceApi } from '../services/api';
import { Annonce } from '../types';
import { getRoleLabel } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    data: annonces, 
    loading: annoncesLoading, 
    execute: loadAnnonces 
  } = useApi<Annonce[]>(annonceApi.getAll);

  useEffect(() => {
    loadAnnonces();
  }, []);

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center">
          <p>Veuillez vous connecter pour accéder au dashboard.</p>
        </div>
      </Layout>
    );
  }

  const renderOverview = () => (
    <Card title="Vue d'ensemble">
      <div className="row">
        <div className="col-md-6">
          <h6>Informations personnelles</h6>
          <p><strong>Nom:</strong> {currentUser.user.prenom} {currentUser.user.nom}</p>
          <p><strong>Email:</strong> {currentUser.user.email}</p>
          <p><strong>Rôle:</strong> {getRoleLabel(currentUser.user.role)}</p>
        </div>
        <div className="col-md-6">
          <h6>Statistiques</h6>
          <p><strong>Annonces totales:</strong> {annonces?.length || 0}</p>
          <p><strong>Statut:</strong> Actif</p>
        </div>
      </div>
    </Card>
  );

  const renderAnnonces = () => (
    <Card title="Mes annonces">
      {annoncesLoading ? (
        <Loading />
      ) : (
        <div>
          {annonces && annonces.length > 0 ? (
            annonces.map((annonce) => (
              <div key={annonce.id} className="border p-3 mb-2 rounded">
                <h6>{annonce.titre}</h6>
                <p className="mb-1">{annonce.description}</p>
                <small className="text-muted">
                  {annonce.villeDepart} → {annonce.villeArrivee}
                  {annonce.prix && ` - ${annonce.prix}€`}
                </small>
              </div>
            ))
          ) : (
            <p>Aucune annonce trouvée.</p>
          )}
        </div>
      )}
    </Card>
  );

  const renderProfile = () => (
    <Card title="Mon profil">
      <form>
        <div className="mb-3">
          <label className="form-label">Prénom</label>
          <input 
            type="text" 
            className="form-control" 
            value={currentUser.user.prenom} 
            readOnly 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input 
            type="text" 
            className="form-control" 
            value={currentUser.user.nom} 
            readOnly 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            className="form-control" 
            value={currentUser.user.email} 
            readOnly 
          />
        </div>
        <Button variant="primary">Modifier le profil</Button>
      </form>
    </Card>
  );

  const renderDocuments = () => (
    <div>
      {currentUser.user.role === 'LIVREUR' && (
        <div className="mb-4">
          <DocumentSection
            userId={currentUser.user.id}
            documentType="PERMIS_CONDUIRE"
            title="Permis de conduire"
            required={true}
          />
        </div>
      )}
      
      {/* Documents pour tous les utilisateurs */}
      <div className="mb-4">
        <DocumentSection
          userId={currentUser.user.id}
          documentType="CARTE_IDENTITE"
          title="Carte d'identité"
          required={true}
        />
      </div>

      {/* Documents spécifiques selon le rôle */}
      {currentUser.user.role === 'COMMERCANT' && (
        <div className="mb-4">
          <DocumentSection
            userId={currentUser.user.id}
            documentType="KBIS"
            title="Extrait KBIS"
            required={true}
          />
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <h2 className="mb-4">Dashboard - {getRoleLabel(currentUser.user.role)}</h2>
      
      {/* Navigation simple */}
      <div className="mb-4">
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('overview')}
          className="me-2"
        >
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === 'annonces' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('annonces')}
          className="me-2"
        >
          Annonces
        </Button>
        <Button
          variant={activeTab === 'profile' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('profile')}
          className="me-2"
        >
          Profil
        </Button>
        <Button
          variant={activeTab === 'documents' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </Button>
      </div>

      {/* Contenu selon l'onglet */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'annonces' && renderAnnonces()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'documents' && renderDocuments()}
    </Layout>
  );
};

export default Dashboard;
