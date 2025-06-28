/**
 * Service Google Places API - Version Custom
 * Utilise directement les API Google sans les widgets natifs
 */

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings?: Array<{
      offset: number;
      length: number;
    }>;
  };
  types: string[];
}

export interface PlaceDetails {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

class GooglePlacesService {
  private autocompleteService: any = null;
  private placesService: any = null;
  private isInitialized = false;

  /**
   * Initialise les services Google Places
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Attendre que Google Maps soit chargé
    if (!window.google?.maps?.places) {
      throw new Error('Google Maps Places API non disponible');
    }

    this.autocompleteService = new window.google.maps.places.AutocompleteService();
    this.placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );
    
    this.isInitialized = true;
    console.log('✅ GooglePlacesService initialisé');
  }

  /**
   * Recherche de suggestions d'adresses
   */
  async searchPlaces(input: string): Promise<PlacePrediction[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!input || input.length < 3) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const request = {
        input: input,
        componentRestrictions: { country: 'fr' },
        types: ['address'],
        language: 'fr'
      };

      this.autocompleteService.getPlacePredictions(
        request,
        (predictions: PlacePrediction[], status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(predictions || []);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.warn('Erreur Google Places:', status);
            resolve([]);
          }
        }
      );
    });
  }

  /**
   * Récupère les détails d'un lieu par son place_id
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const request = {
        placeId: placeId,
        fields: ['formatted_address', 'geometry', 'address_components']
      };

      this.placesService.getDetails(request, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve({
            formatted_address: place.formatted_address,
            geometry: {
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            },
            address_components: place.address_components
          });
        } else {
          console.warn('Erreur détails place:', status);
          resolve(null);
        }
      });
    });
  }

  /**
   * Extrait la ville depuis les composants d'adresse
   */
  extractCity(addressComponents: PlaceDetails['address_components']): string | null {
    const cityComponent = addressComponents.find(component =>
      component.types.includes('locality') ||
      component.types.includes('administrative_area_level_2')
    );
    
    return cityComponent ? cityComponent.long_name : null;
  }

  /**
   * Formatte le texte de suggestion avec highlight
   */
  formatSuggestionText(prediction: PlacePrediction, searchText: string): {
    main: string;
    secondary: string;
    highlighted: Array<{ text: string; isHighlighted: boolean }>;
  } {
    const mainText = prediction.structured_formatting.main_text;
    const secondaryText = prediction.structured_formatting.secondary_text;
    
    // Créer le highlighting basé sur le texte recherché
    const highlighted = this.highlightText(mainText, searchText);
    
    return {
      main: mainText,
      secondary: secondaryText,
      highlighted
    };
  }

  /**
   * Highlight le texte recherché
   */
  private highlightText(text: string, searchText: string): Array<{ text: string; isHighlighted: boolean }> {
    if (!searchText) {
      return [{ text, isHighlighted: false }];
    }

    const searchLower = searchText.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) {
      return [{ text, isHighlighted: false }];
    }

    const result = [];
    
    if (index > 0) {
      result.push({ text: text.substring(0, index), isHighlighted: false });
    }
    
    result.push({ 
      text: text.substring(index, index + searchText.length), 
      isHighlighted: true 
    });
    
    if (index + searchText.length < text.length) {
      result.push({ 
        text: text.substring(index + searchText.length), 
        isHighlighted: false 
      });
    }

    return result;
  }
}

// Export singleton
export const googlePlacesService = new GooglePlacesService();
export default googlePlacesService;
