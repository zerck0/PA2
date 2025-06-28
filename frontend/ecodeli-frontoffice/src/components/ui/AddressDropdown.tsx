import React from 'react';
import { PlacePrediction } from '../../services/googlePlacesService';

interface AddressDropdownProps {
  suggestions: PlacePrediction[];
  isVisible: boolean;
  selectedIndex: number;
  searchText: string;
  isLoading: boolean;
  onSelect: (suggestion: PlacePrediction) => void;
  onMouseEnter: (index: number) => void;
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({
  suggestions,
  isVisible,
  selectedIndex,
  searchText,
  isLoading,
  onSelect,
  onMouseEnter
}) => {
  if (!isVisible) return null;

  const renderHighlightedText = (text: string, searchText: string) => {
    if (!searchText) return text;

    const searchLower = searchText.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <strong className="text-primary">
          {text.substring(index, index + searchText.length)}
        </strong>
        {text.substring(index + searchText.length)}
      </>
    );
  };

  return (
    <div className="address-dropdown">
      <div className="dropdown-content">
        {isLoading && (
          <div className="dropdown-item loading-item">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span className="visually-hidden">Recherche...</span>
              </div>
              <span className="text-muted">Recherche d'adresses...</span>
            </div>
          </div>
        )}

        {!isLoading && suggestions.length === 0 && searchText.length >= 3 && (
          <div className="dropdown-item no-results">
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-search me-2"></i>
              <span>Aucune adresse trouvée pour "{searchText}"</span>
            </div>
          </div>
        )}

        {!isLoading && suggestions.map((suggestion, index) => (
          <div
            key={suggestion.place_id}
            className={`dropdown-item suggestion-item ${
              index === selectedIndex ? 'selected' : ''
            }`}
            onClick={() => onSelect(suggestion)}
            onMouseEnter={() => onMouseEnter(index)}
          >
            <div className="suggestion-content">
              <div className="main-text">
                <i className="bi bi-geo-alt text-muted me-2"></i>
                {renderHighlightedText(suggestion.structured_formatting.main_text, searchText)}
              </div>
              {suggestion.structured_formatting.secondary_text && (
                <div className="secondary-text text-muted">
                  {suggestion.structured_formatting.secondary_text}
                </div>
              )}
            </div>
          </div>
        ))}

        {!isLoading && suggestions.length > 0 && (
          <div className="dropdown-footer">
            <div className="d-flex align-items-center justify-content-center text-muted">
              <small>Alimenté par Google</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressDropdown;
