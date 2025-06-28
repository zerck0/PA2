declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: any;
          AutocompleteService: any;
          PlacesService: any;
          PlacesServiceStatus: any;
        };
        DistanceMatrixService: any;
        DistanceMatrixStatus: any;
        TravelMode: {
          DRIVING: string;
          WALKING: string;
          BICYCLING: string;
          TRANSIT: string;
        };
        UnitSystem: {
          METRIC: number;
          IMPERIAL: number;
        };
        geometry: {
          spherical: {
            computeDistanceBetween: (
              from: google.maps.LatLng, 
              to: google.maps.LatLng
            ) => number;
          };
        };
        LatLng: any;
        Geocoder: any;
        GeocoderStatus: any;
      };
    };
  }
}

// Types pour les réponses Google Places
export interface GooglePlace {
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

// Types pour les calculs de distance
export interface DistanceResult {
  distance: {
    text: string;
    value: number; // en mètres
  };
  duration: {
    text: string;
    value: number; // en secondes
  };
}

export interface DistanceCalculationResult {
  success: boolean;
  distance?: number; // en kilomètres
  duration?: number; // en minutes
  estimatedPrice?: number; // en euros
  error?: string;
}

export {};
