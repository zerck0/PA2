/**
 * Composant de filtres de recherche pour les annonces
 * Compatible avec le nouveau système de hooks et types refactorisé
 */

import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { AnnonceFilters, DeliveryType } from '../../types';
import { DELIVERY_TYPES } from '../../constants/appConfig';

/**
 * Props du composant SearchFilters
 */
interface SearchFiltersProps {
  filters: AnnonceFilters;
  onFilterChange: (filters: Partial<AnnonceFilters>) => void;
  onSearch: (filters: AnnonceFilters) => void;
  onClear: () => void;
  isLoading?: boolean;
}

/**
 * Composant pour filtrer et rechercher les annonces
 * Utilise les nouveaux types centralisés
 */
const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onClear,
  isLoading = false
}) => {
  // État local pour les filtres avancés
  const [showAdvanced, setShowAdvanced] = useState(false);

  /**
   * Gestion de la soumission du formulaire
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  /**
   * Mise à jour d'un champ de filtre
   */
  const updateFilter = (key: keyof AnnonceFilters, value: any) => {
    onFilterChange({ [key]: value });
  };

  /**
   * Effacement des filtres
   */
  const handleClear = () => {
    onClear();
    setShowAdvanced(false);
  };

  return (
    <Card className="h-fit">
      <Card.Header>
        <h6 className="mb-0">
          <i className="bi bi-funnel me-2"></i>
          Filtres de recherche
        </h6>
      </Card.Header>
      
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {/* Recherche textuelle */}
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-search me-1"></i>
              Recherche
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Titre, description, ville..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              disabled={isLoading}
            />
          </Form.Group>

          {/* Type de livraison */}
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-truck me-1"></i>
              Type de livraison
            </Form.Label>
            <Form.Select
              value={filters.typelivraison || ''}
              onChange={(e) => updateFilter('typelivraison', e.target.value as DeliveryType)}
              disabled={isLoading}
            >
              <option value="">Tous les types</option>
              <option value={DELIVERY_TYPES.EXPRESS}>Express</option>
              <option value={DELIVERY_TYPES.STANDARD}>Standard</option>
              <option value={DELIVERY_TYPES.ECONOMIQUE}>Économique</option>
            </Form.Select>
          </Form.Group>

          {/* Ville */}
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-geo-alt me-1"></i>
              Ville
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Paris, Lyon, Marseille..."
              value={filters.ville || ''}
              onChange={(e) => updateFilter('ville', e.target.value)}
              disabled={isLoading}
            />
          </Form.Group>

          {/* Bouton pour afficher/cacher les filtres avancés */}
          <div className="mb-3">
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className={`bi bi-chevron-${showAdvanced ? 'up' : 'down'} me-1`}></i>
              Filtres avancés
            </Button>
          </div>

          {/* Filtres avancés */}
          {showAdvanced && (
            <>
              {/* Plage de prix */}
              <Row className="mb-3">
                <Col>
                  <Form.Label>
                    <i className="bi bi-currency-euro me-1"></i>
                    Prix minimum
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={filters.prixMin || ''}
                    onChange={(e) => updateFilter('prixMin', parseFloat(e.target.value) || undefined)}
                    disabled={isLoading}
                  />
                </Col>
                <Col>
                  <Form.Label>Prix maximum</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    value={filters.prixMax || ''}
                    onChange={(e) => updateFilter('prixMax', parseFloat(e.target.value) || undefined)}
                    disabled={isLoading}
                  />
                </Col>
              </Row>

              {/* Plage de dates */}
              <Row className="mb-3">
                <Col>
                  <Form.Label>
                    <i className="bi bi-calendar me-1"></i>
                    Date début
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateDebut || ''}
                    onChange={(e) => updateFilter('dateDebut', e.target.value)}
                    disabled={isLoading}
                  />
                </Col>
                <Col>
                  <Form.Label>Date fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateFin || ''}
                    onChange={(e) => updateFilter('dateFin', e.target.value)}
                    disabled={isLoading}
                  />
                </Col>
              </Row>
            </>
          )}

          {/* Boutons d'action */}
          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Recherche...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  Rechercher
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleClear}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Effacer les filtres
            </Button>
          </div>
        </Form>

        {/* Indicateurs de filtres actifs */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              {Object.keys(filters).length} filtre{Object.keys(filters).length > 1 ? 's' : ''} actif{Object.keys(filters).length > 1 ? 's' : ''}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SearchFilters;
