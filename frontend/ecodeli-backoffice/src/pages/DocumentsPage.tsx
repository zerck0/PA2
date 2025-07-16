import React, { useState, useEffect } from 'react';
import { documentService, userService } from '../services/api';
import type { Document, User } from '../types';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('EN_ATTENTE');
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allDocs, allUsers] = await Promise.all([
        documentService.getAllDocuments(),
        userService.getAllUsers()
      ]);
      setDocuments(allDocs);
      setUsers(allUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (userId: number) => {
    return users.find(u => u.id === userId);
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'VALIDE': return 'badge-valide';
      case 'EN_ATTENTE': return 'badge-en-attente';
      case 'REFUSE': return 'badge-refuse';
      default: return 'bg-secondary';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'CARTE_IDENTITE': return 'bg-primary';
      case 'PERMIS_CONDUIRE': return 'bg-success';
      case 'KBIS': return 'bg-warning';
      case 'ASSURANCE_VEHICULE': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const handleValidateDocument = async (documentId: number, statut: 'VALIDE' | 'REFUSE') => {
    if (statut === 'REFUSE' && !commentaire.trim()) {
      alert('Un commentaire est requis pour refuser un document');
      return;
    }

    try {
      setValidatingId(documentId);
      setError('');
      
      console.log('Validation document:', { documentId, statut, commentaire: commentaire.trim() });
      
      await documentService.validateDocument({
        documentId,
        statut,
        commentaire: statut === 'REFUSE' ? commentaire.trim() : ''
      });
      
      await loadData();
      setCommentaire('');
      setSelectedDoc(null);
    } catch (err) {
      console.error('Erreur validation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
    } finally {
      setValidatingId(null);
    }
  };

  const openDocumentFile = async (documentId: number) => {
    try {
      const blob = await documentService.getDocumentFile(documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError('Erreur lors de l\'ouverture du document');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    statusFilter === 'ALL' || doc.statut === statusFilter
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Validation des documents</h1>
          <p className="text-muted mb-0">Gestion et validation des pièces justificatives</p>
        </div>
        <div>
          <span className="badge bg-primary fs-6">{filteredDocuments.length} document(s)</span>
        </div>
      </div>

      <div className="table-container mb-4">
        <div className="p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Statut</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDE">Validé</option>
                <option value="REFUSE">Refusé</option>
                <option value="ALL">Tous</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Type</th>
                <th>Document</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    Aucun document trouvé
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const user = getUserInfo(doc.utilisateurId);
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {user ? `${user.prenom} ${user.nom}` : 'Utilisateur inconnu'}
                          </div>
                          <small className="text-muted">
                            {user?.role} - ID: {doc.utilisateurId}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getTypeBadgeClass(doc.type)}`}>
                          {doc.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-link p-0"
                          onClick={() => openDocumentFile(doc.id)}
                        >
                          <i className="bi bi-file-earmark me-1"></i>
                          {doc.nom}
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${getStatutBadgeClass(doc.statut)}`}>
                          {doc.statut.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {doc.dateCreation ? (
                          new Date(doc.dateCreation).toLocaleDateString('fr-FR')
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {doc.statut === 'EN_ATTENTE' ? (
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-success btn-action"
                              onClick={() => handleValidateDocument(doc.id, 'VALIDE')}
                              disabled={validatingId === doc.id}
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button
                              className="btn btn-danger btn-action"
                              onClick={() => setSelectedDoc(doc)}
                              disabled={validatingId === doc.id}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDoc && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Refuser le document</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setSelectedDoc(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Vous êtes sur le point de refuser ce document :</p>
                <p><strong>{selectedDoc.nom}</strong></p>
                <div className="mb-3">
                  <label className="form-label">Commentaire (obligatoire)</label>
                  <textarea
                    className="form-control"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Expliquez la raison du refus..."
                    rows={3}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedDoc(null)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleValidateDocument(selectedDoc.id, 'REFUSE')}
                  disabled={!commentaire.trim() || validatingId === selectedDoc.id}
                >
                  Refuser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
