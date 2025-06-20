import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Alert from './ui/Alert';
import Loading from './ui/Loading';
import FileUpload from './FileUpload';

interface Document {
  id: number;
  nom: string;
  type: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  dateUpload: string;
  commentaireValidation?: string;
}

interface DocumentSectionProps {
  userId: number;
  documentType: string;
  title: string;
  required?: boolean;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({
  userId,
  documentType,
  title,
  required = false
}) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Charger le document existant
  useEffect(() => {
    loadDocument();
  }, [userId, documentType]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/documents/user/${userId}/type/${documentType}`);
      
      if (response.ok) {
        const doc = await response.json();
        setDocument(doc);
        setShowUpload(false);
      } else if (response.status === 404) {
        // Pas de document trouvé
        setDocument(null);
        setShowUpload(true);
      } else {
        throw new Error('Erreur lors du chargement du document');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    formData.append('type', documentType);

    const response = await fetch('http://localhost:8080/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de l\'upload');
    }

    // Recharger le document
    await loadDocument();
  };

  const getStatusBadge = (statut: string) => {
    const badges = {
      EN_ATTENTE: 'badge bg-warning text-dark',
      VALIDE: 'badge bg-success',
      REFUSE: 'badge bg-danger'
    };

    const labels = {
      EN_ATTENTE: 'En attente',
      VALIDE: 'Validé',
      REFUSE: 'Refusé'
    };

    return (
      <span className={badges[statut as keyof typeof badges]}>
        {labels[statut as keyof typeof labels]}
      </span>
    );
  };

  const getStatusMessage = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'Votre document est en cours de vérification par nos équipes.';
      case 'VALIDE':
        return 'Votre document a été validé avec succès !';
      case 'REFUSE':
        return 'Votre document a été refusé. Veuillez en télécharger un nouveau.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card title={title}>
        <Loading text="Chargement..." />
      </Card>
    );
  }

  return (
    <Card title={title}>
      {required && (
        <Alert type="info" className="mb-3">
          <strong>Document requis</strong> - Ce document est obligatoire pour valider votre profil.
        </Alert>
      )}

      {error && (
        <Alert type="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {document ? (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <strong>{document.nom}</strong>
              <br />
              <small className="text-muted">
                Téléchargé le {new Date(document.dateUpload).toLocaleDateString('fr-FR')}
              </small>
            </div>
            {getStatusBadge(document.statut)}
          </div>

          <Alert 
            type={document.statut === 'VALIDE' ? 'success' : document.statut === 'REFUSE' ? 'danger' : 'warning'}
            className="mb-3"
          >
            {getStatusMessage(document.statut)}
            {document.commentaireValidation && (
              <div className="mt-2">
                <strong>Commentaire:</strong> {document.commentaireValidation}
              </div>
            )}
          </Alert>

          {(document.statut === 'REFUSE' || document.statut === 'EN_ATTENTE') && (
            <div className="d-flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
              >
                {document.statut === 'REFUSE' ? 'Remplacer le document' : 'Modifier le document'}
              </Button>
            </div>
          )}

          {showUpload && (
            <div className="mt-3 p-3 border rounded">
              <h6>Télécharger un nouveau document</h6>
              <FileUpload onUpload={handleUpload} />
            </div>
          )}
        </div>
      ) : (
        <div>
          {showUpload ? (
            <FileUpload onUpload={handleUpload} />
          ) : (
            <div className="text-center py-3">
              <p className="text-muted">Aucun document téléchargé</p>
              <Button variant="primary" onClick={() => setShowUpload(true)}>
                Télécharger {title.toLowerCase()}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default DocumentSection;
