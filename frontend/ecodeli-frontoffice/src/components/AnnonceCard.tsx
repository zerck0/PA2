import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

interface Annonce {
  id: number;
  titre: string;
  description: string;
  prix?: number;
  villeDepart: string;
  villeArrivee: string;
  dateCreation: string;
  utilisateur: {
    nom: string;
    prenom: string;
  };
}

interface AnnonceCardProps {
  annonce: Annonce;
  onContact?: (annonceId: number) => void;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce, onContact }) => {
  return (
    <Card className="mb-3">
      <h5 className="card-title">{annonce.titre}</h5>
      <p className="card-text">{annonce.description}</p>
      
      <div className="row mb-2">
        <div className="col-6">
          <small className="text-muted">De: {annonce.villeDepart}</small>
        </div>
        <div className="col-6">
          <small className="text-muted">Vers: {annonce.villeArrivee}</small>
        </div>
      </div>
      
      <div className="d-flex justify-content-between align-items-center">
        <div>
          {annonce.prix && <span className="h6 text-primary">{annonce.prix}€</span>}
          <br />
          <small className="text-muted">
            Par {annonce.utilisateur.prenom} {annonce.utilisateur.nom}
          </small>
        </div>
        
        {onContact && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => onContact(annonce.id)}
          >
            Contacter
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AnnonceCard;
