import React, { useState, useRef, useEffect, useCallback } from 'react';
import Input from './Input';
import AddressDropdown from './AddressDropdown';
import { loadGoogleMapsAPI, waitForGoogleMaps } from '../../utils/googleMapsLoader';
import googlePlacesService, { PlacePrediction } from '../../services/googlePlacesService';

interface AddressInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCityChange?: (city: string) => void;
  placeholder?: string;
  required?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({
  label,
  value,
  onChange,
  onCityChange,
  placeholder,
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce pour la recherche
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Initialiser Google Places Service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await loadGoogleMapsAPI();
        await waitForGoogleMaps();
        await googlePlacesService.initialize();
        setIsInitialized(true);
        console.log('✅ AddressInput: Google Places Service initialisé');
      } catch (error) {
        console.error('❌ AddressInput: Erreur initialisation:', error);
      }
    };

    initializeService();
  }, []);

  // Rechercher des suggestions
  const searchSuggestions = useCallback(async (query: string) => {
    if (!isInitialized || query.length < 3) {
      setSuggestions([]);
      setIsDropdownVisible(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const results = await googlePlacesService.searchPlaces(query);
      setSuggestions(results);
      setIsDropdownVisible(results.length > 0 || query.length >= 3);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Erreur recherche suggestions:', error);
      setSuggestions([]);
      setIsDropdownVisible(false);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Gérer la saisie avec debounce
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Annuler la recherche précédente
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Programmer une nouvelle recherche
    const timeout = setTimeout(() => {
      searchSuggestions(newValue);
    }, 300); // Debounce de 300ms

    setSearchTimeout(timeout);

    // Extraction simple de la ville pour le fallback manuel
    if (onCityChange && newValue.includes(',')) {
      const parts = newValue.split(',');
      const city = parts[parts.length - 1].trim();
      onCityChange(city);
    }
  };

  // Sélectionner une suggestion
  const handleSelectSuggestion = async (suggestion: PlacePrediction) => {
    try {
      const details = await googlePlacesService.getPlaceDetails(suggestion.place_id);
      
      if (details) {
        onChange(details.formatted_address);
        
        // Extraire la ville
        if (onCityChange) {
          const city = googlePlacesService.extractCity(details.address_components);
          if (city) {
            onCityChange(city);
          }
        }
      } else {
        // Fallback sur la description de la suggestion
        onChange(suggestion.description);
      }
      
      setIsDropdownVisible(false);
      setSuggestions([]);
      setSelectedIndex(-1);
      
    } catch (error) {
      console.error('Erreur sélection suggestion:', error);
      // Fallback sur la description
      onChange(suggestion.description);
      setIsDropdownVisible(false);
    }
  };

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownVisible || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setIsDropdownVisible(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // Gérer le focus/blur
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsDropdownVisible(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsDropdownVisible(false);
      }
    }, 150);
  };

  // Cliquer à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Nettoyage du timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div ref={containerRef} className="position-relative">
      <Input
        ref={inputRef}
        label={label}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "Saisissez une adresse complète"}
        required={required}
        autoComplete="off"
      />
      
      <AddressDropdown
        suggestions={suggestions}
        isVisible={isDropdownVisible}
        selectedIndex={selectedIndex}
        searchText={value}
        isLoading={isLoading}
        onSelect={handleSelectSuggestion}
        onMouseEnter={setSelectedIndex}
      />
      
      {/* Indicateur d'état */}
      {isInitialized ? (
        <small className="text-muted d-flex align-items-center mt-1">
          <i className="bi bi-geo-alt-fill text-success me-1"></i>
          Autocomplétion Google Places activée
        </small>
      ) : (
        <small className="text-muted d-flex align-items-center mt-1">
          <i className="bi bi-info-circle text-warning me-1"></i>
          Chargement de l'autocomplétion...
        </small>
      )}
    </div>
  );
};

export default AddressInput;
